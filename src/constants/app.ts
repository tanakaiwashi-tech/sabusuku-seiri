import type { BillingCycle, SubscriptionStatus } from '@/src/types';

/** サブスク登録の上限（制限を撤廃し実質無制限）。削除せず new.tsx の型整合性のために残置。 */
export const FREE_LIMIT_COUNT = 9999;
export const UPCOMING_RENEWAL_DAYS = 30;
/** USD → JPY 換算レート（概算固定値）。集計・表示用のみ使用。 */
export const USD_TO_JPY_RATE = 150;
/** cancel_planned ステータスが「放置」とみなす経過日数 */
export const STALE_CANCEL_DAYS = 7;

/** ホーム画面の並び替えキー */
export type SortKey = 'createdAt' | 'nextRenewalDate' | 'amount';

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: '月払い',
  yearly: '年払い',
  quarterly: '3ヶ月払い',
  irregular: '不定期',
  free: '無料',
};

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: '利用中',
  reviewing: '見直す',
  cancel_planned: '解約する',
  stopped: '解約済み',
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

/** フォームで使う支払いサイクル選択肢（new.tsx / [id].tsx 共通） */
export const BILLING_CYCLE_OPTIONS: readonly BillingCycle[] = [
  'monthly', 'yearly', 'quarterly', 'irregular', 'free',
];

/** フォームで使うステータス選択肢（new.tsx / [id].tsx 共通） */
export const STATUS_OPTIONS: readonly SubscriptionStatus[] = [
  'active', 'reviewing', 'cancel_planned', 'stopped',
];
