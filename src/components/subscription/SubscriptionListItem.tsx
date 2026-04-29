import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Subscription } from '@/src/types';
import { COLORS } from '@/src/constants/colors';
import { UPCOMING_RENEWAL_DAYS } from '@/src/constants/app';

import { formatAmount, toMonthlyAmount, toJPY } from '@/src/utils/amountUtils';
import { useUiPrefsStore } from '@/src/stores/uiPrefsStore';
import { USD_TO_JPY_RATE } from '@/src/constants/app';
import { formatShortDate, isWithinNextDays, isOverdueRenewal } from '@/src/utils/dateUtils';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { getServiceLogoUrl, getServiceLogoFallbackUrl } from '@/src/constants/serviceLogos';

/** リストアイテム用の短縮周期ラベル（金額列の省スペース化） */
const BILLING_CYCLE_SHORT: Record<string, string> = {
  monthly: '/月', yearly: '/年', quarterly: '/3ヶ月', irregular: '', free: '',
};

/** 頭文字アバター: 英字は大文字化、日本語・記号はそのまま1文字 */
function getAvatarChar(name: string): string {
  const char = name.charAt(0);
  return /[a-zA-Z]/.test(char) ? char.toUpperCase() : char;
}

interface SubscriptionListItemProps {
  subscription: Subscription;
  onPress: () => void;
}

