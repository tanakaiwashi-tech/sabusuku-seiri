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
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BILLING_CYCLE_LABELS, STATUS_LABELS, FREE_LIMIT_COUNT } from '@/src/constants/app';
import {
  CATEGORY_OPTIONS,
  type CategoryOption,
  type BillingCycle,
  type SubscriptionStatus,
  type SubscriptionFormData,
  type ServiceDictionaryEntry,
} from '@/src/types';
import { useSubscription } from '@/src/hooks/useSubscription';
import { SelectField } from '@/src/components/ui/SelectField';
import { TextInput } from '@/src/components/ui/TextInput';
import { DatePickerField } from '@/src/components/ui/DatePickerField';
import { Button } from '@/src/components/ui/Button';
import { ServiceNameAutocomplete } from '@/src/components/subscription/ServiceNameAutocomplete';
import { COLORS } from '@/src/constants/colors';
import { isSafeUrl, isValidDateString, isValidAmount, AMOUNT_MAX } from '@/src/utils/validationUtils';

const BILLING_CYCLES: readonly BillingCycle[] = [
  'monthly', 'yearly', 'quarterly', 'irregular', 'free',
];
const STATUSES: readonly SubscriptionStatus[] = [
  'active', 'reviewing', 'cancel_planned', 'stopped',
];

export default function NewSubscriptionScreen() {
  const { save } = useSubscription();
  const [isSaving, setIsSaving] = useState(false);

  const [serviceName, setServiceName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [category, setCategory] = useState<CategoryOption | null>(null);
  const [status, setStatus] = useState<SubscriptionStatus>('active');
  const [nextRenewalDate, setNextRenewalDate] = useState('');
  const [trialEndDate, setTrialEndDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [memo, setMemo] = useState('');
  const [customCancelUrl, setCustomCancelUrl] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSelectSuggestion = (entry: ServiceDictionaryEntry) => {
    setCategory(entry.category);
    setBillingCycle(entry.defaultBillingCycle);
    if (entry.defaultAmount !== null) {
      setAmount(String(entry.defaultAmount));
    }
    if (entry.officialCancelUrl) {
      setCustomCancelUrl(entry.officialCancelUrl);
    }
  };

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

  const handleSave = async () => {
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
      cancelMemo: null,
      customCancelUrl: customCancelUrl.trim() || null,
      isArchived: false,
    };

    const result = await save(formData);
    setIsSaving(false);

    if (result.ok) {
      router.back();
    } else if (result.error === 'limit_reached') {
      Alert.alert(
        '登録上限に達しました',
        `このアプリでは最大 ${FREE_LIMIT_COUNT} 件まで登録できます。一覧から外すと空きができます。`,
        [{ text: 'OK' }],
      );
    } else {
      Alert.alert('エラー', '保存できませんでした。もう一度試してください。');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>新規登録</Text>
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
              onSelectSuggestion={handleSelectSuggestion}
              placeholder="Netflix, Spotify..."
              error={errors.serviceName}
              maxLength={50}
            />
            <SelectField
              label="支払いサイクル *"
              value={billingCycle}
              options={BILLING_CYCLES}
              displayLabel={(v) => BILLING_CYCLE_LABELS[v]}
              onChange={(v) => v && setBillingCycle(v)}
            />
            <TextInput
              label={billingCycle === 'free' ? '金額（無料）' : '金額（円） *'}
              value={amount}
              onChangeText={setAmount}
              placeholder="1000"
              keyboardType="numeric"
              editable={billingCycle !== 'free'}
              error={errors.amount}
            />
          </View>

          <Text style={styles.sectionTitle}>詳細（任意）</Text>
          <View style={styles.section}>
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
            <DatePickerField
              label="次回更新日"
              value={nextRenewalDate}
              onChange={setNextRenewalDate}
              error={errors.nextRenewalDate}
            />
          </View>

          <Text style={styles.sectionTitle}>メモ・解約URL</Text>
          <View style={styles.section}>
            <TextInput
              label="解約ページURL"
              value={customCancelUrl}
              onChangeText={setCustomCancelUrl}
              placeholder="https://..."
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
        </ScrollView>

        <View style={styles.footer}>
          <Button label="登録する" onPress={handleSave} loading={isSaving} fullWidth />
        </View>
      </KeyboardAvoidingView>
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
  headerTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  scroll: { padding: 16, gap: 8, paddingBottom: 32 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 4,
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
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
});
