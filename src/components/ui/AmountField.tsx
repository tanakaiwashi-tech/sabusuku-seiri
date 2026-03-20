/**
 * 金額入力フィールド（通貨トグル付き）。
 * new.tsx / [id].tsx 両画面で共通利用する。
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/src/constants/colors';
import { TextInput } from '@/src/components/ui/TextInput';
import type { BillingCycle, Currency } from '@/src/types';

interface AmountFieldProps {
  billingCycle: BillingCycle;
  amount: string;
  currency: Currency;
  onChangeAmount: (value: string) => void;
  onToggleCurrency: () => void;
  error?: string;
}

export function AmountField({
  billingCycle,
  amount,
  currency,
  onChangeAmount,
  onToggleCurrency,
  error,
}: AmountFieldProps) {
  const isFree = billingCycle === 'free';

  return (
    <View>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {isFree ? '金額（無料）' : '金額 *'}
        </Text>
        {!isFree && (
          <TouchableOpacity
            style={styles.toggle}
            onPress={onToggleCurrency}
            activeOpacity={0.7}
          >
            <Text style={styles.toggleText}>
              {currency === 'JPY' ? '¥ 円' : '$ USD'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <TextInput
        value={isFree ? '' : amount}
        onChangeText={onChangeAmount}
        placeholder={isFree ? '無料' : currency === 'USD' ? '例: 20' : '例: 980'}
        keyboardType="numeric"
        editable={!isFree}
        error={error}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  toggle: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
