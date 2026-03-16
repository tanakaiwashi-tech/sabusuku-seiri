import type { SQLiteDatabase } from 'expo-sqlite';
import type {
  Subscription,
  BillingCycle,
  CategoryOption,
  SubscriptionStatus,
} from '@/src/types';
import { nowISOString } from '@/src/utils/dateUtils';

export interface InsertSubscriptionData {
  id: string;
  serviceName: string;
  normalizedName: string;
  amount: number;
  billingCycle: BillingCycle;
  category: CategoryOption | null;
  status: SubscriptionStatus;
  nextRenewalDate: string | null;
  trialEndDate: string | null;
  startDate: string | null;
  memo: string | null;
  cancelMemo: string | null;
  customCancelUrl: string | null;
  lastReviewedDate: string | null;
  cancelledAt: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UpdateSubscriptionData = Partial<
  Omit<InsertSubscriptionData, 'id' | 'createdAt' | 'updatedAt'>
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSubscription(row: any): Subscription {
  return {
    id: row.id as string,
    serviceName: row.service_name as string,
    normalizedName: row.normalized_name as string,
    amount: row.amount as number,
    billingCycle: row.billing_cycle as BillingCycle,
    category: (row.category ?? null) as CategoryOption | null,
    status: row.status as SubscriptionStatus,
    nextRenewalDate: (row.next_renewal_date ?? null) as string | null,
    trialEndDate: (row.trial_end_date ?? null) as string | null,
    startDate: (row.start_date ?? null) as string | null,
    memo: (row.memo ?? null) as string | null,
    cancelMemo: (row.cancel_memo ?? null) as string | null,
    customCancelUrl: (row.custom_cancel_url ?? null) as string | null,
    lastReviewedDate: (row.last_reviewed_date ?? null) as string | null,
    cancelledAt: (row.cancelled_at ?? null) as string | null,
    isArchived: row.is_archived === 1,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getAllSubscriptions(
  db: SQLiteDatabase,
  includeArchived = false,
): Promise<Subscription[]> {
  const sql = includeArchived
    ? 'SELECT * FROM subscriptions ORDER BY created_at DESC'
    : 'SELECT * FROM subscriptions WHERE is_archived = 0 ORDER BY created_at DESC';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await db.getAllAsync<any>(sql);
  return rows.map(rowToSubscription);
}

export async function getSubscriptionById(
  db: SQLiteDatabase,
  id: string,
): Promise<Subscription | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM subscriptions WHERE id = ?',
    [id],
  );
  return row ? rowToSubscription(row) : null;
}

export async function countNonArchivedSubscriptions(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM subscriptions WHERE is_archived = 0',
  );
  return row?.count ?? 0;
}

export async function insertSubscription(
  db: SQLiteDatabase,
  data: InsertSubscriptionData,
): Promise<void> {
  await db.runAsync(
    `INSERT INTO subscriptions (
      id, service_name, normalized_name, amount, billing_cycle, category,
      status, next_renewal_date, trial_end_date, start_date, memo,
      cancel_memo, custom_cancel_url, last_reviewed_date, cancelled_at,
      is_archived, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.id,
      data.serviceName,
      data.normalizedName,
      data.amount,
      data.billingCycle,
      data.category,
      data.status,
      data.nextRenewalDate,
      data.trialEndDate,
      data.startDate,
      data.memo,
      data.cancelMemo,
      data.customCancelUrl,
      data.lastReviewedDate,
      data.cancelledAt,
      data.isArchived ? 1 : 0,
      data.createdAt,
      data.updatedAt,
    ],
  );
}

export async function updateSubscription(
  db: SQLiteDatabase,
  id: string,
  data: UpdateSubscriptionData,
): Promise<{ updatedAt: string }> {
  const updatedAt = nowISOString();
  const sets: string[] = ['updated_at = ?'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values: any[] = [updatedAt];

  if (data.serviceName !== undefined) { sets.push('service_name = ?'); values.push(data.serviceName); }
  if (data.normalizedName !== undefined) { sets.push('normalized_name = ?'); values.push(data.normalizedName); }
  if (data.amount !== undefined) { sets.push('amount = ?'); values.push(data.amount); }
  if (data.billingCycle !== undefined) { sets.push('billing_cycle = ?'); values.push(data.billingCycle); }
  if ('category' in data) { sets.push('category = ?'); values.push(data.category ?? null); }
  if (data.status !== undefined) { sets.push('status = ?'); values.push(data.status); }
  if ('nextRenewalDate' in data) { sets.push('next_renewal_date = ?'); values.push(data.nextRenewalDate ?? null); }
  if ('trialEndDate' in data) { sets.push('trial_end_date = ?'); values.push(data.trialEndDate ?? null); }
  if ('startDate' in data) { sets.push('start_date = ?'); values.push(data.startDate ?? null); }
  if ('memo' in data) { sets.push('memo = ?'); values.push(data.memo ?? null); }
  if ('cancelMemo' in data) { sets.push('cancel_memo = ?'); values.push(data.cancelMemo ?? null); }
  if ('customCancelUrl' in data) { sets.push('custom_cancel_url = ?'); values.push(data.customCancelUrl ?? null); }
  if ('lastReviewedDate' in data) { sets.push('last_reviewed_date = ?'); values.push(data.lastReviewedDate ?? null); }
  if ('cancelledAt' in data) { sets.push('cancelled_at = ?'); values.push(data.cancelledAt ?? null); }
  if (data.isArchived !== undefined) { sets.push('is_archived = ?'); values.push(data.isArchived ? 1 : 0); }

  values.push(id);
  await db.runAsync(`UPDATE subscriptions SET ${sets.join(', ')} WHERE id = ?`, values);
  return { updatedAt };
}
