import type { BillingCycle, SubscriptionStatus } from '@/src/types';

export const FREE_LIMIT_COUNT = 15;
export const UPCOMING_RENEWAL_DAYS = 30;

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: '月払い',
  yearly: '年払い',
  quarterly: '3ヶ月払い',
  irregular: '不定期',
  free: '無料',
};

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: '利用中',
  reviewing: '見直し中',
  cancel_planned: '解約予定',
  stopped: '停止済み',
};

/**
 * 月額換算係数（月払い基準）。
 * irregular / free は月額換算できないため null。
 */
export const BILLING_CYCLE_MONTHLY_FACTOR: Record<BillingCycle, number | null> = {
  monthly: 1,
  yearly: 1 / 12,
  quarterly: 1 / 3,
  irregular: null,
  free: null,
};
