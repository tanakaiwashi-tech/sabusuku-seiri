import { Platform } from 'react-native';

/**
 * localStorage の容量超過 (QuotaExceededError) をアプリ側に通知するカスタムイベント名。
 * _layout.tsx のリスナーがこれを受け取り Alert を表示する。
 */
export const STORAGE_QUOTA_EVENT = 'mieru-toroku:storage-quota-exceeded' as const;

// ── IndexedDB ヘルパー ──────────────────────────────────────────
// localStorage が消去された場合のバックアップとして IndexedDB を使用する。
// localStorage を同期の一次ストレージとして維持しつつ、
// 書き込みのたびに IDB へもバックグラウンドコピーする。
const IDB_NAME = 'mieru-toroku-idb';
const IDB_STORE = 'kv';
const IDB_VERSION = 1;

let _dbPromise: Promise<IDBDatabase> | null = null;

function openIDB(): Promise<IDBDatabase> {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    try {
      const req = indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = (e) => {
        (e.target as IDBOpenDBRequest).result.createObjectStore(IDB_STORE);
      };
      req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
      req.onerror = () => {
        _dbPromise = null;
        reject(req.error);
      };
    } catch (e) {
      _dbPromise = null;
      reject(e);
    }
  });
  return _dbPromise;
}

async function idbGet(key: string): Promise<string | null> {
  try {
    const db = await openIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(key);
      req.onsuccess = () => resolve((req.result as string | undefined) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function idbSet(key: string, value: string): Promise<void> {
  try {
    const db = await openIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // IDB 書き込み失敗は無視（localStorage が一次ストレージなので致命的ではない）
  }
}

async function idbRemove(key: string): Promise<void> {
  try {
    const db = await openIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // 無視
  }
}

/**
 * localStorage が空で IDB にバックアップが存在するかチェックする。
 * データが見つかった場合はその JSON 文字列を返す（復元候補）。
 * localStorage にデータがある場合や IDB にもない場合は null を返す。
 */
export async function checkIDBRecovery(lsKey: string): Promise<string | null> {
  if (Platform.OS !== 'web') return null;
  try {
    // localStorage に既存データがある場合は復元不要
    const lsVal = localStorage.getItem(lsKey);
    if (lsVal !== null) return null;
    return await idbGet(lsKey);
  } catch {
    return null;
  }
}

// ── Zustand persist 用ストレージアダプタ ───────────────────────
/**
 * localStorage を一次ストレージとして使いつつ、
 * 書き込みのたびに IndexedDB へもバックグラウンドコピーする。
 *
 * - 読み込み: localStorage（同期）→ 高速・チラつきなし
 * - 書き込み: localStorage（同期） + IndexedDB（非同期・fire-and-forget）
 * - 復元: _layout.tsx の checkIDBRecovery() が起動時に確認する
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
    // IndexedDB へバックグラウンドコピー（失敗しても無視）
    idbSet(name, value).catch(() => {});
  },

  removeItem: (name: string): void => {
    if (Platform.OS !== 'web') return;
    try {
      localStorage.removeItem(name);
    } catch {
      // 削除失敗は握りつぶしてよい
    }
    idbRemove(name).catch(() => {});
  },
};
