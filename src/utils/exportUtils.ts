import type { Subscription } from '@/src/types';
import { BILLING_CYCLE_LABELS, STATUS_LABELS } from '@/src/constants/app';

/** エクスポートJSONのルート構造（将来のインポート機能でも使用） */
export interface ExportData {
  /** フォーマットバージョン */
  formatVersion: 1;
  exportedAt: string;
  subscriptionCount: number;
  subscriptions: Subscription[];
}

/**
 * サブスクリプション一覧を JSON ファイルとしてブラウザダウンロードする（Web のみ）。
 * ファイル名: sabusuku-seiri-YYYY-MM-DD.json
 */
export function exportSubscriptionsAsJSON(subscriptions: Subscription[]): void {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const data: ExportData = {
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    subscriptionCount: subscriptions.length,
    subscriptions,
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = `sabusuku-seiri-${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ─── インポート ──────────────────────────────────────────────

/**
 * JSON ファイルをパースして ExportData を返す。
 * 不正なファイルの場合は Error を throw する。
 */
export async function parseImportFile(file: File): Promise<ExportData> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('JSONの解析に失敗しました。ファイルが壊れているか、JSON形式ではありません。');
  }
  return validateImportData(parsed);
}

/**
 * unknown を ExportData として検証して返す。不正なら Error を throw する。
 * 各エントリの最低限フィールド（id, serviceName）だけチェックし、
 * 細かいフィールド補完はストアの migrate() に委ねる。
 */
export function validateImportData(raw: unknown): ExportData {
  if (!raw || typeof raw !== 'object') {
    throw new Error('不正なデータ形式です。');
  }
  const d = raw as Record<string, unknown>;
  if (d.formatVersion !== 1) {
    throw new Error(`未対応のフォーマットバージョンです（formatVersion: ${d.formatVersion}）。`);
  }
  if (!Array.isArray(d.subscriptions)) {
    throw new Error('subscriptions フィールドが見つかりません。');
  }
  const valid = (d.subscriptions as unknown[]).filter(
    (item): item is Subscription =>
      item !== null &&
      typeof item === 'object' &&
      typeof (item as Record<string, unknown>).id === 'string' &&
      typeof (item as Record<string, unknown>).serviceName === 'string',
  );
  return {
    formatVersion: 1,
    exportedAt: typeof d.exportedAt === 'string' ? d.exportedAt : new Date().toISOString(),
    subscriptionCount: valid.length,
    subscriptions: valid,
  };
}

// ─── CSV エクスポート ────────────────────────────────────────

/** CSV フィールドを適切にエスケープする（カンマ・改行・ダブルクォートを含む場合に引用符で囲む）。 */
function csvEscape(value: string | null | undefined): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * サブスクリプション一覧を CSV ファイルとしてブラウザダウンロードする（Web のみ）。
 * BOM 付き UTF-8 で出力するため Excel でも文字化けしない。
 * ファイル名: sabusuku-seiri-YYYY-MM-DD.csv
 */
export function exportSubscriptionsAsCSV(subscriptions: Subscription[]): void {
  const today = new Date().toISOString().slice(0, 10);

  const headers = [
    'サービス名', '金額', '通貨', '支払いサイクル', 'ステータス',
    '次回更新日', 'トライアル終了日', '利用開始日', 'カテゴリ', 'メモ', '登録日',
  ];

  const rows = subscriptions.map((s) => [
    csvEscape(s.serviceName),
    s.billingCycle === 'free' ? '0' : String(s.amount),
    csvEscape(s.currency ?? 'JPY'),
    csvEscape(BILLING_CYCLE_LABELS[s.billingCycle]),
    csvEscape(STATUS_LABELS[s.status]),
    csvEscape(s.nextRenewalDate),
    csvEscape(s.trialEndDate),
    csvEscape(s.startDate),
    csvEscape(s.category),
    csvEscape(s.memo),
    csvEscape(s.createdAt.slice(0, 10)),
  ].join(','));

  // UTF-8 BOM を先頭に付加して Excel での文字化けを防ぐ
  const bom = '\uFEFF';
  const csv = bom + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = `sabusuku-seiri-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    URL.revokeObjectURL(url);
  }
}
