import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BILLING_CYCLE_LABELS, STATUS_LABELS } from '@/src/constants/app';
import {
  CATEGORY_OPTIONS,
  type CategoryOption,
  type BillingCycle,
  type SubscriptionStatus,
  type SubscriptionFormData,
} from '@/src/types';
import { useSubscription } from '@/src/hooks/useSubscription';
import { SelectField } from '@/src/components/ui/SelectField';
import { TextInput } from '@/src/components/ui/TextInput';
import { DatePickerField } from '@/src/components/ui/DatePickerField';
import { Button } from '@/src/components/ui/Button';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { COLORS } from '@/src/constants/colors';
import { formatDisplayDate, suggestNextRenewalDate } from '@/src/utils/dateUtils';
import { formatAmount } from '@/src/utils/amountUtils';
import { isSafeUrl, isValidDateString, isValidAmount, AMOUNT_MAX } from '@/src/utils/validationUtils';

const BILLING_CYCLES: readonly BillingCycle[] = [
  'monthly', 'yearly', 'quarterly', 'irregular', 'free',
];
const STATUSES: readonly SubscriptionStatus[] = [
  'active', 'reviewing', 'cancel_planned', 'stopped',
];

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function SubscriptionDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  // useLocalSearchParams は string[] を返すことがあるため単一値に正規化
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  // useSubscription に id を渡すと自動ロード（useEffect 不要）
  const { current, isLoading, save, permanentlyDelete } = useSubscription(id);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // 更新日繰り越し提案（インラインバナー用）
  const [suggestedRenewalDate, setSuggestedRenewalDate] = useState<string | null>(null);

  // 編集フォームの state
  const [serviceName, setServiceName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [category, setCategory] = useState<CategoryOption | null>(null);
  const [status, setStatus] = useState<SubscriptionStatus>('active');
  const [nextRenewalDate, setNextRenewalDate] = useState('');
  const [trialEndDate, setTrialEndDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [memo, setMemo] = useState('');
  const [cancelMemo, setCancelMemo] = useState('');
  const [customCancelUrl, setCustomCancelUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!serviceName.trim()) next.serviceName = 'サービス名を入力してください';
    if (billingCycle !== 'free' && !isValidAmount(amount)) {
      next.amount = `1〜${AMOUNT_MAX.toLocaleString()}円の整数を入力してください`;
    }
    if (nextRenewalDate && !isValidDateString(nextRenewalDate)) next.nextRenewalDate = '実在する日付を入力してください';
    if (trialEndDate && !isValidDateString(trialEndDate)) next.trialEndDate = '実在する日付を入力してください';
    if (startDate && !isValidDateString(startDate)) next.startDate = '実在する日付を入力してください';
    if (customCancelUrl.trim() && !isSafeUrl(customCancelUrl.trim())) {
      next.customCancelUrl = 'https:// または http:// で始まるURLを入力してください';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const startEditing = () => {
    if (!current) return;
    setServiceName(current.serviceName);
    setAmount(current.amount > 0 ? String(current.amount) : '');
    setBillingCycle(current.billingCycle);
    setCategory(current.category);
    setStatus(current.status);
    setTrialEndDate(current.trialEndDate ?? '');
    setStartDate(current.startDate ?? '');
    setMemo(current.memo ?? '');
    setCancelMemo(current.cancelMemo ?? '');
    setCustomCancelUrl(current.customCancelUrl ?? '');

    // 更新日が過去 → インラインバナーで次回周期への繰り越しを提案
    const suggested = suggestNextRenewalDate(current.nextRenewalDate, current.billingCycle);
    setNextRenewalDate(current.nextRenewalDate ?? '');
    setSuggestedRenewalDate(suggested);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!current) return;
    if (!validate()) return;
    setIsSaving(true);

    const formData: SubscriptionFormData = {
      serviceName: serviceName.trim(),
      amount: billingCycle === 'free' ? 0 : Number(amount),
      billingCycle,
      category,
      status,
      nextRenewalDate: nextRenewalDate || null,
      trialEndDate: trialEndDate || null,
      startDate: startDate || null,
      memo: memo || null,
      cancelMemo: cancelMemo || null,
      customCancelUrl: customCancelUrl.trim() || null,
      isArchived: current.isArchived,
    };

    const result = await save(formData);
    setIsSaving(false);

    if (result.ok) {
      setIsEditing(false);
    } else {
      Alert.alert('エラー', '保存できませんでした。もう一度試してください。');
    }
  };

  const handleArchive = () => {
    if (!current) return;
    const label = current.isArchived ? '一覧に戻す' : '一覧から外す';
    Alert.alert(
      `${label}しますか？`,
      current.isArchived
        ? 'このサブスクを一覧に戻します。'
        : 'このサブスクを一覧から外します。データは残ります。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: current.isArchived ? '一覧に戻す' : '一覧から外す',
          onPress: async () => {
            const formData: SubscriptionFormData = {
              serviceName: current.serviceName,
              amount: current.amount,
              billingCycle: current.billingCycle,
              category: current.category,
              status: current.status,
              nextRenewalDate: current.nextRenewalDate,
              trialEndDate: current.trialEndDate,
              startDate: current.startDate,
              memo: current.memo,
              cancelMemo: current.cancelMemo,
              customCancelUrl: current.customCancelUrl,
              isArchived: !current.isArchived,
            };
            const result = await save(formData);
            if (result.ok) router.back();
          },
        },
      ],
    );
  };

  const handleDelete = () => {
    if (!current?.isArchived) return;
    Alert.alert(
      '完全に削除しますか？',
      'この操作は取り消せません。データは完全に削除されます。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除する',
          style: 'destructive',
          onPress: () => {
            permanentlyDelete();
            router.back();
          },
        },
      ],
    );
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
            <View style={styles.section}>
              <TextInput label="サービス名 *" value={serviceName} onChangeText={setServiceName} error={errors.serviceName} maxLength={50} />
              <SelectField
                label="支払いサイクル"
                value={billingCycle}
                options={BILLING_CYCLES}
                displayLabel={(v) => BILLING_CYCLE_LABELS[v]}
                onChange={(v) => v && setBillingCycle(v)}
              />
              <TextInput
                label="金額（円）"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                editable={billingCycle !== 'free'}
                error={errors.amount}
              />
              <SelectField
                label="カテゴリ"
                value={category}
                options={CATEGORY_OPTIONS}
                displayLabel={(v) => v}
                onChange={setCategory}
                clearable
              />
              <SelectField
                label="ステータス"
                value={status}
                options={STATUSES}
                displayLabel={(v) => STATUS_LABELS[v]}
                onChange={(v) => v && setStatus(v)}
              />
              {/* 更新日過期バナー */}
              {suggestedRenewalDate && (
                <View style={styles.renewalBanner}>
                  <Ionicons name="time-outline" size={16} color="#8D6200" />
                  <View style={styles.renewalBannerBody}>
                    <Text style={styles.renewalBannerText}>
                      更新日が過ぎています。次の更新日 {suggestedRenewalDate} に更新しますか？
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
              <DatePickerField label="トライアル終了日" value={trialEndDate} onChange={setTrialEndDate} error={errors.trialEndDate} />
              <DatePickerField label="利用開始日" value={startDate} onChange={setStartDate} error={errors.startDate} />
              <TextInput
                label="メモ"
                value={memo}
                onChangeText={setMemo}
                multiline
                numberOfLines={3}
                style={styles.textarea}
              />
              <TextInput
                label="解約メモ"
                value={cancelMemo}
                onChangeText={setCancelMemo}
                multiline
                numberOfLines={2}
                style={styles.textarea}
              />
              <TextInput
                label="解約ページURL"
                value={customCancelUrl}
                onChangeText={setCustomCancelUrl}
                placeholder="https://..."
                autoCapitalize="none"
                keyboardType="url"
                error={errors.customCancelUrl}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
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
            <Text style={styles.amountLabel}>
              {current.billingCycle === 'free'
                ? '無料'
                : `${formatAmount(current.amount)} / ${BILLING_CYCLE_LABELS[current.billingCycle]}`}
            </Text>
            <StatusBadge status={current.status} />
          </View>
          {current.category && <Text style={styles.category}>{current.category}</Text>}
        </View>

        {/* 詳細行 */}
        <View style={styles.detailSection}>
          <DetailRow label="次回更新日" value={formatDisplayDate(current.nextRenewalDate)} />
          {current.trialEndDate && (
            <DetailRow label="トライアル終了" value={formatDisplayDate(current.trialEndDate)} />
          )}
          {current.startDate && (
            <DetailRow label="利用開始日" value={formatDisplayDate(current.startDate)} />
          )}
          {current.cancelledAt && (
            <DetailRow label="停止日" value={formatDisplayDate(current.cancelledAt)} />
          )}
        </View>

        {/* メモ・解約URL */}
        {(current.memo || current.cancelMemo || (current.customCancelUrl && isSafeUrl(current.customCancelUrl))) && (
          <View style={styles.memoSection}>
            {current.memo && <Text style={styles.memo}>{current.memo}</Text>}
            {current.cancelMemo && (
              <Text style={styles.cancelMemo}>解約メモ: {current.cancelMemo}</Text>
            )}
            {current.customCancelUrl && isSafeUrl(current.customCancelUrl) && (
              <TouchableOpacity
                onPress={() => {
                  if (current.customCancelUrl && isSafeUrl(current.customCancelUrl)) {
                    Linking.openURL(current.customCancelUrl);
                  }
                }}
                activeOpacity={0.7}
                style={styles.cancelUrlRow}
              >
                <Ionicons name="link-outline" size={14} color={COLORS.primary} />
                <Text style={styles.cancelUrl} numberOfLines={1}>
                  解約ページを開く
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* アーカイブ / 完全削除 */}
        <View style={styles.archiveRow}>
          <Button
            label={current.isArchived ? '一覧に戻す' : '一覧から外す'}
            onPress={handleArchive}
            variant="ghost"
            size="sm"
          />
          {current.isArchived && (
            <Button
              label="完全に削除"
              onPress={handleDelete}
              variant="destructive"
              size="sm"
            />
          )}
        </View>
      </ScrollView>
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
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },
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
  amountLabel: { fontSize: 20, fontWeight: '700', color: COLORS.text },
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
  detailValue: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
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
  archiveRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, paddingTop: 8 },
  renewalBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFF9F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6C87A',
    padding: 12,
    alignItems: 'flex-start',
  },
  renewalBannerBody: { flex: 1, gap: 8 },
  renewalBannerText: {
    fontSize: 13,
    color: '#8D6200',
    lineHeight: 18,
  },
  renewalBannerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  bannerBtn: {
    backgroundColor: '#8D6200',
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
    borderColor: '#8D6200',
  },
  bannerBtnGhostText: {
    fontSize: 12,
    color: '#8D6200',
  },
  section: {
    gap: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  textarea: { minHeight: 72, textAlignVertical: 'top' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
});
