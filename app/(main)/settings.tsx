import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/src/constants/colors';
import { useSubscriptionStore } from '@/src/stores/subscriptionStore';
import { exportSubscriptionsAsJSON } from '@/src/utils/exportUtils';

export default function SettingsScreen() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    if (subscriptions.length === 0) {
      Alert.alert('エクスポート', '登録データがありません。');
      return;
    }

    Alert.alert(
      'データをエクスポート',
      `${subscriptions.length}件のデータをJSONファイルでダウンロードします。\nブラウザのダウンロードフォルダに保存されます。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'ダウンロード',
          onPress: () => {
            try {
              setIsExporting(true);
              exportSubscriptionsAsJSON(subscriptions);
            } catch {
              Alert.alert('エラー', 'エクスポートに失敗しました。');
            } finally {
              setIsExporting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>設定</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* データ管理 */}
        <Text style={styles.groupLabel}>データ管理</Text>
        <View style={styles.group}>
          <TouchableOpacity
            style={styles.row}
            onPress={handleExport}
            activeOpacity={0.7}
            disabled={isExporting}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconWrap}>
                <Ionicons name="download-outline" size={19} color={COLORS.primary} />
              </View>
              <View style={styles.rowTexts}>
                <Text style={styles.rowLabel}>データをエクスポート</Text>
                <Text style={styles.rowDesc}>
                  {subscriptions.length === 0
                    ? 'まだ登録がありません'
                    : `${subscriptions.length}件 — JSON形式でダウンロード`}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>
          {'ブラウザのデータ消去前にエクスポートしておくと、\nデータを手元に残せます。'}
        </Text>

        {/* このアプリについて */}
        <Text style={[styles.groupLabel, styles.groupLabelGap]}>このアプリについて</Text>
        <View style={styles.group}>
          <TouchableOpacity
            style={[styles.row, styles.rowBorder]}
            onPress={() => router.push('/privacy')}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconWrap}>
                <Ionicons name="shield-checkmark-outline" size={19} color={COLORS.primary} />
              </View>
              <Text style={styles.rowLabel}>プライバシーポリシー</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconWrap}>
                <Ionicons name="information-circle-outline" size={19} color={COLORS.textMuted} />
              </View>
              <Text style={styles.rowLabel}>バージョン</Text>
            </View>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
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
  headerTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  scroll: { padding: 16, paddingBottom: 48 },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.4,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  groupLabelGap: { marginTop: 28 },
  group: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTexts: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  rowDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  rowValue: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    paddingHorizontal: 4,
    marginTop: 8,
  },
});
