import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettings } from '@/src/hooks/useSettings';
import { COLORS } from '@/src/constants/colors';

/**
 * ブート画面。
 * Zustand のハイドレーション完了（isLoading: false）を待ってからリダイレクトする。
 * router 静的インポートは web 初期化前に実行される場合があるため useRouter() を使用。
 */
export default function BootScreen() {
  const router = useRouter();
  const { settings, isLoading } = useSettings();

  useEffect(() => {
    if (isLoading) return;
    if (settings?.onboardingCompleted) {
      router.replace('/(main)');
    } else {
      router.replace('/onboarding');
    }
  }, [settings, isLoading, router]);

  return <View style={{ flex: 1, backgroundColor: COLORS.background }} />;
}
