export const CATEGORY_OPTIONS = [
  '動画配信',
  '音楽',
  '電子書籍',
  'ゲーム',
  'ニュース・雑誌',
  'クラウドストレージ',
  'ソフトウェア',
  'フィットネス',
  '学習',
  'ショッピング',
  'フード',
  '金融',
  'その他',
] as const;

export type CategoryOption = (typeof CATEGORY_OPTIONS)[number];

export type SubscriptionStatus = 'active' | 'reviewing' | 'cancel_planned' | 'stopped';
export type BillingCycle = 'monthly' | 'yearly' | 'quarterly' | 'irregular' | 'free';
export type Currency = 'JPY' | 'USD';

export interface Subscription {
  id: string;
  serviceName: string;
  normalizedName: string;
  amount: number;
  /** 金額の通貨。省略時は JPY として扱う */
  currency?: Currency;
  billingCycle: BillingCycle;
  category: CategoryOption | null;
  /** ビジネス状態。isArchived とは独立 */
  status: SubscriptionStatus;
  nextRenewalDate: string | null;
  trialEndDate: string | null;
  startDate: string | null;
  memo: string | null;
  cancelMemo: string | null;
  customCancelUrl: string | null;
  lastReviewedDate: string | null;
  /** stopped へ初回遷移した日時。再開しても消さない（履歴として保持） */
  cancelledAt: string | null;
  /** cancel_planned へ初回遷移した日時。updatedAt に依存しない放置チェック用 */
  cancelPlannedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  /** UI表示フラグ。status とは独立 */
  isArchived: boolean;
}

export interface AppSettings {
  id: number;
  onboardingCompleted: boolean;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface RemoteConfigMeta {
  id: number;
  version: string | null;
  fetchedAt: string | null;
  etag: string | null;
}

export interface SubscriptionSummary {
  /** active のみの月額合計（解約後の着地点）。USD は JPY 換算済み */
  totalMonthlyAmount: number;
  /**
   * reviewing + cancel_planned の月額合計（JPY 換算済み）。
   * これらはまだ実際に課金されているが、解約手続き中のサブスク。
   * currentMonthlyAmount = totalMonthlyAmount + pendingCancellationMonthlyAmount
   */
  pendingCancellationMonthlyAmount: number;
  /** ドル建てサブスクが1件以上あるか（SummaryBar の注記表示用） */
  hasUSD: boolean;
  activeCount: number;
  reviewingCount: number;
  cancelPlannedCount: number;
  upcomingRenewalCount: number;
  /** アクティブで更新日が過去のもの（更新し忘れ候補） */
  overdueRenewalCount: number;
  /** cancel_planned で STALE_CANCEL_DAYS 日以上放置されているサブスク数 */
  staleCancelCount: number;
  /** active で試用終了日が UPCOMING_RENEWAL_DAYS 日以内のサブスク数 */
  trialEndingSoonCount: number;
}

/** サービス辞書内で複数価格帯がある場合のプラン選択肢 */
export interface PricingPlan {
  label: string;
  amount: number;
  /** 省略時は entry の defaultBillingCycle を引き継ぐ */
  billingCycle?: BillingCycle;
  /** 省略時は entry の currency を引き継ぐ */
  currency?: Currency;
  /**
   * プラン選択時に登録するサービス名。
   * 省略時は親パターンの displayName を使用。
   * 例: Amazon のプランなら "Amazon Prime"、Apple Music なら "Apple Music"。
   */
  serviceName?: string;
}

export interface ServiceDictionaryEntry {
  id: string;
  name: string;
  normalizedName: string;
  reading: string;
  category: CategoryOption;
  defaultBillingCycle: BillingCycle;
  defaultAmount: number | null;
  /** サービスの請求通貨。省略時は JPY */
  currency?: Currency;
  popularityRank: number;
  officialCancelUrl: string | null;
  /** 複数の価格帯がある場合のプランリスト。省略時は単一価格 */
  plans?: PricingPlan[];
  /**
   * Google Favicon API 取得用のドメイン（例: "netflix.com"）。
   * 設定されている場合は serviceLogos.ts のハードコードより優先される。
   * ロゴ不要なサービスは省略。
   */
  domain?: string;
  /**
   * サービスが終了・廃止済みの場合 true。
   * オートコンプリートの候補から除外される。
   */
  defunct?: boolean;
}

export interface SubscriptionFormData {
  serviceName: string;
  amount: number;
  /** 金額の通貨。省略時は JPY */
  currency?: Currency;
  billingCycle: BillingCycle;
  category: CategoryOption | null;
  status: SubscriptionStatus;
  nextRenewalDate: string | null;
  trialEndDate: string | null;
  startDate: string | null;
  memo: string | null;
  cancelMemo: string | null;
  customCancelUrl: string | null;
  isArchived: boolean;
}
