/**
 * Gmailスキャンで差出人ドメインと照合するサービスパターン辞書。
 * senderDomain は From ヘッダーのドメイン部分との部分一致で使用する。
 */
import type { CategoryOption } from '../types';

export interface GmailSenderPattern {
  /** 差出人メールアドレスに含まれるドメイン文字列（部分一致） */
  senderDomain: string;
  /** サービス辞書の normalizedName（登録時のデフォルト名として使用） */
  normalizedName: string;
  /** 画面表示用サービス名 */
  displayName: string;
  /** 既知の月額/年額デフォルト金額。0 または未設定は「要入力」扱い */
  defaultAmount?: number;
  /** 既知の支払いサイクル */
  defaultBillingCycle?: 'monthly' | 'yearly';
  /** カテゴリ */
  defaultCategory?: CategoryOption;
  /** 請求通貨（省略時はJPY） */
  defaultCurrency?: 'JPY' | 'USD';
}

export const GMAIL_SENDER_PATTERNS: GmailSenderPattern[] = [
  // 動画配信
  { senderDomain: 'netflix.com',      normalizedName: 'netflix',          displayName: 'Netflix',              defaultAmount: 1490, defaultBillingCycle: 'monthly', defaultCategory: '動画配信' },
  { senderDomain: 'disneyplus.com',   normalizedName: 'disney+',          displayName: 'Disney+',              defaultAmount: 990,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信' },
  { senderDomain: 'hulu.com',         normalizedName: 'hulu',             displayName: 'Hulu',                 defaultAmount: 1026, defaultBillingCycle: 'monthly', defaultCategory: '動画配信' },
  { senderDomain: 'unext.jp',         normalizedName: 'u-next',           displayName: 'U-NEXT',               defaultAmount: 2189, defaultBillingCycle: 'monthly', defaultCategory: '動画配信' },
  { senderDomain: 'd-anime.ne.jp',    normalizedName: 'd anime',          displayName: 'dアニメストア',           defaultAmount: 550,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信' },
  { senderDomain: 'dmkt-sp.jp',       normalizedName: 'd anime',          displayName: 'dアニメストア',           defaultAmount: 550,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信' },
  { senderDomain: 'abema.io',         normalizedName: 'abema',            displayName: 'ABEMA',                defaultAmount: 960,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信' },
  { senderDomain: 'nicovideo.jp',     normalizedName: 'niconico',         displayName: 'ニコニコプレミアム',       defaultAmount: 550,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信' },
  { senderDomain: 'dazn.com',         normalizedName: 'dazn',             displayName: 'DAZN',                 defaultAmount: 4200, defaultBillingCycle: 'monthly', defaultCategory: '動画配信' },
  { senderDomain: 'wowow.co.jp',      normalizedName: 'wowow',            displayName: 'WOWOW',                defaultAmount: 2530, defaultBillingCycle: 'monthly', defaultCategory: '動画配信' },

  // 音楽
  { senderDomain: 'spotify.com',      normalizedName: 'spotify',          displayName: 'Spotify',              defaultAmount: 980,  defaultBillingCycle: 'monthly', defaultCategory: '音楽' },
  { senderDomain: 'line-music.jp',    normalizedName: 'line music',       displayName: 'LINE MUSIC',           defaultAmount: 980,  defaultBillingCycle: 'monthly', defaultCategory: '音楽' },
  { senderDomain: 'music.amazon.co.jp', normalizedName: 'amazon music',  displayName: 'Amazon Music',         defaultAmount: 980,  defaultBillingCycle: 'monthly', defaultCategory: '音楽' },

  // Apple / Google / Microsoft
  { senderDomain: 'apple.com',        normalizedName: 'apple music',      displayName: 'Apple（Music/TV+/iCloud）', defaultCategory: '音楽' },
  { senderDomain: 'google.com',       normalizedName: 'google one',       displayName: 'Google（One/YouTube）',    defaultCategory: 'クラウドストレージ' },
  { senderDomain: 'youtube.com',      normalizedName: 'youtube premium',  displayName: 'YouTube Premium',      defaultAmount: 1280, defaultBillingCycle: 'monthly', defaultCategory: '動画配信' },
  { senderDomain: 'microsoft.com',    normalizedName: 'microsoft 365',    displayName: 'Microsoft 365',        defaultAmount: 1284, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア' },

  // Amazon
  { senderDomain: 'amazon.co.jp',     normalizedName: 'amazon prime',     displayName: 'Amazon',               defaultAmount: 600,  defaultBillingCycle: 'monthly', defaultCategory: 'ショッピング' },
  { senderDomain: 'amazon.com',       normalizedName: 'amazon prime',     displayName: 'Amazon',               defaultAmount: 600,  defaultBillingCycle: 'monthly', defaultCategory: 'ショッピング' },

  // クラウド / ストレージ
  { senderDomain: 'dropbox.com',      normalizedName: 'dropbox',          displayName: 'Dropbox',              defaultCategory: 'クラウドストレージ', defaultCurrency: 'USD' },

  // 仕事 / 生産性
  { senderDomain: 'notion.so',        normalizedName: 'notion',           displayName: 'Notion',               defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },
  { senderDomain: 'slack.com',        normalizedName: 'slack',            displayName: 'Slack',                defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },
  { senderDomain: 'figma.com',        normalizedName: 'figma',            displayName: 'Figma',                defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },
  { senderDomain: 'zoom.us',          normalizedName: 'zoom',             displayName: 'Zoom',                 defaultCategory: 'ソフトウェア' },
  { senderDomain: 'canva.com',        normalizedName: 'canva',            displayName: 'Canva',                defaultCategory: 'ソフトウェア' },
  { senderDomain: 'evernote.com',     normalizedName: 'evernote',         displayName: 'Evernote',             defaultAmount: 600,  defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア' },

  // ソフトウェア / 開発
  { senderDomain: 'adobe.com',        normalizedName: 'adobe cc',         displayName: 'Adobe',                defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },
  { senderDomain: 'github.com',       normalizedName: 'github',           displayName: 'GitHub',               defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },

  // AI
  { senderDomain: 'openai.com',       normalizedName: 'chatgpt plus',     displayName: 'ChatGPT Plus',         defaultAmount: 20,   defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },
  { senderDomain: 'anthropic.com',    normalizedName: 'claude pro',       displayName: 'Claude Pro',           defaultAmount: 20,   defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },

  // セキュリティ
  { senderDomain: '1password.com',    normalizedName: '1password',        displayName: '1Password',            defaultAmount: 3,    defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },
  { senderDomain: 'lastpass.com',     normalizedName: 'lastpass',         displayName: 'LastPass',             defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },

  // 電子書籍 / オーディオ
  { senderDomain: 'audible.co.jp',    normalizedName: 'audible',          displayName: 'Audible',              defaultAmount: 1500, defaultBillingCycle: 'monthly', defaultCategory: '電子書籍' },
  { senderDomain: 'audiobook.jp',     normalizedName: 'audiobook',        displayName: 'audiobook.jp',         defaultAmount: 550,  defaultBillingCycle: 'monthly', defaultCategory: '電子書籍' },
  { senderDomain: 'bookwalker.jp',    normalizedName: 'book walker',      displayName: 'BOOK☆WALKER',          defaultCategory: '電子書籍' },

  // 学習
  { senderDomain: 'duolingo.com',     normalizedName: 'duolingo',         displayName: 'Duolingo',             defaultCategory: '学習', defaultCurrency: 'USD' },

  // ニュース
  { senderDomain: 'nikkei.com',       normalizedName: '日経電子版',         displayName: '日本経済新聞',           defaultAmount: 4277, defaultBillingCycle: 'monthly', defaultCategory: 'ニュース・雑誌' },
  { senderDomain: 'asahi.com',        normalizedName: '朝日新聞',           displayName: '朝日新聞デジタル',        defaultAmount: 980,  defaultBillingCycle: 'monthly', defaultCategory: 'ニュース・雑誌' },

  // クリエイター
  { senderDomain: 'pixiv.net',        normalizedName: 'pixiv premium',    displayName: 'pixiv',                defaultCategory: 'その他' },
  { senderDomain: 'fanbox.cc',        normalizedName: 'fanbox',           displayName: 'pixivFANBOX',          defaultCategory: 'その他' },
];
