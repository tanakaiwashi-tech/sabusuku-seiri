import React from 'react';
import { ScrollView, Text, View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/src/constants/colors';

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>プライバシーポリシー</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Section title="データの取り扱い">
          このアプリに入力したすべてのデータは、お使いの端末（ブラウザのローカルストレージ）にのみ保存されます。
          外部サーバーへの送信、クラウドへの保存、第三者への提供は一切行いません。
          アカウント登録も不要です。
        </Section>

        <Section title="データのバックアップ">
          設定画面の「データをエクスポート」から、登録データをJSONファイルとして端末にダウンロードできます。
          ブラウザのデータ消去やデバイス変更の前にエクスポートしておくことをお勧めします。
          エクスポートファイルには登録したサブスク情報がすべて含まれます。
          ファイルは端末のダウンロードフォルダに保存され、外部に送信されることはありません。
        </Section>

        <Section title="データの消去について">
          ブラウザのキャッシュ・サイトデータを削除すると、登録したすべてのデータが消去されます。
          また、iOSのSafariではITP（トラッキング防止機能）により、一定期間アクセスがない場合にローカルストレージが自動削除されることがあります。
          大切なデータは定期的にエクスポートしてバックアップを取ることをお勧めします。
          当アプリはデータ消失に対する責任を負いません。
        </Section>

        <Section title="ロゴ・アイコン表示について">
          登録一覧画面では、サービス名に対応したロゴアイコンをDuckDuckGoのFaviconサービス（icons.duckduckgo.com）から取得して表示する場合があります。
          取得できない場合はGoogleのFaviconサービス（google.com/s2/favicons）を使用します。
          いずれの場合も対象サービスのドメイン名（例: spotify.com）が外部サーバーに送信されます。個人情報は含まれません。
          ロゴが取得できない場合はサービス名の頭文字が表示されます。
        </Section>

        <Section title="解約URLについて">
          各サービスの解約ページURLはユーザーの利便性のための参考情報です。
          サービス提供者の都合により変更・廃止される場合があります。
          URLの正確性・有効性を保証するものではありません。
          必ず各サービスの公式情報をご確認ください。
        </Section>

        <Section title="アクセス解析・広告・クラッシュ収集">
          当アプリはアクセス解析ツール、広告 SDK、クラッシュ収集ツール（Sentry 等）を
          一切使用していません。ユーザーの行動データを収集・送信する仕組みはありません。
        </Section>

        <Section title="免責事項">
          当アプリの利用により生じた損害（データ消失・誤情報に基づく判断など）について、
          開発者は一切の責任を負いません。自己責任のもとでご利用ください。
        </Section>

        <Text style={styles.updated}>最終更新: 2026年3月</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    padding: 20,
    gap: 4,
    paddingBottom: 48,
  },
  section: {
    marginTop: 20,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  updated: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 32,
    textAlign: 'right',
  },
});
