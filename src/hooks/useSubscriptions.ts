import { useMemo } from 'react';
import { useSubscriptionStore, type SubscriptionState } from '@/src/stores/subscriptionStore';
import type { Subscription, SubscriptionSummary } from '@/src/types';
import { isWithinNextDays, isOverdueRenewal } from '@/src/utils/dateUtils';
import { toMonthlyAmount, toJPY } from '@/src/utils/amountUtils';
import { UPCOMING_RENEWAL_DAYS } from '@/src/constants/app';

/** サブスクリプション一覧と集計を返すフック。Zustand ストアの薄いラッパー。 */
export function useSubscriptions(includeArchived = false) {
  // ?? [] : migrate() の検証を通過した後でも、万一 null / undefined になった場合のフォールバック
  const allSubscriptions = useSubscriptionStore((s: SubscriptionState) => s.subscriptions ?? []);

  const subscriptions: Subscription[] = useMemo(
    () =>
      includeArchived
        ? allSubscriptions
        : allSubscriptions.filter((s: Subscription) => !s.isArchived),
    [allSubscriptions, includeArchived],
  );

  const summary: SubscriptionSummary = useMemo(() => {
    let totalMonthlyAmount = 0;
    let hasUSD = false;
    let activeCount = 0;
    let reviewingCount = 0;
    let cancelPlannedCount = 0;
    let upcomingRenewalCount = 0;
    let overdueRenewalCount = 0;

    for (const s of subscriptions) {
      if (s.status === 'active') {
        activeCount++;
        const monthly = toMonthlyAmount(s.amount, s.billingCycle);
        if (monthly !== null) {
          // USD は JPY 換算してから合計する
          const monthlyJPY = toJPY(monthly, s.currency ?? 'JPY');
          totalMonthlyAmount += monthlyJPY;
          if (s.currency === 'USD') hasUSD = true;
        }
      }
      if (s.status === 'reviewing') reviewingCount++;
      if (s.status === 'cancel_planned') cancelPlannedCount++;
      // active のみカウント（停止済み・見直し中の更新日は警告対象外）
      if (s.status === 'active' && isWithinNextDays(s.nextRenewalDate, UPCOMING_RENEWAL_DAYS)) upcomingRenewalCount++;
      // active で更新日が過去 → 更新日の更新忘れ候補
      if (s.status === 'active' && isOverdueRenewal(s.nextRenewalDate)) overdueRenewalCount++;
    }

    return { totalMonthlyAmount, hasUSD, activeCount, reviewingCount, cancelPlannedCount, upcomingRenewalCount, overdueRenewalCount };
  }, [subscriptions]);

  return { subscriptions, summary, isLoading: false };
}
