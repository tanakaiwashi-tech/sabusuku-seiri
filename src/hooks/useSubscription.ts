import { useMemo, useCallback } from 'react';
import { useSubscriptionStore, type SubscriptionState, type SaveResult } from '@/src/stores/subscriptionStore';
import type { Subscription, SubscriptionFormData } from '@/src/types';

export type { SaveResult };

/** 単一サブスクリプションの取得・保存フック。Zustand ストアの薄いラッパー。 */
export function useSubscription(id?: string) {
  const subscriptions = useSubscriptionStore((s: SubscriptionState) => s.subscriptions);
  const { add, update, remove } = useSubscriptionStore();

  const current: Subscription | null = useMemo(
    () => (id ? subscriptions.find((s: Subscription) => s.id === id) ?? null : null),
    [subscriptions, id],
  );

  const save = useCallback(
    async (formData: SubscriptionFormData): Promise<SaveResult> => {
      if (current === null) {
        return add(formData);
      } else {
        return update(current.id, formData);
      }
    },
    [add, update, current],
  );

  const permanentlyDelete = useCallback(() => {
    if (current?.id) remove(current.id);
  }, [remove, current]);

  // isLoading は常に false（Zustand は同期ストア）
  return { current, isLoading: false as const, save, permanentlyDelete };
}
