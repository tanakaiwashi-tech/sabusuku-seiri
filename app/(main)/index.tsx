import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/src/constants/colors';
import { useSubscriptions } from '@/src/hooks/useSubscriptions';
import { useSubscriptionStore } from '@/src/stores/subscriptionStore';
import { useUiPrefsStore, type FilterStatus } from '@/src/stores/uiPrefsStore';
import { SummaryBar } from '@/src/components/subscription/SummaryBar';
import { SubscriptionListItem } from '@/src/components/subscription/SubscriptionListItem';
import { CategoryBreakdown } from '@/src/components/subscription/CategoryBreakdown';
import { toMonthlyAmount, toJPY, formatAmount } from '@/src/utils/amountUtils';
import { STALE_CANCEL_DAYS, USD_TO_JPY_RATE } from '@/src/constants/app';
import { useExchangeRate } from '@/src/hooks/useExchangeRate';
import { useRenewalNotifications } from '@/src/hooks/useRenewalNotifications';
import type { SortKey } from '@/src/constants/app';
import type { Subscription } from '@/src/types';

/** FlatList のデータ型: サブスク or 解約済みセクションヘッダー */
type StoppedSectionHeader = { type: 'stopped-section-header'; count: number };
type ListItem = Subscription | StoppedSectionHeader;

const FILTER_LABELS: Record<FilterStatus, string> = {
  all: '全て',
  active: '継続中',
  reviewing: '見直す',
  cancel_planned: '解約する',
  stopped: '解約済み',
};
const FILTERS: FilterStatus[] = ['all', 'active', 'reviewing', 'cancel_planned', 'stopped'];
const SORT_LABELS: Record<SortKey, string> = {
  createdAt: '登録順',
  nextRenewalDate: '更新日順',
  amount: '金額順',
};
const SORTS: SortKey[] = ['createdAt', 'nextRenewalDate', 'amount'];

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Ionicons name="receipt-outline" size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>まだ登録がありません</Text>
      <Text style={styles.emptyDesc}>{'使っているサブスクを登録して、\n支出を整理しましょう'}</Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => router.push('/subscription/new')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={18} color="#FFFFFF" />
        <Text style={styles.emptyButtonText}>手動で登録する</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.emptyGmailButton}
        onPress={() => router.push('/(main)/gmail-scan')}
        activeOpacity={0.8}
      >
        <Ionicons name="mail-outline" size={16} color={COLORS.primary} />
        <Text style={styles.emptyGmailButtonText}>Gmailから自動で探す</Text>
      </TouchableOpacity>
    </View>
  );
}

