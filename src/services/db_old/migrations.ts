import type { SQLiteDatabase } from 'expo-sqlite';

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS subscriptions (
      id                  TEXT PRIMARY KEY NOT NULL,
      service_name        TEXT NOT NULL,
      normalized_name     TEXT NOT NULL,
      amount              INTEGER NOT NULL DEFAULT 0,
      billing_cycle       TEXT NOT NULL DEFAULT 'monthly',
      category            TEXT,
      status              TEXT NOT NULL DEFAULT 'active',
      next_renewal_date   TEXT,
      trial_end_date      TEXT,
      start_date          TEXT,
      memo                TEXT,
      cancel_memo         TEXT,
      custom_cancel_url   TEXT,
      last_reviewed_date  TEXT,
      cancelled_at        TEXT,
      is_archived         INTEGER NOT NULL DEFAULT 0,
      created_at          TEXT NOT NULL,
      updated_at          TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      id                    INTEGER PRIMARY KEY NOT NULL DEFAULT 1,
      onboarding_completed  INTEGER NOT NULL DEFAULT 0,
      currency              TEXT NOT NULL DEFAULT 'JPY',
      created_at            TEXT NOT NULL,
      updated_at            TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS remote_config_meta (
      id          INTEGER PRIMARY KEY NOT NULL DEFAULT 1,
      version     TEXT,
      fetched_at  TEXT,
      etag        TEXT
    );

    INSERT OR IGNORE INTO app_settings (id, onboarding_completed, currency, created_at, updated_at)
      VALUES (1, 0, 'JPY', datetime('now'), datetime('now'));

    INSERT OR IGNORE INTO remote_config_meta (id, version, fetched_at, etag)
      VALUES (1, NULL, NULL, NULL);

    CREATE INDEX IF NOT EXISTS idx_sub_normalized_name   ON subscriptions (normalized_name);
    CREATE INDEX IF NOT EXISTS idx_sub_status            ON subscriptions (status);
    CREATE INDEX IF NOT EXISTS idx_sub_is_archived       ON subscriptions (is_archived);
    CREATE INDEX IF NOT EXISTS idx_sub_next_renewal_date ON subscriptions (next_renewal_date);
  `);
}
