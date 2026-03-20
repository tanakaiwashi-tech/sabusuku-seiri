import type { Subscription } from '@/src/types';

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
 * ファイル名: mieru-toroku-YYYY-MM-DD.json
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
    a.download = `mieru-toroku-${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    URL.revokeObjectURL(url);
  }
}
