import { create, type StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/src/utils/storageUtils';
import type { AppSettings } from '@/src/types';
import { nowISOString } from '@/src/utils/dateUtils';

const DEFAULT_SETTINGS: AppSettings = {
  id: 1,
  onboardingCompleted: false,
  currency: 'JPY',
  createdAt: nowISOString(),
  updatedAt: nowISOString(),
};

export interface SettingsState {
  settings: AppSettings;
  update: (patch: Partial<Pick<AppSettings, 'onboardingCompleted' | 'currency'>>) => void;
}

// StateCreator<T> で明示的に型付けし、persist ラッパー内の implicit any を防ぐ
const settingsCreator: StateCreator<SettingsState> = (set) => ({
  settings: DEFAULT_SETTINGS,
  update: (patch) =>
    set((state: SettingsState) => ({
      settings: { ...state.settings, ...patch, updatedAt: nowISOString() },
    })),
});

export const useSettingsStore = create<SettingsState>()(
  persist(settingsCreator, {
    name: 'mieru-toroku-settings',
    version: 1,
    storage: createJSONStorage(() => safeStorage),
    // v0 → v1: スキーマ変更なし。既存データをそのまま引き継ぐ。
    // 次回スキーマ変更時は version を 2 に上げて、ここに変換処理を追加する。
    migrate: (persistedState: unknown) => persistedState as SettingsState,
  }),
);
