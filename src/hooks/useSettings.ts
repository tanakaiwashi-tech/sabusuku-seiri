import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/src/stores/settingsStore';

/**
 * 設定を読み書きするフック。
 * Zustand v5 の persist は localStorage でも非同期でハイドレーションするため、
 * hasHydrated() で完了を検知してから isLoading: false にする。
 * これにより BootScreen がハイドレーション前に誤リダイレクトするのを防ぐ。
 */
export function useSettings() {
  const { settings, update } = useSettingsStore();

  const [isLoading, setIsLoading] = useState(
    !useSettingsStore.persist.hasHydrated(),
  );

  useEffect(() => {
    if (!isLoading) return;

    // 500ms 以内に hydration が完了しない場合は強制起動（永久ローディング防止）
    // localStorage の読み込みは通常 < 50ms のため、500ms あれば十分。
    const timer = setTimeout(() => setIsLoading(false), 500);

    const unsub = useSettingsStore.persist.onFinishHydration(() => {
      clearTimeout(timer);
      setIsLoading(false);
    });

    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, [isLoading]);

  return { settings, isLoading, update };
}
