import { create, type StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/src/utils/storageUtils';
import type { Subscription, SubscriptionFormData } from '@/src/types';
import { generateId } from '@/src/utils/idUtils';
import { nowISOString, suggestNextRenewalDate } from '@/src/utils/dateUtils';
import { normalizeServiceName } from '@/src/utils/amountUtils';

export type SaveResult =
  | { ok: true; subscription: Subscription }
  | { ok: false; error: 'limit_reached' | 'unknown' };

export interface SubscriptionState {
  subscriptions: Subscription[];
  add: (data: SubscriptionFormData) => SaveResult;
  update: (id: string, data: SubscriptionFormData) => SaveResult;
  /** 指定 ID のサブスクリプションを完全削除する。 */
  remove: (id: string) => void;
  getById: (id: string) => Subscription | undefined;
  /**
   * インポート: 'replace' は全データを置き換え、'merge' は id が重複しないものだけ追加する。
   * インポート後に Zustand の persist が localStorage に書き込む。
   */
  importSubscriptions: (mode: 'replace' | 'merge', incoming: Subscription[]) => void;
  /** active でかつ更新日が過去のサブスクの nextRenewalDate を次回サイクルへ一括繰り越す。 */
  batchRolloverRenewalDates: () => void;
}

// StateCreator<T> で明示的に型付けし、persist ラッパー内の implicit any を防ぐ
const subscriptionCreator: StateCreator<SubscriptionState> = (set, get) => ({
  subscriptions: [],

  add: (data: SubscriptionFormData): SaveResult => {
    // 上限チェックは撤廃（FREE_LIMIT_COUNT は new.tsx の型整合性のために app.ts に残置）
    try {
      const now = nowISOString();
      const newSub: Subscription = {
        id: generateId(),
        serviceName: data.serviceName,
        normalizedName: normalizeServiceName(data.serviceName),
        amount: data.amount,
        currency: data.currency,
        billingCycle: data.billingCycle,
        category: data.category,
        status: data.status,
        nextRenewalDate: data.nextRenewalDate,
        trialEndDate: data.trialEndDate,
        startDate: data.startDate ?? null,
        memo: data.memo,
        cancelMemo: data.cancelMemo,
        customCancelUrl: data.customCancelUrl,
        lastReviewedDate: null,
        cancelledAt: data.status === 'stopped' ? now : null,
        isArchived: data.isArchived,
        createdAt: now,
        updatedAt: now,
      };

      set((state: SubscriptionState) => ({
        subscriptions: [...state.subscriptions, newSub],
      }));
      return { ok: true, subscription: newSub };
    } catch (e) {
      console.error('subscriptionStore.add failed:', e);
      return { ok: false, error: 'unknown' };
    }
  },

  update: (id: string, data: SubscriptionFormData): SaveResult => {
    try {
      const current = get().subscriptions.find((s: Subscription) => s.id === id);
      if (!current) return { ok: false, error: 'unknown' };

      // cancelledAt: stopped への初回遷移時のみセット。以降は変更しない。
      let cancelledAt = current.cancelledAt;
      if (
        data.status === 'stopped' &&
        current.status !== 'stopped' &&
        cancelledAt === null
      ) {
        cancelledAt = nowISOString();
      }

      const updated: Subscription = {
        ...current,
        serviceName: data.serviceName,
        normalizedName: normalizeServiceName(data.serviceName),
        amount: data.amount,
        currency: data.currency,
        billingCycle: data.billingCycle,
        category: data.category,
        status: data.status,
        nextRenewalDate: data.nextRenewalDate,
        trialEndDate: data.trialEndDate,
        startDate: data.startDate,
        memo: data.memo,
        cancelMemo: data.cancelMemo,
        customCancelUrl: data.customCancelUrl,
        cancelledAt,
        isArchived: data.isArchived,
        updatedAt: nowISOString(),
      };

      set((state: SubscriptionState) => ({
        subscriptions: state.subscriptions.map(
          (s: Subscription) => (s.id === id ? updated : s),
        ),
      }));
      return { ok: true, subscription: updated };
    } catch (e) {
      console.error('subscriptionStore.update failed:', e);
      return { ok: false, error: 'unknown' };
    }
  },

  remove: (id: string): void => {
    set((state: SubscriptionState) => ({
      subscriptions: state.subscriptions.filter((s: Subscription) => s.id !== id),
    }));
  },

  getById: (id: string): Subscription | undefined =>
    get().subscriptions.find((s: Subscription) => s.id === id),

  importSubscriptions: (mode: 'replace' | 'merge', incoming: Subscription[]): void => {
    set((state: SubscriptionState) => {
      if (mode === 'replace') {
        return { subscriptions: incoming };
      }
      // merge: 既存に id が存在しないものだけ追加
      const existingIds = new Set(state.subscriptions.map((s: Subscription) => s.id));
      const toAdd = incoming.filter((s: Subscription) => !existingIds.has(s.id));
      return { subscriptions: [...state.subscriptions, ...toAdd] };
    });
  },

  batchRolloverRenewalDates: (): void => {
    const now = nowISOString();
    set((state: SubscriptionState) => {
      const updated = state.subscriptions.map((s: Subscription) => {
        if (s.status !== 'active') return s;
        const suggested = suggestNextRenewalDate(s.nextRenewalDate, s.billingCycle);
        if (!suggested) return s;
        return { ...s, nextRenewalDate: suggested, updatedAt: now };
      });
      return { subscriptions: updated };
    });
  },
});

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(subscriptionCreator, {
    name: 'mieru-toroku-subscriptions',
    version: 1,
    storage: createJSONStorage(() => safeStorage),
    // v0 → v1: スキーマ変更なし。ただし subscriptions が壊れていた場合の安全ガードを追加。
    // 次回スキーマ変更時は version を 2 に上げて、ここに変換処理を追加する。
    migrate: (persistedState: unknown): SubscriptionState => {
      const stored = persistedState as Partial<SubscriptionState> | null | undefined;
      const rawSubs = stored?.subscriptions;

      // subscriptions が配列でない場合（null / undefined / 型崩れ）は空配列にフォールバック。
      // 配列の場合も、必須フィールドが欠損しているエントリは除外して破損データを排除する。
      const subscriptions: Subscription[] = Array.isArray(rawSubs)
        ? rawSubs.filter(
            (item): item is Subscription =>
              item !== null &&
              typeof item === 'object' &&
              typeof (item as Subscription).id === 'string' &&
              typeof (item as Subscription).serviceName === 'string' &&
              typeof (item as Subscription).isArchived === 'boolean',
          )
        : [];

      return { ...(stored ?? {}), subscriptions } as SubscriptionState;
    },
  }),
);
