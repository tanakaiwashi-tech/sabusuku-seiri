import React, { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { COLORS } from '@/src/constants/colors';
import { ErrorBoundary } from '@/src/components/ui/ErrorBoundary';
import { STORAGE_QUOTA_EVENT, checkIDBRecovery } from '@/src/utils/storageUtils';

// Zustand の persist ストアキー（サブスク本体データのみ復元対象）
const SUBSCRIPTION_STORE_KEY = 'mieru-toroku-subscriptions';

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

  // IndexedDB バックアップからの復元チェック
  // localStorage が空（消去済み）で IDB にバックアップがある場合に復元を提案する
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    checkIDBRecovery(SUBSCRIPTION_STORE_KEY).then((idbData) => {
      if (!idbData) return;
      let count = 0;
      try {
        const parsed = JSON.parse(idbData) as { state?: { subscriptions?: unknown[] } };
        count = parsed?.state?.subscriptions?.length ?? 0;
      } catch {
        return;
      }
      if (count === 0) return;
      Alert.alert(
        '📦 バックアップが見つかりました',
        `バックアップに ${count} 件のサブスク記録があります。\n以前のデータを復元しますか？`,
        [
          {
            text: '復元する',
            onPress: () => {
              try {
                localStorage.setItem(SUBSCRIPTION_STORE_KEY, idbData);
                window.location.reload();
              } catch {
                Alert.alert('復元失敗', 'データの復元中にエラーが発生しました。');
              }
            },
          },
          { text: 'スキップ', style: 'cancel' },
        ],
      );
    });
  }, []);

  return (
    <ErrorBoundary>
      <Head>
        <html lang="ja" />
        <title>サブスク整理</title>
        <meta name="description" content="サブスクを整理する、静かなツール。" />
        <style>{`body { background-color: ${COLORS.background}; }`}</style>
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#5B7A6E" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="サブスク整理" />
        <link rel="apple-touch-icon" href="/favicon.png" />
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