function FilteredEmptyState({ onClear }: { onClear: () => void }) {
  return (
    <View style={styles.empty}>
      <Ionicons name="filter-outline" size={40} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>該当なし</Text>
      <Text style={styles.emptyDesc}>この条件には登録がありません</Text>
      <TouchableOpacity style={styles.clearButton} onPress={onClear} activeOpacity={0.7}>
        <Text style={styles.clearButtonText}>すべて表示に戻す</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen() {
  const { subscriptions, summary } = useSubscriptions();
  const usdRate = useExchangeRate();
  useRenewalNotifications();
  const batchRolloverRenewalDates = useSubscriptionStore((s) => s.batchRolloverRenewalDates);
  const { sortKey, setSortKey, filterStatus, setFilterStatus, filterTipDismissed, setFilterTipDismissed, lastExportedAt, exportNudgeDismissedUntil, setExportNudgeDismissedUntil, backupModalDismissedUntil, setBackupModalDismissedUntil } = useUiPrefsStore();
  const [shareText, setShareText] = useState<string | null>(null);

  const handleItemPress = (item: Subscription) => {
    router.push(`/subscription/${item.id}`);
  };

  const cycleSortKey = () => {
    const idx = SORTS.indexOf(sortKey);
    setSortKey(SORTS[(idx + 1) % SORTS.length]);
  };

  const generateShareText = () => {
    const d = new Date();
    const dateStr = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;

    const BILLING_SHORT: Record<string, string> = {
      yearly: '年', quarterly: '3ヶ月', irregular: '回',
    };

    const formatServiceAmount = (s: Subscription): string => {
      const cur = s.currency ?? 'JPY';
      if (s.billingCycle === 'free') return '無料';
      if (s.amount === 0) return '金額未設定';
      const monthly = toMonthlyAmount(s.amount, s.billingCycle);
      const monthlyJPY = monthly !== null ? toJPY(monthly, cur, usdRate) : null;
      const isMonthlyJPY = s.billingCycle === 'monthly' && cur === 'JPY';
      if (monthlyJPY === null) return formatAmount(s.amount, cur); // irregular
      if (isMonthlyJPY) return `${formatAmount(monthlyJPY)}/月`;
      const periodLabel = BILLING_SHORT[s.billingCycle];
      // 月払い非JPY: 期間ラベル不要、元金額のみ併記
      if (!periodLabel) return `${formatAmount(monthlyJPY)}/月（${formatAmount(s.amount, cur)}）`;
      return `${formatAmount(monthlyJPY)}/月（${formatAmount(s.amount, cur)}/${periodLabel}）`;
    };

    const GROUPS: { status: string; label: string }[] = [
      { status: 'active',        label: '継続中' },
      { status: 'reviewing',     label: '見直し中' },
      { status: 'cancel_planned', label: '解約手続き中' },
    ];

    const paying = subscriptions.filter((s) => !s.isArchived && s.status !== 'stopped');
    const totalMonthly = paying.reduce((sum, s) => {
      if (s.billingCycle === 'free') return sum;
      const monthly = toMonthlyAmount(s.amount, s.billingCycle);
      if (monthly === null) return sum;
      return sum + toJPY(monthly, s.currency ?? 'JPY', usdRate);
    }, 0);

    let text = `📋 サブスク一覧（${dateStr}）\n`;
    text += `─────────────────\n`;
    text += `月額合計 ${formatAmount(totalMonthly)} · ${paying.length}件\n`;

    for (const { status, label } of GROUPS) {
      const items = subscriptions.filter((s) => !s.isArchived && s.status === status);
      text += `\n■ ${label}\n`;
      if (items.length === 0) {
        text += ` （なし）\n`;
      } else {
        for (const s of items) {
          text += ` ・${s.serviceName} ${formatServiceAmount(s)}\n`;
        }
      }
    }
    text += `─────────────────`;
    return text;
  };

  const handleShare = () => {
    const paying = subscriptions.filter((s) => !s.isArchived && s.status !== 'stopped');
    if (paying.length === 0) {
      Alert.alert('共有', '共有できるサブスクがまだありません。');
      return;
    }
    setShareText(generateShareText());
  };

  // 課金中と見なすステータス（active / reviewing / cancel_planned）のサブスクかを判定
  const isPayingStatus = (s: Subscription) =>
    s.status === 'active' || s.status === 'reviewing' || s.status === 'cancel_planned';

  const hasNonMonthly = useMemo(
    () => subscriptions.some(
      (s) => isPayingStatus(s) && (s.billingCycle === 'yearly' || s.billingCycle === 'quarterly'),
    ),
    [subscriptions],
  );

  // 不定期課金は月額換算できないため集計対象外。その旨を SummaryBar で表示するためのフラグ。
  const hasIrregular = useMemo(
    () => subscriptions.some(
      (s) => isPayingStatus(s) && s.billingCycle === 'irregular',
    ),
    [subscriptions],
  );

  // バックアップが必要な状態かどうか（バナー非表示中でもバッジ表示に使う）
  const isExportNudgeNeeded = useMemo(() => {
    if (subscriptions.length === 0) return false;
    if (!lastExportedAt) return true;
    const diffDays = (Date.now() - new Date(lastExportedAt).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 30;
  }, [subscriptions.length, lastExportedAt]);

  // バナーを表示するか（×で閉じた期間中は非表示）
  const showExportNudge = useMemo(() => {
    if (!isExportNudgeNeeded) return false;
    if (!exportNudgeDismissedUntil) return true;
    return new Date() > new Date(exportNudgeDismissedUntil);
  }, [isExportNudgeNeeded, exportNudgeDismissedUntil]);

  // バナーを14日間非表示にする
  const dismissExportNudge = () => {
    const until = new Date();
    until.setDate(until.getDate() + 14);
    setExportNudgeDismissedUntil(until.toISOString());
  };

  // 90日以上バックアップ未実施の場合にアラートモーダルを表示（初回マウント時1回のみ）
  const backupAlertShownRef = useRef(false);
  useEffect(() => {
    if (backupAlertShownRef.current) return;
    if (subscriptions.length === 0) return;

    const daysSinceBackup = lastExportedAt
      ? (Date.now() - new Date(lastExportedAt).getTime()) / (1000 * 60 * 60 * 24)
      : Infinity;
    if (daysSinceBackup < 90) return;

    // 抑制期間中はスキップ
    if (backupModalDismissedUntil && new Date() < new Date(backupModalDismissedUntil)) return;

    backupAlertShownRef.current = true;
    Alert.alert(
      '⚠️ データのバックアップを',
      lastExportedAt
        ? `${Math.floor(daysSinceBackup)}日間バックアップされていません。\nブラウザのキャッシュ削除でデータが消える場合があります。設定画面からエクスポートしてください。`
        : 'まだバックアップが取られていません。\nブラウザのキャッシュ削除でデータが消える場合があります。設定画面からエクスポートしてください。',
      [
        {
          text: '今すぐエクスポート',
          onPress: () => router.push('/(main)/settings'),
        },
        {
          text: '3日後に通知',
          style: 'cancel',
          onPress: () => {
            const until = new Date();
            until.setDate(until.getDate() + 3);
            setBackupModalDismissedUntil(until.toISOString());
          },
        },
      ],
    );
  }, [subscriptions.length, lastExportedAt, backupModalDismissedUntil]);

  // フィルターチップの件数（アーカイブ除外済みの subscriptions を集計）
  const filterCounts = useMemo((): Record<FilterStatus, number> => ({
    all: subscriptions.length,
    active: subscriptions.filter((s) => s.status === 'active').length,
    reviewing: subscriptions.filter((s) => s.status === 'reviewing').length,
    cancel_planned: subscriptions.filter((s) => s.status === 'cancel_planned').length,
    stopped: subscriptions.filter((s) => s.status === 'stopped').length,
  }), [subscriptions]);

  // バナー優先度: 更新日超過 > 解約放置 > バックアップ促進（最大1本表示）
  const activeBanner = useMemo((): 'overdueRenewal' | 'staleCancel' | 'exportNudge' | null => {
    if (summary.overdueRenewalCount > 0) return 'overdueRenewal';
    if (summary.staleCancelCount > 0) return 'staleCancel';
    if (showExportNudge) return 'exportNudge';
    return null;
  }, [summary.overdueRenewalCount, summary.staleCancelCount, showExportNudge]);

  const displayedItems = useMemo((): ListItem[] => {
    let list = filterStatus === 'all'
      ? subscriptions
      : subscriptions.filter((s) => s.status === filterStatus);

    list = [...list].sort((a, b) => {
      if (sortKey === 'nextRenewalDate') {
        const da = a.nextRenewalDate ?? '9999-12-31';
        const db = b.nextRenewalDate ?? '9999-12-31';
        return da < db ? -1 : da > db ? 1 : 0;
      }
      if (sortKey === 'amount') {
        // 月額 JPY 換算で統一ソート（USD・年払い・3ヶ月払いも正しく比較）
        const ma = toJPY(toMonthlyAmount(a.amount, a.billingCycle) ?? 0, a.currency ?? 'JPY', usdRate);
        const mb = toJPY(toMonthlyAmount(b.amount, b.billingCycle) ?? 0, b.currency ?? 'JPY', usdRate);
        return mb - ma;
      }
      // createdAt: 新しい順
      return a.createdAt < b.createdAt ? 1 : -1;
    });

    // 「全て」フィルター: stopped を末尾にまとめてセクションヘッダーを挿入
    if (filterStatus === 'all') {
      const nonStopped = list.filter((s) => s.status !== 'stopped');
      const stopped = list.filter((s) => s.status === 'stopped');
      if (stopped.length > 0) {
        return [
          ...nonStopped,
          { type: 'stopped-section-header', count: stopped.length },
          ...stopped,
        ];
      }
      return nonStopped;
    }

    return list;
  }, [subscriptions, filterStatus, sortKey]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>サブスク整理</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleShare}
            activeOpacity={0.7}
            accessibilityLabel="共有"
          >
            <Ionicons name="share-social-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/(main)/settings')}
            activeOpacity={0.7}
            accessibilityLabel="設定"
          >
            <Ionicons name="settings-outline" size={20} color={COLORS.textSecondary} />
            {isExportNudgeNeeded && !showExportNudge && (
              <View style={styles.settingsBadge} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/(main)/archived')}
            activeOpacity={0.7}
            accessibilityLabel="非表示にした項目"
          >
            <Ionicons name="archive-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sortButton} onPress={cycleSortKey} activeOpacity={0.7}>
            <Ionicons name="swap-vertical-outline" size={15} color={COLORS.textSecondary} />
            <Text style={styles.sortLabel}>{SORT_LABELS[sortKey]}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SummaryBar
        summary={summary}
        hasNonMonthly={hasNonMonthly}
        hasIrregular={hasIrregular}
        onReviewingPress={() => setFilterStatus('reviewing')}
        onCancelPlannedPress={() => setFilterStatus('cancel_planned')}
        onRenewalAlertPress={() => { setFilterStatus('active'); setSortKey('nextRenewalDate'); }}
        onTrialAlertPress={() => setFilterStatus('active')}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBarScroll}
        contentContainerStyle={styles.filterBar}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filterStatus === f && styles.chipActive]}
            onPress={() => setFilterStatus(f)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, filterStatus === f && styles.chipTextActive]}>
              {FILTER_LABELS[f]}
            </Text>
            {filterCounts[f] > 0 && (
              <View style={[styles.chipBadge, filterStatus === f && styles.chipBadgeActive]}>
                <Text style={[styles.chipBadgeText, filterStatus === f && styles.chipBadgeTextActive]}>
                  {filterCounts[f]}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* フィルターチップ初回説明: アクションバナーがない場合のみ表示 */}
      {!filterTipDismissed && subscriptions.length > 0 && activeBanner === null && (
        <View style={styles.filterTip}>
          <View style={styles.filterTipBody}>
            <Ionicons name="information-circle-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.filterTipText}>
              <Text style={styles.filterTipBold}>見直す</Text>{'：要検討　'}
              <Text style={styles.filterTipBold}>解約する</Text>{'：手続き中　'}
              <Text style={styles.filterTipBold}>解約済み</Text>：完了
            </Text>
          </View>
          <TouchableOpacity onPress={() => setFilterTipDismissed(true)} hitSlop={8}>
            <Ionicons name="close" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      {/* アクションバナー（優先度: 更新日超過 > 解約放置 > バックアップ促進 — 最大1本） */}
      {activeBanner === 'overdueRenewal' && (
        <TouchableOpacity
          style={styles.renewalOverdueBanner}
          onPress={batchRolloverRenewalDates}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={15} color={COLORS.primary} />
          <Text style={styles.renewalOverdueBannerText}>
            {`更新日が過ぎています (${summary.overdueRenewalCount}件) — まとめて次回に繰り越す`}
          </Text>
        </TouchableOpacity>
      )}
      {activeBanner === 'staleCancel' && (
        <TouchableOpacity
          style={styles.staleBanner}
          onPress={() => setFilterStatus('cancel_planned')}
          activeOpacity={0.7}
        >
          <Ionicons name="time-outline" size={15} color={COLORS.warning.text} />
          <Text style={styles.staleBannerText}>
            {`解約手続き中が${STALE_CANCEL_DAYS}日以上経過 (${summary.staleCancelCount}件) — 確認する`}
          </Text>
          <Ionicons name="chevron-forward" size={13} color={COLORS.warning.text} />
        </TouchableOpacity>
      )}
      {activeBanner === 'exportNudge' && (
        <View style={styles.exportNudgeBanner}>
          <TouchableOpacity
            style={styles.exportNudgeBannerBody}
            onPress={() => router.push('/(main)/settings')}
            activeOpacity={0.7}
          >
            <Ionicons name="cloud-download-outline" size={15} color={COLORS.warning.text} />
            <Text style={styles.exportNudgeBannerText}>
              {lastExportedAt
                ? `${Math.floor((Date.now() - new Date(lastExportedAt).getTime()) / (1000 * 60 * 60 * 24))}日間バックアップしていません。エクスポートする →`
                : 'バックアップがまだです。エクスポートする →'}
            </Text>
            <Ionicons name="chevron-forward" size={13} color={COLORS.warning.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exportNudgeDismiss}
            onPress={dismissExportNudge}
            activeOpacity={0.7}
            accessibilityLabel="14日間非表示"
            hitSlop={8}
          >
            <Ionicons name="close" size={16} color={COLORS.warning.text} />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={displayedItems}
        keyExtractor={(item) => 'type' in item ? item.type : item.id}
        renderItem={({ item }) => {
          if ('type' in item) {
            return (
              <View style={styles.stoppedSectionHeader}>
                <Text style={styles.stoppedSectionHeaderText}>解約済み {item.count}件</Text>
              </View>
            );
          }
          return <SubscriptionListItem subscription={item} onPress={() => handleItemPress(item)} />;
        }}
        ListHeaderComponent={
          filterStatus === 'all' ? (
            <CategoryBreakdown subscriptions={subscriptions} />
          ) : null
        }
        ListEmptyComponent={
          filterStatus !== 'all'
            ? <FilteredEmptyState onClear={() => setFilterStatus('all')} />
            : <EmptyState />
        }
        contentContainerStyle={displayedItems.length === 0 ? styles.emptyContainer : styles.listContent}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/subscription/new')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* 共有パネル */}
      {shareText !== null && (
        <>
          <TouchableOpacity
            style={styles.shareOverlay}
            onPress={() => setShareText(null)}
            activeOpacity={1}
          />
          <View style={styles.sharePanel}>
            <View style={styles.sharePanelHeader}>
              <Text style={styles.sharePanelTitle}>サブスク状況を共有</Text>
              <TouchableOpacity onPress={() => setShareText(null)} hitSlop={8}>
                <Ionicons name="close" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.sharePanelPreview}>{shareText}</Text>
            <View style={styles.sharePanelButtons}>
              <TouchableOpacity
                style={styles.sharePanelBtn}
                onPress={() => {
                  try { navigator.clipboard.writeText(shareText); } catch { /* noop */ }
                  setShareText(null);
                }}
                activeOpacity={0.75}
              >
                <Ionicons name="copy-outline" size={17} color={COLORS.primary} />
                <Text style={styles.sharePanelBtnText}>コピー</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sharePanelBtn, styles.sharePanelBtnLine]}
                onPress={() => {
                  Linking.openURL(`https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`);
                  setShareText(null);
                }}
                activeOpacity={0.75}
              >
                <Ionicons name="chatbubble-outline" size={17} color="#06C755" />
                <Text style={[styles.sharePanelBtnText, styles.sharePanelBtnTextLine]}>LINEで送る</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterBarScroll: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  chipBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  chipBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    lineHeight: 14,
  },
  chipBadgeTextActive: {
    color: '#FFFFFF',
  },
  filterTip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 8,
  },
  filterTipBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  filterTipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
    flexWrap: 'wrap',
  },
  filterTipBold: {
    fontWeight: '600',
    color: COLORS.text,
  },
  exportNudgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
    backgroundColor: COLORS.warning.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.warning.border,
  },
  exportNudgeBannerBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  exportNudgeBannerText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.warning.text,
    fontWeight: '500',
  },
  exportNudgeDismiss: {
    padding: 6,
    opacity: 0.7,
  },
  shareOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 10,
  },
  sharePanel: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
    gap: 14,
    zIndex: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  sharePanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sharePanelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  sharePanelPreview: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 19,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sharePanelButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  sharePanelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  sharePanelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  sharePanelBtnLine: {
    backgroundColor: '#EDFBF3',
    borderColor: '#06C755',
  },
  sharePanelBtnTextLine: {
    color: '#06C755',
  },
  settingsBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.warning.text,
    borderWidth: 1,
    borderColor: COLORS.background,
  },
  staleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: COLORS.warning.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.warning.border,
  },
  staleBannerText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.warning.text,
    fontWeight: '500',
  },
  renewalOverdueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: COLORS.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  renewalOverdueBannerText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  emptyContainer: { flex: 1, paddingBottom: 120 },
  listContent: { paddingBottom: 120 },
  stoppedSectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  stoppedSectionHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.4,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignSelf: 'center',
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    flexShrink: 0,
  },
  emptyGmailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    alignSelf: 'center',
  },
  emptyGmailButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  clearButton: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 40,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
});
