export const CATEGORY_OPTIONS = [
  '動画配信',
  '音楽',
  'ゲーム',
  'ニュース・雑誌',
  'クラウドストレージ',
  'ソフトウェア',
  'フィットネス',
  '学習',
  'ショッピング',
  '金融',
  'その他',
] as const;

export type CategoryOption = (typeof CATEGORY_OPTIONS)[number];

export type SubscriptionStatus = 'active' | 'reviewing' | 'cancel_planned' | 'stopped';
export type BillingCycle = 'monthly' | 'yearly' | 'quarterly' | 'irregular' | 'free';

export interface Subscription {
  id: string;
  serviceName: string;
  normalizedName: string;
  amount: number;
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
  totalMonthlyAmount: number;
  activeCount: number;
  reviewingCount: number;
  cancelPlannedCount: number;
  upcomingRenewalCount: number;
  /** アクティブで更新日が過去のもの（更新し忘れ候補） */
  overdueRenewalCount: number;
}

export interface ServiceDictionaryEntry {
  id: string;
  name: string;
  normalizedName: string;
  reading: string;
  category: CategoryOption;
  defaultBillingCycle: BillingCycle;
  defaultAmount: number | null;
  popularityRank: number;
  officialCancelUrl: string | null;
}

export interface SubscriptionFormData {
  serviceName: string;
  amount: number;
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
