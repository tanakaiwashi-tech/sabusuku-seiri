import { useEffect } from 'react';
import { useUiPrefsStore } from '@/src/stores/uiPrefsStore';
import { USD_TO_JPY_RATE } from '@/src/constants/app';

const RATE_TTL_HOURS = 24;

/**
 * USD→JPY レートをストアから返す。
 * キャッシュが古い（>24h）か未取得の場合は open.er-api.com から非同期で更新する。
 * ネットワークエラー時はフォールバック定数（150）を使用。
 */
export function useExchangeRate(): number {
  const usdToJpyRate = useUiPrefsStore((s) => s.usdToJpyRate);
  const usdRateFetchedAt = useUiPrefsStore((s) => s.usdRateFetchedAt);
  const setUsdRate = useUiPrefsStore((s) => s.setUsdRate);

  useEffect(() => {
    // キャッシュが有効ならスキップ
    if (usdToJpyRate !== null && usdRateFetchedAt) {
      const ageHours = (Date.now() - new Date(usdRateFetchedAt).getTime()) / 3_600_000;
      if (ageHours < RATE_TTL_HOURS) return;
    }

    fetch('https://open.er-api.com/v6/latest/USD')
      .then((r) => r.json())
      .then((data: { result: string; rates: Record<string, number> }) => {
        if (data.result === 'success' && typeof data.rates['JPY'] === 'number') {
          setUsdRate(Math.round(data.rates['JPY']), new Date().toISOString());
        }
      })
      .catch(() => {
        // ネットワークエラーは無視。フォールバック定数を継続使用。
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return usdToJpyRate ?? USD_TO_JPY_RATE;
}