export function SubscriptionListItem({ subscription, onPress }: SubscriptionListItemProps) {
  const isOverdue = subscription.status === 'active' && isOverdueRenewal(subscription.nextRenewalDate);
  const isUpcoming = !isOverdue && subscription.status === 'active' && isWithinNextDays(subscription.nextRenewalDate, UPCOMING_RENEWAL_DAYS);
  const isTrialEndingSoon = subscription.status === 'active' && isWithinNextDays(subscription.trialEndDate, UPCOMING_RENEWAL_DAYS);

  const [logoError, setLogoError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const usdRate = useUiPrefsStore((s) => s.usdToJpyRate ?? USD_TO_JPY_RATE);

  // ¥/月メイン表示ロジック
  const currency = subscription.currency ?? 'JPY';
  const { billingCycle, amount } = subscription;
  const amountDisplay = (() => {
    if (billingCycle === 'free') return { primary: '無料', secondary: null };
    if (amount === 0) return { primary: '未設定', secondary: null };
    // irregular: 換算不能のため元金額をそのまま表示
    if (billingCycle === 'irregular') {
      return { primary: formatAmount(amount, currency), secondary: null };
    }
    // monthly / yearly / quarterly: 月額 JPY 換算をメインに
    const monthlyRaw = toMonthlyAmount(amount, billingCycle) ?? amount;
    const monthlyJPY = toJPY(monthlyRaw, currency, usdRate);
    const primary = `${formatAmount(monthlyJPY, 'JPY')}/月`;
    // サブ行: 元の金額＋周期（月払い JPY は同値のため省略）
    const isMonthlyJPY = billingCycle === 'monthly' && currency === 'JPY';
    const secondary = isMonthlyJPY
      ? null
      : `${formatAmount(amount, currency)}${BILLING_CYCLE_SHORT[billingCycle] ?? ''}`;
    return { primary, secondary };
  })();
  // normalizedName が空（旧データ・インポート由来）の場合はサービス名から生成
  const normalizedForLogo =
    subscription.normalizedName ||
    subscription.serviceName.toLowerCase().replace(/\s+/g, '');
  const logoUrl = getServiceLogoUrl(normalizedForLogo);
  const logoFallbackUrl = getServiceLogoFallbackUrl(normalizedForLogo);
  const currentLogoUrl = useFallback ? logoFallbackUrl : logoUrl;
  const showLogo = !!currentLogoUrl && !logoError;

  const isStopped = subscription.status === 'stopped';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.container, isStopped && styles.containerStopped]}
    >
      <View style={[styles.avatar, isOverdue && styles.avatarOverdue, isUpcoming && styles.avatarUpcoming]}>
        {showLogo ? (
          <Image
            source={{ uri: currentLogoUrl! }}
            style={styles.logoImage}
            onLoad={(e) => {
              // プライマリ(Google S2)が 1×1 の空ピクセルを返した場合に DuckDuckGo へフォールバック。
              // source?.width は React Native Web では naturalWidth にマップされる。
              const source = e.nativeEvent.source;
              const width = source?.width;
              const height = source?.height;
              if (typeof width === 'number' && typeof height === 'number' && (width <= 2 || height <= 2)) {
                if (!useFallback && logoFallbackUrl) {
                  setUseFallback(true);
                } else {
                  setLogoError(true);
                }
              }
            }}
            onError={() => {
              if (!useFallback && logoFallbackUrl) {
                setUseFallback(true);
              } else {
                setLogoError(true);
              }
            }}
          />
        ) : (
          <Text style={[styles.avatarChar, isOverdue && styles.avatarCharAlert]}>
            {getAvatarChar(subscription.serviceName)}
          </Text>
        )}
      </View>
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>{subscription.serviceName}</Text>
          <View style={styles.amountCol}>
            <Text style={[
              styles.amount,
              amount === 0 && billingCycle !== 'free' && styles.amountUnset,
            ]}>
              {amountDisplay.primary}
            </Text>
            {amountDisplay.secondary && (
              <Text style={styles.monthlyHint}>{amountDisplay.secondary}</Text>
            )}
          </View>
        </View>
        {/* bottomRow: 表示するものがない場合はレンダリングしない（余白防止） */}
        {(subscription.status !== 'active' ||
          ((isOverdue || isUpcoming) && subscription.nextRenewalDate) ||
          (isTrialEndingSoon && subscription.trialEndDate)) && (
          <View style={styles.bottomRow}>
            {subscription.status !== 'active' && <StatusBadge status={subscription.status} />}
            {(isOverdue || isUpcoming) && subscription.nextRenewalDate && (
              <View style={styles.renewalRow}>
                {isOverdue && (
                  <Ionicons name="alert-circle" size={12} color={COLORS.destructive} />
                )}
                {isUpcoming && (
                  <Ionicons name="time-outline" size={12} color={COLORS.status.reviewing.text} />
                )}
                <Text
                  numberOfLines={1}
                  style={[
                    styles.renewal,
                    isOverdue && styles.renewalOverdue,
                    isUpcoming && styles.renewalUpcoming,
                  ]}
                >
                  {isOverdue ? '更新日超過 ' : '更新が近い '}
                  {formatShortDate(subscription.nextRenewalDate)}
                </Text>
              </View>
            )}
            {isTrialEndingSoon && subscription.trialEndDate && (
              <View style={styles.renewalRow}>
                <Ionicons name="hourglass-outline" size={12} color={COLORS.status.reviewing.text} />
                <Text numberOfLines={1} style={[styles.renewal, styles.renewalUpcoming]}>
                  {'試用終了 '}
                  {formatShortDate(subscription.trialEndDate)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={14} color={COLORS.borderLight} style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 12,
  },
  containerStopped: {
    opacity: 0.5,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarChar: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 7,
  },
  body: {
    flex: 1,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  amount: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '700',
  },
  amountUnset: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  amountCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  monthlyHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  avatarOverdue: {
    backgroundColor: COLORS.destructiveLight,
  },
  avatarUpcoming: {
    backgroundColor: COLORS.status.reviewing.bg,
  },
  avatarCharAlert: {
    color: COLORS.destructive,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  renewalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 1,
  },
  renewal: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  renewalOverdue: {
    color: COLORS.destructive,
    fontWeight: '600',
  },
  renewalUpcoming: {
    color: COLORS.status.reviewing.text,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 2,
    alignSelf: 'center',
  },
});
