import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  BILLING_CYCLE_LABELS,
  BILLING_CYCLE_OPTIONS,
} from '@/src/constants/app';
import {
  CATEGORY_OPTIONS,
  type CategoryOption,
  type BillingCycle,
  type SubscriptionStatus,
  type SubscriptionFormData,
  type Currency,
} from '@/src/types';
import { useSubscription } from '@/src/hooks/useSubscription';
import { SelectField } from '@/src/components/ui/SelectField';
import { TextInput } from '@/src/components/ui/TextInput';
import { DatePickerField } from '@/src/components/ui/DatePickerField';
import { Button } from '@/src/components/ui/Button';
import { AmountField } from '@/src/components/ui/AmountField';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { ServiceNameAutocomplete } from '@/src/components/subscription/ServiceNameAutocomplete';
import type { ServiceDictionaryEntry } from '@/src/types';
import { COLORS } from '@/src/constants/colors';
import { formatDisplayDate, suggestNextRenewalDate, isOverdueRenewal } from '@/src/utils/dateUtils';
import { formatAmount, toMonthlyAmount, toJPY } from '@/src/utils/amountUtils';
import { useUiPrefsStore } from '@/src/stores/uiPrefsStore';
import { USD_TO_JPY_RATE } from '@/src/constants/app';
import { isSafeUrl, validateSubscriptionForm, type SubscriptionFormErrors } from '@/src/utils/validationUtils';
import { subscriptionToFormData } from '@/src/utils/subscriptionUtils';

// ステータスフローの順序定義
const STATUS_FLOW: { status: string; label: string }[] = [
  { status: 'active', label: '継続中' },
  { status: 'reviewing', label: '見直す' },
  { status: 'cancel_planned', label: '解約する' },
  { status: 'stopped', label: '解約済み' },
];

