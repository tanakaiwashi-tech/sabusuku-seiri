import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import type { SubscriptionSummary } from '@/src/types';
import { COLORS } from '@/src/constants/colors';
import { USD_TO_JPY_RATE } from '@/src/constants/app';
import { formatAmount, toYearlyAmount } from '@/src/utils/amountUtils';
import { useUiPrefsStore } from '@/src/stores/uiPrefsStore';

interface StatCellProps {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
  dimmed?: boolean;
  /** 指定時はタップ可能なセルになり、ラベルに「→」を付与する */
  onPress?: () => void;
}

function StatCell({ label, value, bold = false, accent = false, dimmed = false, onPress }: StatCellProps) {
  const inner = (
    <View style={[styles.statPill, accent && styles.statPillAccent, dimmed && styles.statPillDimmed]}>
      <Text style={[styles.statLabel, accent && styles.statLabelAccent]}>{label}</Text>
      <Text style={[styles.statValue, bold && styles.statValueBold, accent && styles.statValueAccent]}>
        {value}
      </Text>
      {onPress && (
        <Text style={[styles.statArrow, accent && styles.statArrowAccent]}>›</Text>
      )}
    </View>
  );
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
}

interface SummaryBarProps {
  summary: SubscriptionSummary;
  /** 年払い・3ヶ月払いのサブスクが存在するか（注意書き表示用） */
  hasNonMonthly?: boolean;
  /** 不定期課金のサブスクが存在するか（集計対象外の注意書き表示用） */
  hasIrregular?: boolean;
  /** 「見直す」セルをタップしたときのコールバック */
  onReviewingPress?: () => void;
  /** 「解約する」セルをタップしたときのコールバック */
  onCancelPlannedPress?: () => void;
  /** 「更新が近い / 要確認」セルをタップしたときのコールバック */
  onRenewalAlertPress?: () => void;
  /** 「試用終了が近い」セルをタップしたときのコールバック */
  onTrialAlertPress?: () => void;
}

