import { Platform } from 'react-native';

/**
 * localStorage の容量超過 (QuotaExceededError) をアプリ側に通知するカスタムイベント名。
 * _layout.tsx のリスナーがこれを受け取り Alert を表示する。
 */
export const STORAGE_QUOTA_EVENT = 'mieru-toroku:storage-quota-exceeded' as const;

/**
 * Zustand persist の storage オプションに渡す安全なストレージラッパー。
 * - getItem / removeItem: 例外を握りつぶして null / void を返す
 * - setItem: QuotaExceededError をキャッチし、カスタムイベントで通知する
 *
 * Web 以外のプラットフォームでは呼ばれないが、念のため Platform チェックを入れている。
 */
export const safeStorage = {
  getItem: (name: string): string | null => {
    if (Platform.OS !== 'web') return null;
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },

  setItem: (name: string, value: string): void => {
    if (Platform.OS !== 'web') return;
    try {
      localStorage.setItem(name, value);
    } catch (e) {
      console.error('[safeStorage] setItem failed (quota exceeded?):', e);
      try {
        window.dispatchEvent(new CustomEvent(STORAGE_QUOTA_EVENT));
      } catch {
        // window が使えない環境では何もしない
      }
    }
  },

  removeItem: (name: string): void => {
    if (Platform.OS !== 'web') return;
    try {
      localStorage.removeItem(name);
    } catch {
      // 削除失敗は握りつぶしてよい
    }
  },
};
