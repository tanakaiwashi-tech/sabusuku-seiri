import { create, type StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/src/utils/storageUtils';
import type { SortKey } from '@/src/constants/app';

export interface UiPrefsState {
  sortKey: SortKey;
  setSortKey: (key: SortKey) => void;
}

const uiPrefsCreator: StateCreator<UiPrefsState> = (set) => ({
  sortKey: 'createdAt',
  setSortKey: (key: SortKey) => set({ sortKey: key }),
});

export const useUiPrefsStore = create<UiPrefsState>()(
  persist(uiPrefsCreator, {
    name: 'mieru-toroku-ui-prefs',
    storage: createJSONStorage(() => safeStorage),
  }),
);
