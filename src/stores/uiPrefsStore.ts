import { create, type StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/src/utils/storageUtils';
import type { SortKey } from '@/src/constants/app';

export type FilterStatus = 'all' | 'active' | 'reviewing' | 'cancel_planned' | 'stopped';

export interface UiPrefsState {
  sortKey: SortKey;
  setSortKey: (key: SortKey) => void;
  filterStatus: FilterStatus;
  setFilterStatus: (status: FilterStatus) => void;
  /** Gmailスキャンを最後に完了した日時（ISO文字列）。未スキャンはnull */
  lastGmailScanAt: string | null;
  setLastGmailScanAt: (at: string) => void;
  /** フィルターチップ説明を閉じたかどうか */
  filterTipDismissed: boolean;
  setFilterTipDismissed: (v: boolean) => void;
  /** 最後にエクスポートした日時（ISO文字列）。未エクスポートはnull */
  lastExportedAt: string | null;
  setLastExportedAt: (at: string) => void;
  /** バックアップ促進バナーを非表示にする期限（ISO文字列）。nullは非表示設定なし */
  exportNudgeDismissedUntil: string | null;
  setExportNudgeDismissedUntil: (until: string | null) => void;
  /** 非表示一覧の説明バナーを閉じたかどうか */
  archivedBannerDismissed: boolean;
  setArchivedBannerDismissed: (v: boolean) => void;
  /** 90日バックアップ未実施アラートを次に表示する日時（ISO文字列）。nullは非抑制 */
  backupModalDismissedUntil: string | null;
  setBackupModalDismissedUntil: (until: string | null) => void;
  /** ライブ取得した USD→JPY レート。nullは未取得（フォールバック定数を使用） */
  usdToJpyRate: number | null;
  /** usdToJpyRate を取得した日時（ISO文字列）。nullは未取得 */
  usdRateFetchedAt: string | null;
  setUsdRate: (rate: number, fetchedAt: string) => void;
  /** 更新日通知を最後に送った日付（YYYY-MM-DD）。nullは未送信 */
  renewalNotificationDate: string | null;
  setRenewalNotificationDate: (date: string) => void;
}

const uiPrefsCreator: StateCreator<UiPrefsState> = (set) => ({
  sortKey: 'createdAt',
  setSortKey: (key: SortKey) => set({ sortKey: key }),
  filterStatus: 'all',
  setFilterStatus: (status: FilterStatus) => set({ filterStatus: status }),
  lastGmailScanAt: null,
  setLastGmailScanAt: (at: string) => set({ lastGmailScanAt: at }),
  filterTipDismissed: false,
  setFilterTipDismissed: (v: boolean) => set({ filterTipDismissed: v }),
  lastExportedAt: null,
  setLastExportedAt: (at: string) => set({ lastExportedAt: at }),
  exportNudgeDismissedUntil: null,
  setExportNudgeDismissedUntil: (until: string | null) => set({ exportNudgeDismissedUntil: until }),
  archivedBannerDismissed: false,
  setArchivedBannerDismissed: (v: boolean) => set({ archivedBannerDismissed: v }),
  backupModalDismissedUntil: null,
  setBackupModalDismissedUntil: (until: string | null) => set({ backupModalDismissedUntil: until }),
  usdToJpyRate: null,
  usdRateFetchedAt: null,
  setUsdRate: (rate: number, fetchedAt: string) => set({ usdToJpyRate: rate, usdRateFetchedAt: fetchedAt }),
  renewalNotificationDate: null,
  setRenewalNotificationDate: (date: string) => set({ renewalNotificationDate: date }),
});

export const useUiPrefsStore = create<UiPrefsState>()(
  persist(uiPrefsCreator, {
    name: 'mieru-toroku-ui-prefs',
    storage: createJSONStorage(() => safeStorage),
  }),
);
