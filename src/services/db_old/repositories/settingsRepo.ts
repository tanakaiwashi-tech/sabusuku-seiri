import type { SQLiteDatabase } from 'expo-sqlite';
import type { AppSettings } from '@/src/types';
import { nowISOString } from '@/src/utils/dateUtils';

const DEFAULTS = {
  onboardingCompleted: false,
  currency: 'JPY',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSettings(row: any): AppSettings {
  return {
    id: row.id as number,
    onboardingCompleted: row.onboarding_completed === 1,
    currency: row.currency as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getSettings(db: SQLiteDatabase): Promise<AppSettings> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = await db.getFirstAsync<any>('SELECT * FROM app_settings WHERE id = 1');
  if (row) return rowToSettings(row);

  // フォールバック: rowがなければデフォルト値を挿入して返す
  const now = nowISOString();
  await db.runAsync(
    'INSERT OR IGNORE INTO app_settings (id, onboarding_completed, currency, created_at, updated_at) VALUES (1, 0, ?, ?, ?)',
    [DEFAULTS.currency, now, now],
  );
  return {
    id: 1,
    onboardingCompleted: DEFAULTS.onboardingCompleted,
    currency: DEFAULTS.currency,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateSettings(
  db: SQLiteDatabase,
  patch: Partial<Pick<AppSettings, 'onboardingCompleted' | 'currency'>>,
): Promise<void> {
  const updatedAt = nowISOString();
  const sets: string[] = ['updated_at = ?'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values: any[] = [updatedAt];

  if (patch.onboardingCompleted !== undefined) {
    sets.push('onboarding_completed = ?');
    values.push(patch.onboardingCompleted ? 1 : 0);
  }
  if (patch.currency !== undefined) {
    sets.push('currency = ?');
    values.push(patch.currency);
  }

  values.push(1);
  await db.runAsync(`UPDATE app_settings SET ${sets.join(', ')} WHERE id = ?`, values);
}