export function SummaryBar({
  summary,
  hasNonMonthly = false,
  hasIrregular = false,
  onReviewingPress,
  onCancelPlannedPress,
  onRenewalAlertPress,
  onTrialAlertPress,
}: SummaryBarProps) {
  const { totalMonthlyAmount, pendingCancellationMonthlyAmount, hasUSD, activeCount, reviewingCount, cancelPlannedCount, upcomingRenewalCount, overdueRenewalCount, trialEndingSoonCount } = summary;
  const usdRate = useUiPrefsStore((s) => s.usdToJpyRate ?? USD_TO_JPY_RATE);
  // 更新日セルは「超過」優先表示。超過がない場合のみ「更新が近い」を表示。
  // 合算することで件数とラベルの意味がずれるのを防ぐ。
  const renewalAlertCount = overdueRenewalCount > 0 ? overdueRenewalCount : upcomingRenewalCount;
  const renewalAlertLabel = overdueRenewalCount > 0 ? '更新日を確認' : '更新が近い';

  // 現在実際に課金されている合計 = active + reviewing + cancel_planned
  const currentMonthlyAmount = totalMonthlyAmount + pendingCancellationMonthlyAmount;
  // 表示金額と一致する件数（課金中の全ステータス）
  const payingCount = activeCount + reviewingCount + cancelPlannedCount;

  // 月額 ↔ 年額トグル
  const [showYearly, setShowYearly] = useState(false);
  const displayAmount = showYearly
    ? toYearlyAmount(currentMonthlyAmount)
    : currentMonthlyAmount;
  // 解約後の着地点（active のみ）
  const afterCancellationAmount = showYearly
    ? toYearlyAmount(totalMonthlyAmount)
    : totalMonthlyAmount;
  const savingsAmount = showYearly
    ? toYearlyAmount(pendingCancellationMonthlyAmount)
    : pendingCancellationMonthlyAmount;
  const savingsUnit = showYearly ? '/年' : '/月';
  const displayLabel = showYearly ? '年額合計（概算）' : '現在の月額（概算）';

  return (
    <View style={styles.container}>
      <View style={styles.totalRow}>
        <View style={styles.totalLabelRow}>
          <Text style={styles.totalLabel}>{displayLabel}</Text>
          {pendingCancellationMonthlyAmount > 0 && (
            <Text style={styles.pendingNote}>
              {reviewingCount > 0 && cancelPlannedCount > 0
                ? '見直し中・解約予定を含む'
                : reviewingCount > 0
                ? '見直し中を含む'
                : '解約予定を含む'}
            </Text>
          )}
          {/* 月/年ピルトグル */}
          <TouchableOpacity
            style={styles.togglePill}
            onPress={() => setShowYearly((v) => !v)}
            activeOpacity={0.75}
          >
            <View style={[styles.toggleSeg, !showYearly && styles.toggleSegActive]}>
              <Text style={[styles.toggleSegText, !showYearly && styles.toggleSegTextActive]}>月</Text>
            </View>
            <View style={[styles.toggleSeg, showYearly && styles.toggleSegActive]}>
              <Text style={[styles.toggleSegText, showYearly && styles.toggleSegTextActive]}>年</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.totalAmountCol}>
          <Text style={styles.totalAmount}>{formatAmount(displayAmount)}</Text>
          <Text style={styles.activeCount}>契約中 {payingCount}件</Text>
        </View>
      </View>

      {/* 解約後の金額比較: 見直す/解約する が存在する場合のみ表示 */}
      {pendingCancellationMonthlyAmount > 0 && (
        <View style={styles.savingsRow}>
          <Text style={styles.savingsLabel}>解約後</Text>
          <Text style={styles.savingsAfterAmount}>{formatAmount(afterCancellationAmount)}</Text>
          <Text style={styles.savingsDiff}>{`（${formatAmount(savingsAmount)}${savingsUnit}削減）`}</Text>
        </View>
      )}

      {/* 注意書き: 該当するものを1行にまとめて表示 */}
      {(hasNonMonthly || hasUSD || hasIrregular) && (
        <Text style={styles.hint}>
          {'※ ' + [
            hasNonMonthly && '年/3ヶ月払い換算含む',
            hasUSD && `USD=¥${usdRate}換算`,
            hasIrregular && '不定期除く',
          ].filter(Boolean).join(' · ')}
        </Text>
      )}

      {(reviewingCount > 0 || cancelPlannedCount > 0 || renewalAlertCount > 0 || trialEndingSoonCount > 0) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsScroll}
          contentContainerStyle={styles.statsRow}
        >
          {reviewingCount > 0 && (
            <StatCell
              label="見直す"
              value={`${reviewingCount}件`}
              bold
              accent
              onPress={onReviewingPress}
            />
          )}
          {cancelPlannedCount > 0 && (
            <StatCell
              label="解約手続き中"
              value={`${cancelPlannedCount}件`}
              bold
              onPress={onCancelPlannedPress}
            />
          )}
          {renewalAlertCount > 0 && (
            <StatCell
              label={renewalAlertLabel}
              value={`${renewalAlertCount}件`}
              bold
              accent={overdueRenewalCount > 0}
              onPress={onRenewalAlertPress}
            />
          )}
          {trialEndingSoonCount > 0 && (
            <StatCell
              label="試用終了が近い"
              value={`${trialEndingSoonCount}件`}
              bold
              onPress={onTrialAlertPress}
            />
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabelRow: {
    gap: 2,
    flex: 1,
    marginRight: 12,
  },
  totalLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  activeCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '400',
    textAlign: 'right',
  },
  togglePill: {
    flexDirection: 'row',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  toggleSeg: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: 'transparent',
  },
  toggleSegActive: {
    backgroundColor: COLORS.primary,
  },
  toggleSegText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  toggleSegTextActive: {
    color: '#FFFFFF',
  },
  totalAmountCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  hint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: -2,
    lineHeight: 16,
    opacity: 0.8,
  },
  statsScroll: {
    marginTop: 2,
    flexShrink: 0,
    marginHorizontal: -16, // paddingHorizontal 分だけ左右に広げてエッジまで使う
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statPillAccent: {
    backgroundColor: COLORS.destructiveLight,
    borderColor: COLORS.destructiveBorder,
  },
  statPillDimmed: {
    opacity: 0.4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statLabelAccent: {
    color: COLORS.destructive,
  },
  statValue: {
    fontSize: 13,
    color: COLORS.text,
  },
  statValueBold: {
    fontWeight: '700',
  },
  statValueAccent: {
    color: COLORS.destructive,
  },
  statArrow: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    lineHeight: 16,
  },
  statArrowAccent: {
    color: COLORS.destructive,
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: -2,
    opacity: 0.75,
  },
  savingsLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  savingsAfterAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  savingsDiff: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
    marginLeft: 2,
  },
  pendingNote: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
