import type { BillingCycle } from '@/src/types';
import { BILLING_CYCLE_MONTHLY_FACTOR } from '@/src/constants/app';

export function toMonthlyAmount(amount: number, billingCycle: BillingCycle): number | null {
  const factor = BILLING_CYCLE_MONTHLY_FACTOR[billingCycle];
  if (factor === null) return null;
  return Math.round(amount * factor);
}

export function toYearlyAmount(monthlyAmount: number): number {
  return monthlyAmount * 12;
}

export function formatAmount(amount: number, currency = 'JPY'): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** サービス名を正規化（小文字化＋スペース除去）して重複チェック等に使用 */
export function normalizeServiceName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '');
}