function DetailRow({
  label,
  value,
  actionLabel,
  onAction,
}: {
  label: string;
  value: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.detailValueRow}>
        <Text style={styles.detailValue}>{value}</Text>
        {actionLabel && onAction && (
          <TouchableOpacity onPress={onAction} style={styles.detailActionBtn} activeOpacity={0.7}>
            <Text style={styles.detailActionText}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function SubscriptionDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  // useLocalSearchParams は string[] を返すことがあるため単一値に正規化
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const { current, isLoading, save, permanentlyDelete } = useSubscription(id);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const usdRate = useUiPrefsStore((s) => s.usdToJpyRate ?? USD_TO_JPY_RATE);
  // インライン確認UI用 state
  const [confirmAction, setConfirmAction] = useState<'hide' | 'delete' | null>(null);
  // 更新日繰り越し提案（インラインバナー用）
  const [suggestedRenewalDate, setSuggestedRenewalDate] = useState<string | null>(null);

  // 編集フォームの state
  const [serviceName, setServiceName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('JPY');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [category, setCategory] = useState<CategoryOption | null>(null);
  const [status, setStatus] = useState<SubscriptionStatus>('active');
  const [nextRenewalDate, setNextRenewalDate] = useState('');
  const [trialEndDate, setTrialEndDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [memo, setMemo] = useState('');
  const [customCancelUrl, setCustomCancelUrl] = useState('');
  const [errors, setErrors] = useState<SubscriptionFormErrors>({});
  const [showDetails, setShowDetails] = useState(false);

  const startEditing = () => {
    if (!current) return;
    setServiceName(current.serviceName);
    setAmount(current.amount > 0 ? String(current.amount) : '');
    setCurrency(current.currency ?? 'JPY');
    setBillingCycle(current.billingCycle);
    setCategory(current.category);
    setStatus(current.status);
    setTrialEndDate(current.trialEndDate ?? '');
    setStartDate(current.startDate ?? '');
    setMemo(current.memo ?? '');
    setCustomCancelUrl(current.customCancelUrl ?? '');

    // 更新日が過去 → インラインバナーで次回周期への繰り越しを提案
    const suggested = suggestNextRenewalDate(current.nextRenewalDate, current.billingCycle);
    setNextRenewalDate(current.nextRenewalDate ?? '');
    setSuggestedRenewalDate(suggested);

    // 詳細フィールドにひとつでも値があれば自動展開
    setShowDetails(!!(current.category || current.trialEndDate || current.startDate || current.memo || current.customCancelUrl));

    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!current) return;
    const nextErrors = validateSubscriptionForm({
      serviceName,
      billingCycle,
      amount,
      currency,
      nextRenewalDate,
      trialEndDate,
      startDate,
      customCancelUrl,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);

    const formData: SubscriptionFormData = {
      serviceName: serviceName.trim(),
      amount: billingCycle === 'free' ? 0 : Number(amount),
      currency: billingCycle === 'free' ? undefined : currency,
      billingCycle,
      category,
      status,
      nextRenewalDate: nextRenewalDate || null,
      trialEndDate: trialEndDate || null,
      startDate: startDate || null,
      memo: memo || null,
      cancelMemo: null,
      customCancelUrl: customCancelUrl.trim() || null,
      isArchived: current.isArchived,
    };

    const result = await save(formData);
    setIsSaving(false);

    if (result.ok) {
      setSaveError(false);
      setIsEditing(false);
    } else {
      setSaveError(true);
    }
  };

  const executeHide = async () => {
    if (!current) return;
    const result = await save(subscriptionToFormData(current, { isArchived: !current.isArchived }));
    if (result.ok) router.back();
  };

  const executeDelete = () => {
    permanentlyDelete();
    router.replace('/(main)');
  };

  const handleQuickStatusChange = async (newStatus: SubscriptionStatus) => {
    if (!current) return;
    await save(subscriptionToFormData(current, { status: newStatus }));
  };

  /** VIEW モードで更新日を次回サイクルへ一発繰り越す */
  const handleRolloverRenewalDate = async () => {
    if (!current) return;
    const suggested = suggestNextRenewalDate(current.nextRenewalDate, current.billingCycle);
    if (!suggested) return;
    await save(subscriptionToFormData(current, { nextRenewalDate: suggested }));
  };

  // ─── ローディング中 / データなし ───
  if (isLoading || !current) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>詳細</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  // ─── 編集モード ───
  if (isEditing) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setIsEditing(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>編集</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.sectionTitle}>基本情報</Text>
            <View style={styles.section}>
              <ServiceNameAutocomplete
                label="サービス名 *"
                value={serviceName}
                onChangeText={setServiceName}
                onSelectSuggestion={(entry: ServiceDictionaryEntry) => setServiceName(entry.name)}
                error={errors.serviceName}
                maxLength={50}
              />
              <SelectField
                label="支払いサイクル *"
                value={billingCycle}
                options={BILLING_CYCLE_OPTIONS}
                displayLabel={(v) => BILLING_CYCLE_LABELS[v]}
                onChange={(v) => v && setBillingCycle(v)}
              />
              <AmountField
                billingCycle={billingCycle}
                amount={amount}
                currency={currency}
                onChangeAmount={setAmount}
                onToggleCurrency={() => setCurrency((c) => (c === 'JPY' ? 'USD' : 'JPY'))}
                error={errors.amount}
              />
              {/* 更新日過期バナー */}
              {suggestedRenewalDate && (
                <View style={styles.renewalBanner}>
                  <Ionicons name="time-outline" size={16} color={COLORS.warning.text} />
                  <View style={styles.renewalBannerBody}>
                    <Text style={styles.renewalBannerText}>
                      {`更新日が過ぎています。\n次の更新日 ${formatDisplayDate(suggestedRenewalDate)} に更新しますか？`}
                    </Text>
                    <View style={styles.renewalBannerActions}>
                      <TouchableOpacity
                        onPress={() => {
                          setNextRenewalDate(suggestedRenewalDate);
                          setSuggestedRenewalDate(null);
                        }}
                        style={styles.bannerBtn}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.bannerBtnText}>更新する</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setSuggestedRenewalDate(null)}
                        style={styles.bannerBtnGhost}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.bannerBtnGhostText}>このまま</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
              <DatePickerField label="次回更新日" value={nextRenewalDate} onChange={setNextRenewalDate} error={errors.nextRenewalDate} />
            </View>

            <TouchableOpacity
              style={styles.detailsToggleRow}
              onPress={() => setShowDetails((v) => !v)}
              activeOpacity={0.7}
            >
              <Text style={[styles.sectionTitle, styles.detailsToggleTitle]}>詳細・メモ（任意）</Text>
              <Ionicons
                name={showDetails ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
            {showDetails && (
              <View style={styles.section}>
                <SelectField
                  label="カテゴリ"
                  value={category}
                  options={CATEGORY_OPTIONS}
                  displayLabel={(v) => v}
                  onChange={setCategory}
                  clearable
                />
                <DatePickerField label="試用終了日" value={trialEndDate} onChange={setTrialEndDate} error={errors.trialEndDate} />
                <DatePickerField label="利用開始日" value={startDate} onChange={setStartDate} error={errors.startDate} />
                <TextInput
                  label="参考URL"
                  value={customCancelUrl}
                  onChangeText={setCustomCancelUrl}
                  placeholder="マイページや解約ページのURL..."
                  autoCapitalize="none"
                  keyboardType="url"
                  error={errors.customCancelUrl}
                />
                <TextInput
                  label="メモ（任意）"
                  value={memo}
                  onChangeText={setMemo}
                  placeholder="自由にメモ..."
                  multiline
                  numberOfLines={3}
                  style={styles.textarea}
                />
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {saveError && (
              <Text style={styles.saveErrorText}>保存できませんでした。もう一度試してください。</Text>
            )}
            <Button label="保存する" onPress={handleSave} loading={isSaving} fullWidth />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ─── 表示モード ───
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {current.serviceName}
        </Text>
        <TouchableOpacity onPress={startEditing}>
          <Ionicons name="pencil-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* サマリーカード */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryAmountCol}>
              <Text style={styles.summaryAmount}>
                {current.billingCycle === 'free'
                  ? '無料'
                  : `${formatAmount(current.amount, current.currency ?? 'JPY')} / ${BILLING_CYCLE_LABELS[current.billingCycle]}`}
              </Text>
              {/* 月額JPY換算サブ行: 一覧表示との一貫性のため、月払いJPY以外に表示 */}
              {(() => {
                const cur = current.currency ?? 'JPY';
                const isMonthlyJPY = current.billingCycle === 'monthly' && cur === 'JPY';
                if (
                  current.billingCycle === 'free' ||
                  current.amount === 0 ||
                  current.billingCycle === 'irregular' ||
                  isMonthlyJPY
                ) return null;
                const monthlyRaw = toMonthlyAmount(current.amount, current.billingCycle) ?? 0;
                const monthlyJPY = toJPY(monthlyRaw, cur, usdRate);
                return (
                  <Text style={styles.summaryAmountHint}>{`月換算 ${formatAmount(monthlyJPY, 'JPY')}`}</Text>
                );
              })()}
            </View>
            <StatusBadge status={current.status} />
          </View>
          {current.category && <Text style={styles.category}>{current.category}</Text>}

          {/* クイックアクション: ステータス切り替え */}
          <Text style={styles.nextActionLabel}>{current.status === 'stopped' ? 'ステータスを変更' : '次のアクション'}</Text>
          <View style={styles.quickActions}>
            {current.status === 'active' && (
              <>
                <TouchableOpacity
                  style={[styles.quickBtn, styles.quickBtnReviewing]}
                  onPress={() => handleQuickStatusChange('reviewing')}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.quickBtnText, styles.quickBtnTextReviewing]}>見直す</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickBtn, styles.quickBtnCancel]}
                  onPress={() => handleQuickStatusChange('cancel_planned')}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.quickBtnText, styles.quickBtnTextCancel]}>解約する</Text>
                </TouchableOpacity>
              </>
            )}
            {current.status === 'reviewing' && (
              <>
                <TouchableOpacity
                  style={[styles.quickBtn, styles.quickBtnGhost]}
                  onPress={() => handleQuickStatusChange('active')}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.quickBtnText, styles.quickBtnTextGhost]}>継続中に戻す</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickBtn, styles.quickBtnCancel]}
                  onPress={() => handleQuickStatusChange('cancel_planned')}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.quickBtnText, styles.quickBtnTextCancel]}>解約する</Text>
                </TouchableOpacity>
              </>
            )}
            {current.status === 'cancel_planned' && (
              <>
                <TouchableOpacity
                  style={[styles.quickBtn, styles.quickBtnGhost]}
                  onPress={() => handleQuickStatusChange('active')}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.quickBtnText, styles.quickBtnTextGhost]}>継続中に戻す</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickBtn, styles.quickBtnStopped]}
                  onPress={() => handleQuickStatusChange('stopped')}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.quickBtnText, styles.quickBtnTextStopped]}>解約済みにする</Text>
                </TouchableOpacity>
              </>
            )}
            {current.status === 'stopped' && (
              <TouchableOpacity
                style={[styles.quickBtn, styles.quickBtnGhost]}
                onPress={() => handleQuickStatusChange('active')}
                activeOpacity={0.75}
              >
                <Text style={[styles.quickBtnText, styles.quickBtnTextGhost]}>継続中に戻す</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 更新日未設定のnudge */}
        {!current.nextRenewalDate &&
          current.status === 'active' &&
          current.billingCycle !== 'free' &&
          current.billingCycle !== 'irregular' && (
          <TouchableOpacity style={styles.nudgeBanner} onPress={startEditing} activeOpacity={0.7}>
            <Ionicons name="calendar-outline" size={15} color={COLORS.primary} />
            <Text style={styles.nudgeText}>{'次回更新日を設定すると\n更新アラートが使えます'}</Text>
            <Text style={styles.nudgeLink}>設定する →</Text>
          </TouchableOpacity>
        )}

        {/* 詳細行: 表示する行がある場合のみ描画 */}
        {(current.nextRenewalDate || current.trialEndDate || current.startDate || current.cancelledAt) && (
          <View style={styles.detailSection}>
            {current.nextRenewalDate && (
              <DetailRow
                label="次回更新日"
                value={formatDisplayDate(current.nextRenewalDate)}
                actionLabel={
                  current.status === 'active' &&
                  isOverdueRenewal(current.nextRenewalDate) &&
                  current.billingCycle !== 'free' &&
                  current.billingCycle !== 'irregular'
                    ? '繰り越す'
                    : undefined
                }
                onAction={handleRolloverRenewalDate}
              />
            )}
            {current.trialEndDate && (
              <DetailRow label="試用終了日" value={formatDisplayDate(current.trialEndDate)} />
            )}
            {current.startDate && (
              <DetailRow label="利用開始日" value={formatDisplayDate(current.startDate)} />
            )}
            {current.cancelledAt && current.status === 'stopped' && (
              <DetailRow label="解約日" value={formatDisplayDate(current.cancelledAt)} />
            )}
          </View>
        )}

        {/* メモ・解約URL */}
        {(current.memo || current.cancelMemo || (current.customCancelUrl && isSafeUrl(current.customCancelUrl))) && (
          <View style={styles.memoSection}>
            {current.memo && <Text style={styles.memo}>{current.memo}</Text>}
            {current.cancelMemo && (
              <Text style={styles.cancelMemo}>解約メモ: {current.cancelMemo}</Text>
            )}
            {current.customCancelUrl && isSafeUrl(current.customCancelUrl) && (
              <TouchableOpacity
                onPress={() => Linking.openURL(current.customCancelUrl!)}
                activeOpacity={0.7}
                style={styles.cancelUrlRow}
              >
                <Ionicons name="link-outline" size={14} color={COLORS.primary} />
                <Text style={styles.cancelUrl} numberOfLines={1}>
                  参考URLを見る
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* 非表示 / 削除 */}
        <View style={styles.actionSection}>
          {confirmAction === 'hide' ? (
            <View style={styles.confirmCard}>
              <Text style={styles.confirmTitle}>
                {current.isArchived ? '一覧に戻しますか？' : '非表示にしますか？'}
              </Text>
              {!current.isArchived && (
                <Text style={styles.confirmDesc}>
                  {'データは保持されますが、月額合計の集計からは除外されます。\n解約済みにするには「解約済みにする」をお使いください。'}
                </Text>
              )}
              <View style={styles.confirmButtons}>
                <Button
                  label="キャンセル"
                  onPress={() => setConfirmAction(null)}
                  variant="ghost"
                  size="sm"
                  style={styles.confirmBtn}
                />
                <Button
                  label={current.isArchived ? '一覧に戻す' : '非表示にする'}
                  onPress={executeHide}
                  variant="primary"
                  size="sm"
                  style={styles.confirmBtn}
                />
              </View>
            </View>
          ) : confirmAction === 'delete' ? (
            <View style={styles.confirmCardDestructive}>
              <Text style={styles.confirmTitleDestructive}>
                「{current.serviceName}」を削除しますか？
              </Text>
              <Text style={styles.confirmDescDestructive}>
                記録ごと消えます。この操作は取り消せません
              </Text>
              <View style={styles.confirmButtons}>
                <Button
                  label="キャンセル"
                  onPress={() => setConfirmAction(null)}
                  variant="ghost"
                  size="sm"
                  style={styles.confirmBtn}
                />
                <Button
                  label="削除する"
                  onPress={executeDelete}
                  variant="destructive"
                  size="sm"
                  style={styles.confirmBtn}
                />
              </View>
            </View>
          ) : (
            <>
              <Button
                label={current.isArchived ? '一覧に戻す' : '非表示にする'}
                onPress={() => setConfirmAction('hide')}
                variant="ghost"
                size="sm"
              />
              {!current.isArchived && (
                <Text style={styles.hideHint}>データを残したまま一覧から隠します</Text>
              )}
              <TouchableOpacity
                onPress={() => setConfirmAction('delete')}
                style={styles.deleteLink}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteLinkText}>削除する（記録ごと消えます）</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {/* 固定フッター: 編集ボタン */}
      <View style={styles.viewFooter}>
        <Button label="編集する" onPress={startEditing} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  scroll: { padding: 16, gap: 12, paddingBottom: 100 },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryAmountCol: { flex: 1, gap: 2 },
  summaryAmount: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  summaryAmountHint: { fontSize: 12, color: COLORS.textMuted, fontWeight: '400' },
  category: { fontSize: 13, color: COLORS.textMuted },
  detailSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  detailLabel: { fontSize: 14, color: COLORS.textSecondary },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailValue: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  detailActionBtn: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 6,
    backgroundColor: COLORS.primaryLight,
  },
  detailActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  memoSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 8,
  },
  memo: { fontSize: 14, color: COLORS.text, lineHeight: 22 },
  cancelMemo: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20 },
  cancelUrlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  cancelUrl: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  actionSection: {
    paddingTop: 8,
    paddingBottom: 16,
    gap: 8,
    alignItems: 'center',
  },
  hideHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: -4,
  },
  nextActionLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginTop: 4,
  },
  deleteLink: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  deleteLinkText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
  },
  confirmCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 8,
    width: '100%',
    alignItems: 'center',
  },
  confirmCardDestructive: {
    backgroundColor: COLORS.destructiveLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.destructiveBorder,
    padding: 16,
    gap: 8,
    width: '100%',
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  confirmTitleDestructive: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.destructive,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmDescDestructive: {
    fontSize: 13,
    color: COLORS.destructive,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.85,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  confirmBtn: {
    minWidth: 100,
  },
  renewalBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: COLORS.warning.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.warning.border,
    padding: 12,
    alignItems: 'flex-start',
  },
  renewalBannerBody: { flex: 1, gap: 8 },
  renewalBannerText: {
    fontSize: 13,
    color: COLORS.warning.text,
    lineHeight: 20,
  },
  renewalBannerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  bannerBtn: {
    backgroundColor: COLORS.warning.text,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  bannerBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bannerBtnGhost: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.warning.text,
  },
  bannerBtnGhostText: {
    fontSize: 12,
    color: COLORS.warning.text,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
    marginTop: 8,
    marginBottom: 4,
  },
  detailsToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
    paddingRight: 2,
  },
  detailsToggleTitle: {
    marginTop: 0,
    marginBottom: 0,
  },
  section: {
    gap: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    overflow: 'visible',
  },
  textarea: { minHeight: 72, textAlignVertical: 'top' },
  // ─── クイックアクション ───
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  quickBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // 見直す（amber）
  quickBtnReviewing: {
    backgroundColor: '#FFF3E0',
    borderColor: '#F9A825',
  },
  quickBtnTextReviewing: {
    color: '#8D6200',
  },
  // 解約する（red）
  quickBtnCancel: {
    backgroundColor: '#FDECEA',
    borderColor: '#E57373',
  },
  quickBtnTextCancel: {
    color: '#B04040',
  },
  // 解約済み（gray）
  quickBtnStopped: {
    backgroundColor: '#F0F0F0',
    borderColor: '#BDBDBD',
  },
  quickBtnTextStopped: {
    color: '#616161',
  },
  // 継続中に戻す（ghost）
  quickBtnGhost: {
    backgroundColor: 'transparent',
    borderColor: COLORS.border,
  },
  quickBtnTextGhost: {
    color: COLORS.textSecondary,
  },
  nudgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  nudgeText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  nudgeLink: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    flexShrink: 0,
  },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 8 },
  viewFooter: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  saveErrorText: {
    fontSize: 13,
    color: COLORS.destructive,
    textAlign: 'center',
    lineHeight: 20,
  },
});
