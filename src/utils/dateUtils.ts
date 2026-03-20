import { format, parseISO, isWithinInterval, addDays, addMonths, addYears, differenceInMonths, differenceInYears, differenceInCalendarDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { BillingCycle } from '@/src/types';

export function nowISOString(): string {
  return new Date().toISOString();
}

export function todayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function isWithinNextDays(dateString: string | null, days: number): boolean {
  if (!dateString) return false;
  try {
    const target = parseISO(dateString);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return isWithinInterval(target, { start: todayStart, end: addDays(todayStart, days) });
  } catch {
    return false;
  }
}

/** 更新日が今日より前（過去）かどうか */
export function isOverdueRenewal(dateString: string | null): boolean {
  if (!dateString) return false;
  try {
    const target = parseISO(dateString);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return target < todayStart;
  } catch {
    return false;
  }
}

/**
 * 日付文字列またはISO datetime文字列を yyyy/MM/dd 表示に変換する。
 *
 * cancelledAt など一部フィールドは "2024-01-15T10:30:00.000Z" のような
 * datetime形式で保存される。date-fns の parseISO は date/datetime どちらも
 * 正しくパースできるが、不正な値が混入した場合に備えて try-catch で保護する。
 */
export function formatDisplayDate(dateString: string | null): string {
  if (!dateString) return '—';
  try {
    return format(parseISO(dateString), 'yyyy/MM/dd', { locale: ja });
  } catch {
    return '—';
  }
}

/**
 * 過去の更新日を次回サイクルに繰り越した日付文字列（YYYY-MM-DD）を返す。
 * 繰り越せない場合（irregular / free / nullなど）は null を返す。
 * 過去日でない場合も null を返す（変更不要）。
 */
export function suggestNextRenewalDate(
  dateString: string | null,
  billingCycle: BillingCycle,
): string | null {
  if (!dateString) return null;
  if (billingCycle === 'free' || billingCycle === 'irregular') return null;
  try {
    let date = parseISO(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date >= today) return null; // 過去日でなければ提案不要

    // O(1): 数学的に必要サイクル数を算出して一発で繰り越す
    if (billingCycle === 'monthly') {
      const months = differenceInMonths(today, date) + 1;
      date = addMonths(date, months);
    } else if (billingCycle === 'quarterly') {
      const quarters = Math.floor(differenceInMonths(today, date) / 3) + 1;
      date = addMonths(date, quarters * 3);
    } else if (billingCycle === 'yearly') {
      const years = differenceInYears(today, date) + 1;
      date = addYears(date, years);
    }
    // 端数補正（月末の日数差異など）: 最大1サイクルで収束
    if (date < today) {
      if (billingCycle === 'monthly') date = addMonths(date, 1);
      else if (billingCycle === 'quarterly') date = addMonths(date, 3);
      else if (billingCycle === 'yearly') date = addYears(date, 1);
    }
    return format(date, 'yyyy-MM-dd');
  } catch {
    return null;
  }
}

/**
 * 最終更新日時が staleDays 日以上前かどうかを返す。
 * cancel_planned の放置チェックなどに使用する。
 */
export function isStaleUpdate(updatedAt: string | null, staleDays: number): boolean {
  if (!updatedAt) return false;
  try {
    const updated = parseISO(updatedAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return differenceInCalendarDays(today, updated) >= staleDays;
  } catch {
    return false;
  }
}

export function formatShortDate(dateString: string | null): string {
  if (!dateString) return '—';
  try {
    return format(parseISO(dateString), 'M/d', { locale: ja });
  } catch {
    return '—';
  }
}
