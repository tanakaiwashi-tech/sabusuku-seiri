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
          <View style={styles.pill}>
            <TouchableOpacity
              style={[styles.pillSegment, currency === 'JPY' && styles.pillSegmentActive]}
              onPress={() => currency !== 'JPY' && onToggleCurrency()}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, currency === 'JPY' && styles.pillTextActive]}>
                ¥ JPY
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pillSegment, currency === 'USD' && styles.pillSegmentActive]}
              onPress={() => currency !== 'USD' && onToggleCurrency()}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, currency === 'USD' && styles.pillTextActive]}>
                $ USD
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <TextInput
        value={isFree ? '' : amount}
        onChangeText={onChangeAmount}
        placeholder={(() => {
          if (isFree) return '無料';
          if (currency === 'USD') {
            if (billingCycle === 'yearly') return '例: 240';
            if (billingCycle === 'quarterly') return '例: 60';
            return '例: 20';
          }
          if (billingCycle === 'yearly') return '例: 11800';
          if (billingCycle === 'quarterly') return '例: 2940';
          return '例: 980';
        })()}
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
  pill: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  pillSegment: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillSegmentActive: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
});
