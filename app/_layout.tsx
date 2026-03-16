import React, { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { COLORS } from '@/src/constants/colors';
import { ErrorBoundary } from '@/src/components/ui/ErrorBoundary';
import { STORAGE_QUOTA_EVENT } from '@/src/utils/storageUtils';

/** ルートレイアウト。SQLiteProvider は Zustand に移行したため不要。 */
export default function RootLayout() {
  // localStorage 容量超過をストレージ層からイベント経由で受け取り、Alert で通知する
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = () => {
      Alert.alert(
        '保存できませんでした',
        'ブラウザのストレージ容量が不足しています。\n不要なサブスクをアーカイブするか、ブラウザのキャッシュを整理してください。',
        [{ text: 'OK' }],
      );
    };
    window.addEventListener(STORAGE_QUOTA_EVENT, handler);
    return () => window.removeEventListener(STORAGE_QUOTA_EVENT, handler);
  }, []);

  return (
    <ErrorBoundary>
      <Head>
        <html lang="ja" />
        <title>みえる登録</title>
        <meta name="description" content="サブスクを整理する、静かなツール。" />
        <style>{`body { background-color: ${COLORS.background}; }`}</style>
      </Head>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(main)" />
        <Stack.Screen
          name="subscription/new"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="subscription/[id]" />
        <Stack.Screen
          name="privacy"
          options={{ presentation: 'modal' }}
        />
      </Stack>
    </ErrorBoundary>
  );
}
