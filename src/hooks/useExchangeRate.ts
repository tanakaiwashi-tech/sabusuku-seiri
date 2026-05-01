import { useEffect } from 'react';
import { useUiPrefsStore } from '@/src/stores/uiPrefsStore';
import { USD_TO_JPY_RATE } from '@/src/constants/app';

const RATE_TTL_HOURS = 24;

/**
 * USD→JPY レートを外部APIから取得する。
 * open.er-api.com を優先し、失敗時は api.frankfurter.app（ECB提供）にフォールバックする。
 * 両方失敗した場合は null を返す。
 */
export async function fetchUsdJpyRate(): Promise<number | null> {
  // Primary: open.er-api.com（無料・認証不要）
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD');
    if (r.ok) {
      const data = await r.json() as { result?: string; rates?: Record<string, number> };
      if (data.result === 'success' && typeof data.rates?.['JPY'] === 'number') {
        return Math.round(data.rates['JPY']);
      }
    }
  } catch {
    // Primary 失敗 → Fallback へ
  }

  // Fallback: api.frankfurter.app（ECBデータ、無料・認証不要）
  try {
    const r = await fetch('https://api.frankfurter.app/latest?from=USD&to=JPY');
    if (r.ok) {
      const data = await r.json() as { rates?: Record<string, number> };
      if (typeof data.rates?.['JPY'] === 'number') {
        return Math.round(data.rates['JPY']);
      }
    }
  } catch {
    // Fallback も失敗
  }

  return null;
}

/**
 * USD→JPY レートをストアから返す。
 * キャッシュが古い（>24h）か未取得の場合は fetchUsdJpyRate() で自動更新する。
 * ネットワークエラー時はフォールバック定数（USD_TO_JPY_RATE）を使用。
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

    fetchUsdJpyRate().then((rate) => {
      if (rate !== null) {
        setUsdRate(rate, new Date().toISOString());
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return usdToJpyRate ?? USD_TO_JPY_RATE;
}
