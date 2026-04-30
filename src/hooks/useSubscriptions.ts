import { useMemo } from 'react';
import { useSubscriptionStore, type SubscriptionState } from '@/src/stores/subscriptionStore';
import { useUiPrefsStore } from '@/src/stores/uiPrefsStore';
import type { Subscription, SubscriptionSummary } from '@/src/types';
import { isWithinNextDays, isOverdueRenewal, isStaleUpdate } from '@/src/utils/dateUtils';
import { toMonthlyAmount, toJPY } from '@/src/utils/amountUtils';
import { UPCOMING_RENEWAL_DAYS, STALE_CANCEL_DAYS, USD_TO_JPY_RATE } from '@/src/constants/app';

/** サブスクリプション一覧と集計を返すフック。Zustand ストアの薄いラッパー。 */
export function useSubscriptions(includeArchived = false) {
  // ?? [] : migrate() の検証を通過した後でも、万一 null / undefined になった場合のフォールバック
  const allSubscriptions = useSubscriptionStore((s: SubscriptionState) => s.subscriptions ?? []);
  const usdRate = useUiPrefsStore((s) => s.usdToJpyRate ?? USD_TO_JPY_RATE);

  const subscriptions: Subscription[] = useMemo(
    () =>
      includeArchived
        ? allSubscriptions
        : allSubscriptions.filter((s: Subscription) => !s.isArchived),
    [allSubscriptions, includeArchived],
  );

  const summary: SubscriptionSummary = useMemo(() => {
    let totalMonthlyAmount = 0;
    let pendingCancellationMonthlyAmount = 0;
    let hasUSD = false;
    let activeCount = 0;
    let reviewingCount = 0;
    let cancelPlannedCount = 0;
    let upcomingRenewalCount = 0;
    let overdueRenewalCount = 0;
    let staleCancelCount = 0;
    let trialEndingSoonCount = 0;

    for (const s of subscriptions) {
      if (s.status === 'active') {
        activeCount++;
        const monthly = toMonthlyAmount(s.amount, s.billingCycle);
        if (monthly !== null) {
          // USD は JPY 換算してから合計する
          const monthlyJPY = toJPY(monthly, s.currency ?? 'JPY', usdRate);
          totalMonthlyAmount += monthlyJPY;
          if (s.currency === 'USD') hasUSD = true;
        }
      }
      // reviewing / cancel_planned は「まだ課金中だが見直し中」なので別集計
      if (s.status === 'reviewing' || s.status === 'cancel_planned') {
        if (s.status === 'reviewing') reviewingCount++;
        else cancelPlannedCount++;
        const monthly = toMonthlyAmount(s.amount, s.billingCycle);
        if (monthly !== null) {
          const monthlyJPY = toJPY(monthly, s.currency ?? 'JPY', usdRate);
          pendingCancellationMonthlyAmount += monthlyJPY;
          if (s.currency === 'USD') hasUSD = true;
        }
      }
      // active のみカウント（停止済み・見直し中の更新日は警告対象外）
      if (s.status === 'active' && isWithinNextDays(s.nextRenewalDate, UPCOMING_RENEWAL_DAYS)) upcomingRenewalCount++;
      // active で更新日が過去 → 更新日の更新忘れ候補
      if (s.status === 'active' && isOverdueRenewal(s.nextRenewalDate)) overdueRenewalCount++;
      // cancel_planned で STALE_CANCEL_DAYS 日以上放置 → 手続き促進バナー用
      // cancelPlannedAt がある場合はそれを使用（updatedAt は他フィールド編集でリセットされるため）
      if (s.status === 'cancel_planned' && isStaleUpdate(s.cancelPlannedAt ?? s.updatedAt, STALE_CANCEL_DAYS)) staleCancelCount++;
      // active で試用終了日が近い → SummaryBar アラート用
      if (s.status === 'active' && isWithinNextDays(s.trialEndDate, UPCOMING_RENEWAL_DAYS)) trialEndingSoonCount++;
    }

    return { totalMonthlyAmount, pendingCancellationMonthlyAmount, hasUSD, activeCount, reviewingCount, cancelPlannedCount, upcomingRenewalCount, overdueRenewalCount, staleCancelCount, trialEndingSoonCount };
  }, [subscriptions, usdRate]);

  return { subscriptions, summary, isLoading: false };
}
