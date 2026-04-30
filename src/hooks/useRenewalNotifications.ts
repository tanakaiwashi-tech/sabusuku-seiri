import { useEffect } from 'react';
import { useUiPrefsStore } from '@/src/stores/uiPrefsStore';
import { useSubscriptionStore } from '@/src/stores/subscriptionStore';
import { isWithinNextDays } from '@/src/utils/dateUtils';

const NOTIFY_DAYS_AHEAD = 7;

/**
 * 更新日が NOTIFY_DAYS_AHEAD 日以内の active なサブスクに対してブラウザ通知を送る。
 * 通知はアプリを開いた日に1回のみ送信（再訪問時はスキップ）。
 * Notification.permission === 'granted' の場合のみ動作する。
 */
export function useRenewalNotifications() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions ?? []);
  const renewalNotificationDate = useUiPrefsStore((s) => s.renewalNotificationDate);
  const setRenewalNotificationDate = useUiPrefsStore((s) => s.setRenewalNotificationDate);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    // 今日すでに通知済みならスキップ
    const today = new Date().toISOString().slice(0, 10);
    if (renewalNotificationDate === today) return;

    const upcoming = subscriptions.filter(
      (s) => !s.isArchived && s.status === 'active' && isWithinNextDays(s.nextRenewalDate, NOTIFY_DAYS_AHEAD),
    );

    if (upcoming.length === 0) return;

    for (const sub of upcoming) {
      try {
        new Notification('🔔 更新日が近づいています', {
          body: `${sub.serviceName} の更新日が${NOTIFY_DAYS_AHEAD}日以内です`,
          icon: '/favicon.ico',
          tag: `renewal-${sub.id}`,
        });
      } catch {
        // 通知作成エラーは無視
      }
    }

    setRenewalNotificationDate(today);
  // subscriptions.length を dep にすることでデータ変化時に再評価
  }, [subscriptions.length, renewalNotificationDate, setRenewalNotificationDate]);
}
