import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Subscription } from '@/src/types';
import { COLORS } from '@/src/constants/colors';
import { toMonthlyAmount, toJPY, formatAmount } from '@/src/utils/amountUtils';
import { useUiPrefsStore } from '@/src/stores/uiPrefsStore';
import { USD_TO_JPY_RATE } from '@/src/constants/app';

interface CategoryBreakdownProps {
  subscriptions: Subscription[];
}

/** カテゴリ別月額内訳バー */
export function CategoryBreakdown({ subscriptions }: CategoryBreakdownProps) {
  const [expanded, setExpanded] = useState(false);
  const usdRate = useUiPrefsStore((s) => s.usdToJpyRate ?? USD_TO_JPY_RATE);

  // 課金中（active + reviewing + cancel_planned）を集計 — SummaryBar の月額と同じ範囲
  const active = subscriptions.filter(
    (s) => s.status === 'active' || s.status === 'reviewing' || s.status === 'cancel_planned',
  );

  // カテゴリ別に集計
  const byCategory = new Map<string, number>();
  let total = 0;
  for (const s of active) {
    // SummaryBar と同じ換算ロジック: 月額換算 → JPY 換算
    const monthlyRaw = toMonthlyAmount(s.amount, s.billingCycle) ?? 0;
    const monthly = toJPY(monthlyRaw, s.currency ?? 'JPY', usdRate);
    const cat = s.category ?? 'その他';
    byCategory.set(cat, (byCategory.get(cat) ?? 0) + monthly);
    total += monthly;
  }

  if (total === 0 || byCategory.size === 0) return null;

  // irregular / free の ¥0 エントリを除外してから金額降順でソート
  const entries = [...byCategory.entries()].filter(([, amt]) => amt > 0).sort((a, b) => b[1] - a[1]);
  const shown = expanded ? entries : entries.slice(0, 3);

  // カテゴリごとに色を割り当て
  const PALETTE = [
    '#3D5A52', '#6B9E8A', '#A8C5BA',
    '#C49A6C', '#E8C99A', '#8BA5B8',
    '#B8A88A', '#7A9E7E',
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>カテゴリ別内訳（契約中）</Text>
      <View style={styles.stackBar}>
        {entries.map(([cat, amt], i) => (
          <View
            key={cat}
            style={[
              styles.stackSegment,
              { flex: amt / total, backgroundColor: PALETTE[i % PALETTE.length] },
            ]}
          />
        ))}
      </View>
      <View style={styles.list}>
        {shown.map(([cat, amt], i) => {
          const pct = total > 0 ? Math.round((amt / total) * 100) : 0;
          return (
            <View key={cat} style={styles.row}>
              <View style={[styles.dot, { backgroundColor: PALETTE[i % PALETTE.length] }]} />
              <Text style={styles.catName} numberOfLines={1}>{cat}</Text>
              <Text style={styles.pct}>{pct}%</Text>
              <Text style={styles.amt}>{formatAmount(amt)}</Text>
            </View>
          );
        })}
      </View>
      {entries.length > 3 && (
        <TouchableOpacity onPress={() => setExpanded((v) => !v)} style={styles.toggle} activeOpacity={0.7}>
          <Ionicons
            name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={13}
            color={COLORS.primary}
          />
          <Text style={styles.toggleText}>
            {expanded ? '閉じる' : `残り ${entries.length - 3} カテゴリ`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
    marginHorizontal: 16,
    marginTop: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  stackBar: {
    height: 10,
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
    gap: 2,
  },
  stackSegment: {
    borderRadius: 3,
  },
  list: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catName: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
  },
  pct: {
    fontSize: 12,
    color: COLORS.textMuted,
    width: 36,
    textAlign: 'right',
  },
  amt: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    width: 72,
    textAlign: 'right',
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 2,
  },
  toggleText: {
    fontSize: 12,
    color: COLORS.primary,
  },
});
