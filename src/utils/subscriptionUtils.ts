/**
 * Subscription ↔ SubscriptionFormData 変換ユーティリティ。
 * フィールドを手動コピーするパターンを排除し、追加漏れを防ぐ。
 */

import type { Subscription, SubscriptionFormData } from '@/src/types';

/**
 * Subscription を SubscriptionFormData に変換する。
 * overrides で一部フィールドだけ上書きできる（非表示トグルなど）。
 *
 * @example
 * // isArchived だけ反転して保存
 * const result = await save(subscriptionToFormData(current, { isArchived: !current.isArchived }));
 */
export function subscriptionToFormData(
  sub: Subscription,
  overrides: Partial<SubscriptionFormData> = {},
): SubscriptionFormData {
  return {
    serviceName: sub.serviceName,
    amount: sub.amount,
    currency: sub.currency,
    billingCycle: sub.billingCycle,
    category: sub.category,
    status: sub.status,
    nextRenewalDate: sub.nextRenewalDate,
    trialEndDate: sub.trialEndDate,
    startDate: sub.startDate,
    memo: sub.memo,
    cancelMemo: sub.cancelMemo,
    customCancelUrl: sub.customCancelUrl,
    isArchived: sub.isArchived,
    ...overrides,
  };
}
