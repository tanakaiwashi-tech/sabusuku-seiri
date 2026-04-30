/**
 * Gmailスキャンで差出人ドメインと照合するサービスパターン辞書。
 * senderDomain は From ヘッダーのドメイン部分との部分一致で使用する。
 */
import type { CategoryOption, PricingPlan } from '../types';

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
  /** 複数の価格帯がある場合のプランリスト */
  plans?: PricingPlan[];
  /** 参考URL（マイページ・アカウント管理ページなど）。リンク切れの可能性があるため参考扱い */
  referenceUrl?: string;
}

export const GMAIL_SENDER_PATTERNS: GmailSenderPattern[] = [
  // 動画配信
  {
    senderDomain: 'netflix.com',
    normalizedName: 'netflix',
    displayName: 'Netflix',
    defaultAmount: 1490,
    defaultBillingCycle: 'monthly',
    defaultCategory: '動画配信',
    referenceUrl: 'https://www.netflix.com/account',
    plans: [
      { label: '広告付きスタンダード', amount: 790,  billingCycle: 'monthly' },
      { label: 'スタンダード',         amount: 1490, billingCycle: 'monthly' },
      { label: 'プレミアム',           amount: 1980, billingCycle: 'monthly' },
    ],
  },
  {
    senderDomain: 'disneyplus.com',
    normalizedName: 'disney+',
    displayName: 'Disney+',
    defaultAmount: 990,
    defaultBillingCycle: 'monthly',
    defaultCategory: '動画配信',
    referenceUrl: 'https://www.disneyplus.com/account',
    plans: [
      { label: 'スタンダード(月)', amount: 990,   billingCycle: 'monthly' },
      { label: 'プレミアム(月)',   amount: 1320,  billingCycle: 'monthly' },
      { label: 'スタンダード(年)', amount: 9900,  billingCycle: 'yearly'  },
      { label: 'プレミアム(年)',   amount: 13200, billingCycle: 'yearly'  },
    ],
  },
  { senderDomain: 'hulu.com',         normalizedName: 'hulu',             displayName: 'Hulu',                 defaultAmount: 1026, defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://www.hulu.jp/account' },
  { senderDomain: 'unext.jp',         normalizedName: 'u-next',           displayName: 'U-NEXT',               defaultAmount: 2189, defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://video.unext.jp/my/settings' },
  { senderDomain: 'd-anime.ne.jp',    normalizedName: 'dあにめすとあ',    displayName: 'dアニメストア',           defaultAmount: 550,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://anime.dmkt-sp.jp/animestore/my/top' },
  { senderDomain: 'magazine.dmkt-sp.jp', normalizedName: 'dまがじん',    displayName: 'dマガジン',              defaultAmount: 580,  defaultBillingCycle: 'monthly', defaultCategory: 'ニュース・雑誌', referenceUrl: 'https://magazine.dmkt-sp.jp/help/exit/' },
  { senderDomain: 'dmkt-sp.jp',       normalizedName: 'dあにめすとあ',    displayName: 'dアニメストア',           defaultAmount: 550,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://anime.dmkt-sp.jp/animestore/my/top' },
  { senderDomain: 'abema.io',         normalizedName: 'abemaぷれみあむ',  displayName: 'ABEMAプレミアム',         defaultAmount: 960,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://abema.tv/settings/account' },
  { senderDomain: 'nicovideo.jp',     normalizedName: 'にこにこぷれみあむ', displayName: 'ニコニコプレミアム',      defaultAmount: 550,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://account.nicovideo.jp/my/account' },
  {
    senderDomain: 'dazn.com',
    normalizedName: 'dazn',
    displayName: 'DAZN',
    defaultAmount: 4200,
    defaultBillingCycle: 'monthly',
    defaultCategory: '動画配信',
    referenceUrl: 'https://www.dazn.com/ja-JP/account',
    plans: [
      { label: 'DAZN 個人 (月)',          amount: 4200, billingCycle: 'monthly',  serviceName: 'DAZN' },
      { label: 'DAZN for docomo (月)',    amount: 3700, billingCycle: 'monthly',  serviceName: 'DAZN for docomo' },
      { label: 'DAZN 個人 (年)',          amount: 27000, billingCycle: 'yearly',  serviceName: 'DAZN' },
    ],
  },
  { senderDomain: 'wowow.co.jp',      normalizedName: 'wowowおんでまんど', displayName: 'WOWOWオンデマンド',      defaultAmount: 2530, defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://www.wowow.co.jp/mypage/' },

  // 音楽
  {
    senderDomain: 'spotify.com',
    normalizedName: 'spotify',
    displayName: 'Spotify',
    defaultAmount: 980,
    defaultBillingCycle: 'monthly',
    defaultCategory: '音楽',
    referenceUrl: 'https://www.spotify.com/jp/account/overview/',
    plans: [
      { label: '個人',       amount: 980,  billingCycle: 'monthly' },
      { label: 'Duo',        amount: 1280, billingCycle: 'monthly' },
      { label: 'ファミリー', amount: 1580, billingCycle: 'monthly' },
      { label: '学生',       amount: 480,  billingCycle: 'monthly' },
    ],
  },
  { senderDomain: 'line-music.jp',    normalizedName: 'linemusic',       displayName: 'LINE MUSIC',           defaultAmount: 980,  defaultBillingCycle: 'monthly', defaultCategory: '音楽', referenceUrl: 'https://music.line.me/settings' },
  { senderDomain: 'music.amazon.co.jp', normalizedName: 'amazonmusicunlimited', displayName: 'Amazon Music Unlimited', defaultAmount: 980, defaultBillingCycle: 'monthly', defaultCategory: '音楽', referenceUrl: 'https://music.amazon.co.jp/settings' },

  // Apple / Google / Microsoft
  {
    senderDomain: 'apple.com',
    normalizedName: 'applemusic',
    displayName: 'Apple',
    defaultCategory: '音楽',
    referenceUrl: 'https://appleid.apple.com/account/manage',
    plans: [
      { label: 'Music 個人',       amount: 1080, billingCycle: 'monthly', serviceName: 'Apple Music' },
      { label: 'Music ファミリー', amount: 1680, billingCycle: 'monthly', serviceName: 'Apple Music' },
      { label: 'Music 学割',       amount: 580,  billingCycle: 'monthly', serviceName: 'Apple Music' },
      { label: 'iCloud+ 50GB',     amount: 130,  billingCycle: 'monthly', currency: 'JPY', serviceName: 'iCloud+' },
      { label: 'iCloud+ 200GB',    amount: 400,  billingCycle: 'monthly', currency: 'JPY', serviceName: 'iCloud+' },
      { label: 'iCloud+ 2TB',      amount: 1300, billingCycle: 'monthly', currency: 'JPY', serviceName: 'iCloud+' },
      { label: 'Apple TV+',              amount: 900,   billingCycle: 'monthly', serviceName: 'Apple TV+' },
      { label: 'Apple Arcade',           amount: 600,   billingCycle: 'monthly', serviceName: 'Apple Arcade' },
      { label: 'Apple Fitness+',         amount: 1100,  billingCycle: 'monthly', serviceName: 'Apple Fitness+' },
      { label: 'Apple One 個人',         amount: 1200,  billingCycle: 'monthly', serviceName: 'Apple One' },
      { label: 'Apple One ファミリー',   amount: 1980,  billingCycle: 'monthly', serviceName: 'Apple One ファミリー' },
      { label: 'Developer Program (年)', amount: 12800, billingCycle: 'yearly',  serviceName: 'Apple Developer Program' },
    ],
  },
  {
    senderDomain: 'google.com',
    normalizedName: 'googleone',
    displayName: 'Google',
    defaultCategory: 'クラウドストレージ',
    referenceUrl: 'https://myaccount.google.com/subscriptions',
    plans: [
      { label: 'One 100GB',                   amount: 250,  billingCycle: 'monthly', serviceName: 'Google One' },
      { label: 'One 200GB',                   amount: 380,  billingCycle: 'monthly', serviceName: 'Google One' },
      { label: 'One 2TB',                     amount: 1300, billingCycle: 'monthly', serviceName: 'Google One' },
      { label: 'One 5TB',                     amount: 2500, billingCycle: 'monthly', serviceName: 'Google One' },
      { label: 'YouTube Premium 個人',         amount: 1280, billingCycle: 'monthly', serviceName: 'YouTube Premium' },
      { label: 'YouTube Premium ファミリー',   amount: 2280, billingCycle: 'monthly', serviceName: 'YouTube Premium' },
      { label: 'YouTube Music Premium',         amount: 1080, billingCycle: 'monthly', serviceName: 'YouTube Music Premium' },
      { label: 'Gemini Advanced',               amount: 2900, billingCycle: 'monthly', serviceName: 'Gemini Advanced' },
    ],
  },
  {
    senderDomain: 'youtube.com',
    normalizedName: 'youtubepremium',
    displayName: 'YouTube Premium',
    defaultAmount: 1280,
    defaultBillingCycle: 'monthly',
    defaultCategory: '動画配信',
    referenceUrl: 'https://www.youtube.com/paid_memberships',
    plans: [
      { label: '個人',                  amount: 1280, billingCycle: 'monthly', serviceName: 'YouTube Premium' },
      { label: 'ファミリー',            amount: 2280, billingCycle: 'monthly', serviceName: 'YouTube Premium' },
      { label: 'Music Premium',         amount: 1080, billingCycle: 'monthly', serviceName: 'YouTube Music Premium' },
    ],
  },
  {
    senderDomain: 'microsoft.com',
    normalizedName: 'microsoft365',
    displayName: 'Microsoft 365',
    defaultAmount: 1490,
    defaultBillingCycle: 'monthly',
    defaultCategory: 'ソフトウェア',
    referenceUrl: 'https://account.microsoft.com/services',
    plans: [
      { label: '365 Personal (月払い)',         amount: 1490,  billingCycle: 'monthly', serviceName: 'Microsoft 365' },
      { label: '365 Family (月払い)',           amount: 2100,  billingCycle: 'monthly', serviceName: 'Microsoft 365' },
      { label: '365 Personal (年払い)',         amount: 14900, billingCycle: 'yearly',  serviceName: 'Microsoft 365' },
      { label: '365 Family (年払い)',           amount: 21000, billingCycle: 'yearly',  serviceName: 'Microsoft 365' },
      { label: '365 Basic (年払い)',            amount: 2000,  billingCycle: 'yearly',  serviceName: 'Microsoft 365 Basic' },
      { label: 'OneDrive 100GB (月払い)',       amount: 230,   billingCycle: 'monthly', serviceName: 'Microsoft OneDrive' },
      { label: 'Copilot Pro (月払い)',          amount: 3200,  billingCycle: 'monthly', serviceName: 'Microsoft Copilot Pro' },
    ],
  },

  // Amazon
  {
    senderDomain: 'amazon.co.jp',
    normalizedName: 'amazonprime',
    displayName: 'Amazon Prime',
    defaultAmount: 600,
    defaultBillingCycle: 'monthly',
    defaultCategory: 'ショッピング',
    referenceUrl: 'https://www.amazon.co.jp/gp/subs/primeclub/account/homepage.html',
    plans: [
      { label: 'Prime 月払い',                amount: 600,  billingCycle: 'monthly', serviceName: 'Amazon Prime' },
      { label: 'Prime 年払い',                amount: 5900, billingCycle: 'yearly',  serviceName: 'Amazon Prime' },
      { label: 'Kindle Unlimited',            amount: 980,  billingCycle: 'monthly', serviceName: 'Kindle Unlimited' },
      { label: 'Music Unlimited (月払い)',    amount: 980,  billingCycle: 'monthly', serviceName: 'Amazon Music Unlimited' },
      { label: 'Kids+ (月払い)',              amount: 600,  billingCycle: 'monthly', serviceName: 'Amazon Kids+' },
    ],
  },
  {
    senderDomain: 'amazon.com',
    normalizedName: 'amazonprime',
    displayName: 'Amazon Prime',
    defaultAmount: 600,
    defaultBillingCycle: 'monthly',
    defaultCategory: 'ショッピング',
    referenceUrl: 'https://www.amazon.com/gp/subs/primeclub/account/homepage.html',
    plans: [
      { label: 'Prime 月払い',                amount: 600,  billingCycle: 'monthly', serviceName: 'Amazon Prime' },
      { label: 'Prime 年払い', amount: 5900, billingCycle: 'yearly',  serviceName: 'Amazon Prime' },
    ],
  },

  // クラウド / ストレージ
  {
    senderDomain: 'dropbox.com',
    normalizedName: 'dropbox',
    displayName: 'Dropbox',
    defaultCategory: 'クラウドストレージ',
    defaultCurrency: 'USD',
    referenceUrl: 'https://www.dropbox.com/account/plan',
    plans: [
      { label: 'Plus (月払い)',          amount: 11.99, billingCycle: 'monthly', currency: 'USD', serviceName: 'Dropbox Plus'         },
      { label: 'Essentials (月払い)',    amount: 19.99, billingCycle: 'monthly', currency: 'USD', serviceName: 'Dropbox Essentials'   },
      { label: 'Business (月払い)',      amount: 15,    billingCycle: 'monthly', currency: 'USD', serviceName: 'Dropbox Business'     },
      { label: 'Business Plus (月払い)', amount: 24,   billingCycle: 'monthly', currency: 'USD', serviceName: 'Dropbox Business Plus' },
    ],
  },

  // 仕事 / 生産性
  {
    senderDomain: 'notion.so',
    normalizedName: 'notion',
    displayName: 'Notion',
    defaultCategory: 'ソフトウェア',
    defaultCurrency: 'USD',
    referenceUrl: 'https://www.notion.com/profile/plans',
    plans: [
      { label: 'Plus (月払い)',     amount: 12, billingCycle: 'monthly', currency: 'USD', serviceName: 'Notion Plus'     },
      { label: 'Business (月払い)', amount: 18, billingCycle: 'monthly', currency: 'USD', serviceName: 'Notion Business' },
      { label: 'Plus (年払い)',     amount: 96, billingCycle: 'yearly',  currency: 'USD', serviceName: 'Notion Plus'     },
      { label: 'Business (年払い)', amount: 144, billingCycle: 'yearly', currency: 'USD', serviceName: 'Notion Business' },
    ],
  },
  { senderDomain: 'slack.com',        normalizedName: 'slackpro',         displayName: 'Slack Pro',            defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://slack.com/intl/ja-jp/help/articles/218915077' },
  { senderDomain: 'figma.com',        normalizedName: 'figmaprofessional', displayName: 'Figma Professional',  defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://www.figma.com/billing' },
  { senderDomain: 'zoom.us',          normalizedName: 'zoompro',          displayName: 'Zoom Pro',             defaultCategory: 'ソフトウェア', referenceUrl: 'https://zoom.us/account/billing' },
  { senderDomain: 'canva.com',        normalizedName: 'canvapro',         displayName: 'Canva Pro',            defaultCategory: 'ソフトウェア', referenceUrl: 'https://www.canva.com/settings/purchase-history' },
  { senderDomain: 'evernote.com',     normalizedName: 'evernote',         displayName: 'Evernote',             defaultAmount: 600,  defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', referenceUrl: 'https://www.evernote.com/client/account' },

  // ソフトウェア / 開発
  { senderDomain: 'adobe.com',        normalizedName: 'adobecreativecloud', displayName: 'Adobe Creative Cloud', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://account.adobe.com/plans' },
  {
    senderDomain: 'github.com',
    normalizedName: 'githubpro',
    displayName: 'GitHub Pro',
    defaultCategory: 'ソフトウェア',
    defaultCurrency: 'USD',
    referenceUrl: 'https://github.com/settings/billing',
    plans: [
      { label: 'GitHub Pro',    amount: 4,   billingCycle: 'monthly', currency: 'USD', serviceName: 'GitHub Pro'    },
      { label: 'GitHub Copilot (月)', amount: 10, billingCycle: 'monthly', currency: 'USD', serviceName: 'GitHub Copilot' },
      { label: 'GitHub Copilot (年)', amount: 100, billingCycle: 'yearly',  currency: 'USD', serviceName: 'GitHub Copilot' },
    ],
  },

  // AI
  {
    senderDomain: 'openai.com',
    normalizedName: 'chatgptplus',
    displayName: 'ChatGPT',
    defaultAmount: 20,
    defaultBillingCycle: 'monthly',
    defaultCategory: 'ソフトウェア',
    defaultCurrency: 'USD',
    referenceUrl: 'https://chat.openai.com/my-account/billing',
    plans: [
      { label: 'Plus', amount: 20,  billingCycle: 'monthly', currency: 'USD', serviceName: 'ChatGPT Plus' },
      { label: 'Pro',  amount: 200, billingCycle: 'monthly', currency: 'USD', serviceName: 'ChatGPT Pro'  },
    ],
  },
  { senderDomain: 'anthropic.com',    normalizedName: 'claudepro',       displayName: 'Claude Pro',           defaultAmount: 20,   defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://claude.ai/settings' },

  // セキュリティ
  { senderDomain: '1password.com',    normalizedName: '1password',        displayName: '1Password',            defaultAmount: 3,    defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://my.1password.com/profile' },
  { senderDomain: 'lastpass.com',     normalizedName: 'lastpass',         displayName: 'LastPass',             defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },

  // 電子書籍 / オーディオ
  { senderDomain: 'audible.co.jp',    normalizedName: 'audible',          displayName: 'Audible',              defaultAmount: 1500, defaultBillingCycle: 'monthly', defaultCategory: '電子書籍', referenceUrl: 'https://www.audible.co.jp/account-details' },
  { senderDomain: 'audiobook.jp',     normalizedName: 'audiobook.jp',     displayName: 'audiobook.jp',         defaultAmount: 550,  defaultBillingCycle: 'monthly', defaultCategory: '電子書籍', referenceUrl: 'https://audiobook.jp/mypage/top' },
  { senderDomain: 'bookwalker.jp',    normalizedName: 'book☆walkerぷれみあむ', displayName: 'BOOK☆WALKERプレミアム', defaultAmount: 836, defaultBillingCycle: 'monthly', defaultCategory: '電子書籍', referenceUrl: 'https://bookwalker.jp/member/subscription/' },

  // 学習
  {
    senderDomain: 'duolingo.com',
    normalizedName: 'duolingosuper',
    displayName: 'Duolingo Super',
    defaultAmount: 9600,
    defaultBillingCycle: 'yearly',
    defaultCategory: '学習',
    referenceUrl: 'https://www.duolingo.com/settings/super',
    plans: [
      { label: 'Super (月払い)', amount: 1067, billingCycle: 'monthly', serviceName: 'Duolingo Super' },
      { label: 'Super (年払い)', amount: 9600, billingCycle: 'yearly',  serviceName: 'Duolingo Super' },
      { label: 'Max (月払い)',   amount: 1687, billingCycle: 'monthly', serviceName: 'Duolingo Max'   },
      { label: 'Max (年払い)',   amount: 16800, billingCycle: 'yearly', serviceName: 'Duolingo Max'   },
    ],
  },

  // ニュース
  { senderDomain: 'nikkei.com',       normalizedName: 'にほんけいざいしんぶんでんしばん', displayName: '日本経済新聞（電子版）', defaultAmount: 4277, defaultBillingCycle: 'monthly', defaultCategory: 'ニュース・雑誌', referenceUrl: 'https://www.nikkei.com/landing/subscription/', plans: [{ label: 'デジタル', amount: 4277, billingCycle: 'monthly' }, { label: 'セット版', amount: 6720, billingCycle: 'monthly' }] },
  { senderDomain: 'asahi.com',        normalizedName: 'あさひしんぶんでじたる', displayName: '朝日新聞デジタル',       defaultAmount: 980,  defaultBillingCycle: 'monthly', defaultCategory: 'ニュース・雑誌', referenceUrl: 'https://digital.asahi.com/info/account/' },

  // クリエイター
  { senderDomain: 'pixiv.net',        normalizedName: 'ぴくしぶぷれみあむ', displayName: 'pixivプレミアム',        defaultAmount: 880,  defaultBillingCycle: 'monthly', defaultCategory: 'その他', referenceUrl: 'https://www.pixiv.net/premium' },
  { senderDomain: 'fanbox.cc',        normalizedName: 'pixivfanbox',      displayName: 'pixivFANBOX',          defaultCategory: 'その他' },

  // SNS / コミュニティ
  { senderDomain: 'x.com',            normalizedName: 'xpremium',        displayName: 'X Premium',            defaultAmount: 980,  defaultBillingCycle: 'monthly', defaultCategory: 'その他', referenceUrl: 'https://twitter.com/i/payments/subscriptions' },
  { senderDomain: 'twitter.com',      normalizedName: 'xpremium',        displayName: 'X Premium',            defaultAmount: 980,  defaultBillingCycle: 'monthly', defaultCategory: 'その他', referenceUrl: 'https://twitter.com/i/payments/subscriptions' },
  {
    senderDomain: 'discord.com',
    normalizedName: 'discordnitro',
    displayName: 'Discord Nitro',
    defaultAmount: 10,
    defaultBillingCycle: 'monthly',
    defaultCategory: 'その他',
    defaultCurrency: 'USD',
    referenceUrl: 'https://discord.com/settings/subscriptions',
    plans: [
      { label: 'Nitro Basic (月)',  amount: 3.99,  billingCycle: 'monthly', currency: 'USD' },
      { label: 'Nitro (月)',        amount: 9.99,  billingCycle: 'monthly', currency: 'USD' },
      { label: 'Nitro Basic (年)',  amount: 39.99, billingCycle: 'yearly',  currency: 'USD' },
      { label: 'Nitro (年)',        amount: 99.99, billingCycle: 'yearly',  currency: 'USD' },
    ],
  },
  { senderDomain: 'patreon.com',      normalizedName: 'patreon',          displayName: 'Patreon',              defaultCategory: 'その他', defaultCurrency: 'USD' },
  { senderDomain: 'note.com',         normalizedName: 'note',             displayName: 'note',                 defaultAmount: 500,  defaultBillingCycle: 'monthly', defaultCategory: 'その他', referenceUrl: 'https://note.com/settings/plan' },
  { senderDomain: 'substack.com',     normalizedName: 'substack',         displayName: 'Substack',             defaultCategory: 'その他', defaultCurrency: 'USD' },

  // 動画配信（追加）
  {
    senderDomain: 'crunchyroll.com',
    normalizedName: 'crunchyroll',
    displayName: 'Crunchyroll',
    defaultAmount: 7.99,
    defaultBillingCycle: 'monthly',
    defaultCategory: '動画配信',
    defaultCurrency: 'USD',
    plans: [
      { label: 'Fan (月)',      amount: 7.99,  billingCycle: 'monthly', currency: 'USD' },
      { label: 'Mega Fan (月)', amount: 9.99,  billingCycle: 'monthly', currency: 'USD' },
      { label: 'Ultimate (月)', amount: 14.99, billingCycle: 'monthly', currency: 'USD' },
    ],
  },
  { senderDomain: 'rakuten-tv.com',   normalizedName: 'らくてんてぃびー',  displayName: '楽天TV',               defaultCategory: '動画配信', referenceUrl: 'https://tv.rakuten.co.jp/my/' },
  { senderDomain: 'jsports.co.jp',    normalizedName: 'じぇいすぽーつおんでまんど', displayName: 'Jスポーツオンデマンド', defaultAmount: 2178, defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://www.jsports.co.jp/streaming/account/' },

  // 音楽（追加）
  { senderDomain: 'kkbox.com',        normalizedName: 'kkbox',            displayName: 'KKBOX',                defaultAmount: 980,  defaultBillingCycle: 'monthly', defaultCategory: '音楽', referenceUrl: 'https://www.kkbox.com/jp/ja/account/' },
  { senderDomain: 'deezer.com',       normalizedName: 'deezer',           displayName: 'Deezer',               defaultAmount: 10.99, defaultBillingCycle: 'monthly', defaultCategory: '音楽', defaultCurrency: 'USD', referenceUrl: 'https://www.deezer.com/account/' },
  { senderDomain: 'tidal.com',        normalizedName: 'tidal',            displayName: 'TIDAL',                defaultAmount: 10.99, defaultBillingCycle: 'monthly', defaultCategory: '音楽', defaultCurrency: 'USD', referenceUrl: 'https://account.tidal.com/settings/subscription' },

  // 電子書籍 / マンガ（追加）
  { senderDomain: 'ebookjapan.yahoo.co.jp', normalizedName: 'ebookjapan', displayName: 'ebookjapan',           defaultCategory: '電子書籍' },
  { senderDomain: 'flierinc.com',     normalizedName: 'ふらいやー',        displayName: 'flier（フライヤー）',    defaultAmount: 2200, defaultBillingCycle: 'monthly', defaultCategory: '電子書籍', referenceUrl: 'https://www.flierinc.com/settings/subscriptions' },

  // 学習（追加）
  { senderDomain: 'rosettastone.com', normalizedName: 'rosettastone',    displayName: 'Rosetta Stone',        defaultCategory: '学習', defaultCurrency: 'USD' },
  { senderDomain: 'busuu.com',        normalizedName: 'busuu',            displayName: 'Busuu',                defaultCategory: '学習', defaultCurrency: 'USD' },
  { senderDomain: 'italki.com',       normalizedName: 'italki',           displayName: 'iTalki',               defaultCategory: '学習', defaultCurrency: 'USD' },
  { senderDomain: 'udemy.com',        normalizedName: 'udemybusiness',   displayName: 'Udemy Business',       defaultCategory: '学習', defaultCurrency: 'USD' },

  // ニュース（追加）
  { senderDomain: 'bloomberg.co.jp',  normalizedName: 'bloombergjapan',   displayName: 'Bloomberg Japan',      defaultAmount: 2500, defaultBillingCycle: 'monthly', defaultCategory: 'ニュース・雑誌', referenceUrl: 'https://www.bloomberg.co.jp/subscription' },
  { senderDomain: 'newspicks.com',    normalizedName: 'newspicks',        displayName: 'NewsPicks',            defaultAmount: 1700, defaultBillingCycle: 'monthly', defaultCategory: 'ニュース・雑誌', referenceUrl: 'https://newspicks.com/settings/plan' },

  // フィットネス
  { senderDomain: 'zwift.com',        normalizedName: 'zwift',            displayName: 'Zwift',                defaultAmount: 19.99, defaultBillingCycle: 'monthly', defaultCategory: 'フィットネス', defaultCurrency: 'USD', referenceUrl: 'https://www.zwift.com/settings/plan' },
  { senderDomain: 'whoop.com',        normalizedName: 'whoop',            displayName: 'WHOOP',                defaultAmount: 30,   defaultBillingCycle: 'monthly', defaultCategory: 'フィットネス', defaultCurrency: 'USD', referenceUrl: 'https://app.whoop.com/membership' },
  { senderDomain: 'ouraring.com',     normalizedName: 'ouraring',         displayName: 'Oura Ring',            defaultAmount: 5.99, defaultBillingCycle: 'monthly', defaultCategory: 'フィットネス', defaultCurrency: 'USD', referenceUrl: 'https://cloud.ouraring.com/user/settings' },
  { senderDomain: 'noom.com',         normalizedName: 'noom',             displayName: 'Noom',                 defaultCategory: 'フィットネス', defaultCurrency: 'USD' },

  // 金融（追加）
  { senderDomain: 'moneytree.jp',     normalizedName: 'moneytree',        displayName: 'Moneytree',            defaultAmount: 500,  defaultBillingCycle: 'monthly', defaultCategory: '金融', referenceUrl: 'https://app.getmoneytree.com/settings/subscription' },
  { senderDomain: 'revolut.com',      normalizedName: 'revolut',          displayName: 'Revolut',              defaultCategory: '金融', defaultCurrency: 'USD' },

  // セキュリティ（追加）
  { senderDomain: 'eset.com',         normalizedName: 'eset',             displayName: 'ESET',                 defaultCategory: 'ソフトウェア' },
  { senderDomain: 'mcafee.com',       normalizedName: 'mcafee+',          displayName: 'McAfee+',              defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },
  { senderDomain: 'keepersecurity.com', normalizedName: 'keeper',         displayName: 'Keeper',               defaultAmount: 2.91, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://keepersecurity.com/vault/#account' },
  { senderDomain: 'malwarebytes.com', normalizedName: 'malwarebytes',     displayName: 'Malwarebytes',         defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },

  // ソフトウェア / AI（追加）
  {
    senderDomain: 'deepl.com',
    normalizedName: 'deeplpro',
    displayName: 'DeepL Pro',
    defaultAmount: 8.74,
    defaultBillingCycle: 'monthly',
    defaultCategory: 'ソフトウェア',
    defaultCurrency: 'USD',
    plans: [
      { label: 'Starter (月)', amount: 8.74,  billingCycle: 'monthly', currency: 'USD' },
      { label: 'Advanced (月)', amount: 28.74, billingCycle: 'monthly', currency: 'USD' },
      { label: 'Starter (年)',  amount: 83.99, billingCycle: 'yearly',  currency: 'USD' },
      { label: 'Advanced (年)', amount: 275.99, billingCycle: 'yearly', currency: 'USD' },
    ],
  },
  { senderDomain: 'setapp.com',       normalizedName: 'setapp',           displayName: 'Setapp',               defaultAmount: 9.99, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://my.setapp.com/account' },
  { senderDomain: 'readwise.io',      normalizedName: 'readwise',         displayName: 'Readwise',             defaultAmount: 7.99, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://readwise.io/accounts/subscription' },
  { senderDomain: 'feedly.com',       normalizedName: 'feedly',           displayName: 'Feedly',               defaultAmount: 6,    defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://feedly.com/i/account/pro' },
  { senderDomain: 'atlassian.com',    normalizedName: 'atlassian',        displayName: 'Atlassian',            defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },
  { senderDomain: 'clickup.com',      normalizedName: 'clickup',          displayName: 'ClickUp',              defaultAmount: 7,    defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://app.clickup.com/settings/billing' },
  { senderDomain: 'monday.com',       normalizedName: 'monday.com',       displayName: 'monday.com',           defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },
  { senderDomain: 'airtable.com',     normalizedName: 'airtable',         displayName: 'Airtable',             defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },
  { senderDomain: 'hubspot.com',      normalizedName: 'hubspot',          displayName: 'HubSpot',              defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },
  { senderDomain: 'hootsuite.com',    normalizedName: 'hootsuite',        displayName: 'Hootsuite',            defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },
  { senderDomain: 'mailchimp.com',    normalizedName: 'mailchimp',        displayName: 'Mailchimp',            defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },
  { senderDomain: 'jasper.ai',        normalizedName: 'jasperai',         displayName: 'Jasper AI',            defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },
  { senderDomain: 'kagi.com',         normalizedName: 'kagi',             displayName: 'Kagi',                 defaultAmount: 10,   defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://kagi.com/settings/billing' },
  { senderDomain: 'jetbrains.com',    normalizedName: 'jetbrains',        displayName: 'JetBrains',            defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },
  { senderDomain: 'miro.com',         normalizedName: 'miro',             displayName: 'Miro',                 defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },
  { senderDomain: 'typeform.com',     normalizedName: 'typeform',         displayName: 'Typeform',             defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },
  { senderDomain: 'vercel.com',       normalizedName: 'vercel',           displayName: 'Vercel',               defaultAmount: 20,   defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://vercel.com/account/billing' },
  { senderDomain: 'gitlab.com',       normalizedName: 'gitlab',           displayName: 'GitLab',               defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },

  // クリエイター / 素材（追加）
  { senderDomain: 'shutterstock.com', normalizedName: 'shutterstock',     displayName: 'Shutterstock',         defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },
  { senderDomain: 'epidemicsound.com', normalizedName: 'epidemicsound',  displayName: 'Epidemic Sound',       defaultAmount: 15,   defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://www.epidemicsound.com/account/' },
  { senderDomain: 'elements.envato.com', normalizedName: 'envatoelements', displayName: 'Envato Elements',   defaultAmount: 16.5, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://elements.envato.com/account' },
  { senderDomain: 'freepik.com',      normalizedName: 'freepik',          displayName: 'Freepik',              defaultAmount: 9.99, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://www.freepik.com/settings/billing' },
  { senderDomain: 'vimeo.com',        normalizedName: 'vimeo',            displayName: 'Vimeo',                defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },
  { senderDomain: 'artlist.io',       normalizedName: 'artlist',          displayName: 'Artlist',              defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },
  { senderDomain: 'pixta.jp',         normalizedName: 'pixta',            displayName: 'PIXTA',                defaultCategory: 'ソフトウェア' },
  { senderDomain: 'descript.com',     normalizedName: 'descript',         displayName: 'Descript',             defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },
  { senderDomain: 'capcut.com',       normalizedName: 'capcutpro',       displayName: 'CapCut Pro',           defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },
  {
    senderDomain: 'midjourney.com',
    normalizedName: 'midjourney',
    displayName: 'Midjourney',
    defaultAmount: 10,
    defaultBillingCycle: 'monthly',
    defaultCategory: 'ソフトウェア',
    defaultCurrency: 'USD',
    plans: [
      { label: 'Basic (月)',   amount: 10,  billingCycle: 'monthly', currency: 'USD' },
      { label: 'Standard (月)', amount: 30, billingCycle: 'monthly', currency: 'USD' },
      { label: 'Pro (月)',     amount: 60,  billingCycle: 'monthly', currency: 'USD' },
      { label: 'Mega (月)',    amount: 120, billingCycle: 'monthly', currency: 'USD' },
    ],
  },
  { senderDomain: 'elevenlabs.io',    normalizedName: 'elevenlabs',       displayName: 'ElevenLabs',           defaultAmount: 22,   defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://elevenlabs.io/subscription' },
  { senderDomain: 'runway.ml',        normalizedName: 'runway',           displayName: 'Runway',               defaultCategory: 'ソフトウェア', defaultCurrency: 'USD' },

  // ゲーム（追加）
  { senderDomain: 'humblebundle.com', normalizedName: 'humblechoice',    displayName: 'Humble Choice',        defaultAmount: 11,   defaultBillingCycle: 'monthly', defaultCategory: 'ゲーム', defaultCurrency: 'USD', referenceUrl: 'https://www.humblebundle.com/subscription/home' },

  // ゲーム / Nintendo・PlayStation
  {
    senderDomain: 'nintendo.net',
    normalizedName: 'nintendoswitchonline',
    displayName: 'Nintendo Switch Online',
    defaultAmount: 2400,
    defaultBillingCycle: 'yearly',
    defaultCategory: 'ゲーム',
    referenceUrl: 'https://accounts.nintendo.com/profile',
    plans: [
      { label: 'ファミリープラン(年)', amount: 4500, billingCycle: 'yearly' },
      { label: '個人プラン(年)',       amount: 2400, billingCycle: 'yearly' },
      { label: 'ファミリー+追加パック(年)', amount: 6400, billingCycle: 'yearly' },
      { label: '個人+追加パック(年)',   amount: 4000, billingCycle: 'yearly' },
    ],
  },
  {
    senderDomain: 'accounts.nintendo.com',
    normalizedName: 'nintendoswitchonline',
    displayName: 'Nintendo Switch Online',
    defaultAmount: 2400,
    defaultBillingCycle: 'yearly',
    defaultCategory: 'ゲーム',
    referenceUrl: 'https://accounts.nintendo.com/profile',
    plans: [
      { label: 'ファミリープラン(年)', amount: 4500, billingCycle: 'yearly' },
      { label: '個人プラン(年)',       amount: 2400, billingCycle: 'yearly' },
      { label: 'ファミリー+追加パック(年)', amount: 6400, billingCycle: 'yearly' },
      { label: '個人+追加パック(年)',   amount: 4000, billingCycle: 'yearly' },
    ],
  },
  {
    senderDomain: 'playstation.com',
    normalizedName: 'playstationplus',
    displayName: 'PlayStation Plus',
    defaultAmount: 8600,
    defaultBillingCycle: 'yearly',
    defaultCategory: 'ゲーム',
    referenceUrl: 'https://www.playstation.com/ja-jp/ps-plus/',
    plans: [
      { label: 'エッセンシャル(月)', amount: 850,   billingCycle: 'monthly' },
      { label: 'エクストラ(月)',     amount: 1300,  billingCycle: 'monthly' },
      { label: 'プレミアム(月)',     amount: 1550,  billingCycle: 'monthly' },
      { label: 'エッセンシャル(年)', amount: 8600,  billingCycle: 'yearly'  },
      { label: 'エクストラ(年)',     amount: 13000, billingCycle: 'yearly'  },
      { label: 'プレミアム(年)',     amount: 15800, billingCycle: 'yearly'  },
    ],
  },
  { senderDomain: 'sony.co.jp',       normalizedName: 'playstationplus', displayName: 'PlayStation Plus', defaultAmount: 8600, defaultBillingCycle: 'yearly', defaultCategory: 'ゲーム', referenceUrl: 'https://www.playstation.com/ja-jp/ps-plus/' },

  // 動画配信（日本）
  { senderDomain: 'fod.fujitv.com',   normalizedName: 'fodぷれみあむ',     displayName: 'FODプレミアム',           defaultAmount: 976,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://fod.fujitv.co.jp/mypage/' },
  { senderDomain: 'fujitv.co.jp',     normalizedName: 'fodぷれみあむ',     displayName: 'FODプレミアム',           defaultAmount: 976,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://fod.fujitv.co.jp/mypage/' },
  { senderDomain: 'nhk-ondemand.jp',  normalizedName: 'nhkおんでまんど',   displayName: 'NHKオンデマンド',         defaultAmount: 990,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://www.nhk-ondemand.jp/mypage/' },
  { senderDomain: 'lemino.docomo.ne.jp', normalizedName: 'lemino',        displayName: 'Lemino',               defaultAmount: 990,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://lemino.docomo.ne.jp/mypage/' },
  { senderDomain: 'nttdocomo.com',    normalizedName: 'lemino',           displayName: 'Lemino',               defaultAmount: 990,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://lemino.docomo.ne.jp/mypage/' },
  { senderDomain: 'telasa.jp',        normalizedName: 'telasa',           displayName: 'Telasa',               defaultAmount: 618,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://telasa.jp/settings' },
  { senderDomain: 'skyperfectv.co.jp', normalizedName: 'すかぱー',        displayName: 'スカパー！',              defaultAmount: 4300, defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://my.skyperfectv.co.jp/' },

  // キャリア / ポイント
  { senderDomain: 'rakuten.co.jp',    normalizedName: 'らくてんぷれみあむ', displayName: '楽天プレミアム',           defaultAmount: 2149, defaultBillingCycle: 'yearly',  defaultCategory: 'ショッピング', referenceUrl: 'https://www.rakuten.co.jp/premium/' },
  { senderDomain: 'yahoo.co.jp',      normalizedName: 'lypぷれみあむ',    displayName: 'LYPプレミアム',           defaultAmount: 508,  defaultBillingCycle: 'monthly', defaultCategory: 'ショッピング', referenceUrl: 'https://premium.yahoo.co.jp/member/' },
  { senderDomain: 'kddi.com',         normalizedName: 'auすまーとぱすぷれみあむ', displayName: 'au スマートパスプレミアム', defaultAmount: 548, defaultBillingCycle: 'monthly', defaultCategory: 'ショッピング', referenceUrl: 'https://pass.auone.jp/' },

  // 金融
  { senderDomain: 'moneyforward.com', normalizedName: 'まねーふぉわーどmeぷれみあむ', displayName: 'マネーフォワード ME プレミアム', defaultAmount: 500, defaultBillingCycle: 'monthly', defaultCategory: '金融', referenceUrl: 'https://moneyforward.com/settings/account_setting' },
  {
    senderDomain: 'freee.co.jp',
    normalizedName: 'freee',
    displayName: 'freee',
    defaultCategory: '金融',
    referenceUrl: 'https://secure.freee.co.jp/settings/plans',
    plans: [
      { label: '個人事業主 スターター (月)', amount: 1980,  billingCycle: 'monthly', serviceName: 'freee 個人事業主'     },
      { label: '個人事業主 スタンダード (月)', amount: 2980, billingCycle: 'monthly', serviceName: 'freee 個人事業主'     },
      { label: '法人 スターター (月)',         amount: 2980,  billingCycle: 'monthly', serviceName: 'freee 法人'           },
      { label: '法人 スタンダード (月)',        amount: 5980, billingCycle: 'monthly', serviceName: 'freee 法人'           },
    ],
  },

  // 学習
  { senderDomain: 'studysapuri.jp',   normalizedName: 'すたでぃさぷり',   displayName: 'スタディサプリ',           defaultAmount: 2178, defaultBillingCycle: 'monthly', defaultCategory: '学習', referenceUrl: 'https://studysapuri.jp/settings' },
  { senderDomain: 'recruit.co.jp',    normalizedName: 'すたでぃさぷり',   displayName: 'スタディサプリ',           defaultAmount: 2178, defaultBillingCycle: 'monthly', defaultCategory: '学習', referenceUrl: 'https://studysapuri.jp/settings' },
  { senderDomain: 'benesse.ne.jp',    normalizedName: 'しんけんぜみ',     displayName: '進研ゼミ',               defaultAmount: 2600, defaultBillingCycle: 'monthly', defaultCategory: '学習', referenceUrl: 'https://www.shimajiro.co.jp/mypage/' },

  // フィットネス
  { senderDomain: 'strava.com',       normalizedName: 'strava',           displayName: 'Strava',               defaultAmount: 8,    defaultBillingCycle: 'monthly', defaultCategory: 'フィットネス', defaultCurrency: 'USD', referenceUrl: 'https://www.strava.com/settings/subscription' },
  { senderDomain: 'garmin.com',       normalizedName: 'garminconnectpremium', displayName: 'Garmin Connect Premium', defaultAmount: 700, defaultBillingCycle: 'monthly', defaultCategory: 'フィットネス', referenceUrl: 'https://connect.garmin.com/modern/settings' },

  // 電子書籍 / マンガ
  { senderDomain: 'shonenjump.com',   normalizedName: 'しょうねんじゃんぷぷらす', displayName: '少年ジャンプ+',      defaultAmount: 976,  defaultBillingCycle: 'monthly', defaultCategory: '電子書籍', referenceUrl: 'https://shonenjump.com/j/account' },

  // ニュース
  { senderDomain: 'smartnews.com',    normalizedName: 'smartnews+',       displayName: 'SmartNews+',           defaultAmount: 600,  defaultBillingCycle: 'monthly', defaultCategory: 'ニュース・雑誌', referenceUrl: 'https://www.smartnews.com/settings' },

  // ラジオ
  { senderDomain: 'radiko.jp',        normalizedName: 'radikoぷれみあむ', displayName: 'Radiko プレミアム',      defaultAmount: 385,  defaultBillingCycle: 'monthly', defaultCategory: '音楽', referenceUrl: 'https://radiko.jp/account/' },

  // 動画配信（日本 追加）
  { senderDomain: 'b-ch.com',         normalizedName: 'ばんだいちゃんねる', displayName: 'バンダイチャンネル',      defaultAmount: 550,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://www.b-ch.com/member/', plans: [{ label: '月払い', amount: 550, billingCycle: 'monthly' }, { label: '年払い', amount: 5500, billingCycle: 'yearly' }] },
  { senderDomain: 'hikaritv.ne.jp',   normalizedName: 'ひかりてぃびー',   displayName: 'ひかりTV',               defaultAmount: 880,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://hikaritv.net/mypage/' },
  { senderDomain: 'dmm.com',          normalizedName: 'dmmtvぷれみあむ',  displayName: 'DMM TV',               defaultAmount: 550,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://tv.dmm.com/vod/mypage/' },
  { senderDomain: 'rakuten-tv.co.jp', normalizedName: 'らくてんてぃびー', displayName: '楽天TV',                defaultCategory: '動画配信', referenceUrl: 'https://tv.rakuten.co.jp/my/' },

  // 音楽（追加）
  { senderDomain: 'awa.fm',           normalizedName: 'awa',              displayName: 'AWA',                  defaultAmount: 960,  defaultBillingCycle: 'monthly', defaultCategory: '音楽', referenceUrl: 'https://awa.fm/settings' },
  { senderDomain: 'rakuten-music.jp', normalizedName: 'らくてんみゅーじっく', displayName: '楽天ミュージック',       defaultAmount: 980,  defaultBillingCycle: 'monthly', defaultCategory: '音楽', referenceUrl: 'https://music.rakuten.co.jp/settings' },

  // ゲーム（追加）
  {
    senderDomain: 'xbox.com',
    normalizedName: 'xboxgamepassultimate',
    displayName: 'Xbox Game Pass Ultimate',
    defaultAmount: 1210,
    defaultBillingCycle: 'monthly',
    defaultCategory: 'ゲーム',
    referenceUrl: 'https://www.xbox.com/ja-JP/xbox-game-pass',
    plans: [
      { label: 'Game Pass Ultimate (月)', amount: 1210,  billingCycle: 'monthly', serviceName: 'Xbox Game Pass Ultimate' },
      { label: 'Game Pass Ultimate (年)', amount: 12100, billingCycle: 'yearly',  serviceName: 'Xbox Game Pass Ultimate' },
      { label: 'Game Pass PC (月)',       amount: 850,   billingCycle: 'monthly', serviceName: 'Xbox Game Pass PC' },
    ],
  },
  { senderDomain: 'ea.com',           normalizedName: 'eaplay',           displayName: 'EA Play',              defaultAmount: 518,  defaultBillingCycle: 'monthly', defaultCategory: 'ゲーム', referenceUrl: 'https://www.ea.com/ea-play', plans: [{ label: 'EA Play (月)', amount: 518, billingCycle: 'monthly' }, { label: 'EA Play Pro (月)', amount: 1028, billingCycle: 'monthly', serviceName: 'EA Play Pro' }] },
  { senderDomain: 'epicgames.com',    normalizedName: 'epicgames',        displayName: 'Epic Games',           defaultCategory: 'ゲーム', referenceUrl: 'https://www.epicgames.com/id/accounts' },
  { senderDomain: 'square-enix.com',  normalizedName: 'ふぁいなるふぁんたじーじゅうよん', displayName: 'ファイナルファンタジーXIV', defaultAmount: 1518, defaultBillingCycle: 'monthly', defaultCategory: 'ゲーム', referenceUrl: 'https://secure.square-enix.com/account/app/svc/mogstation/' },

  // 電子書籍 / マンガ（追加）
  { senderDomain: 'cmoa.jp',          normalizedName: 'こみっくしーもあよみほうだい', displayName: 'コミックシーモア', defaultAmount: 880,  defaultBillingCycle: 'monthly', defaultCategory: '電子書籍', referenceUrl: 'https://www.cmoa.jp/mypage/', plans: [{ label: '読み放題ライト', amount: 880, billingCycle: 'monthly' }, { label: '読み放題フル', amount: 1480, billingCycle: 'monthly' }] },
  { senderDomain: 'manga.line.me',    normalizedName: 'らいんまんがよみほうだい', displayName: 'LINEマンガ読み放題',  defaultAmount: 960,  defaultBillingCycle: 'monthly', defaultCategory: '電子書籍', referenceUrl: 'https://manga.line.me/store/mypage' },
  { senderDomain: 'mangaone.com',     normalizedName: 'まんがおうこく',   displayName: 'まんが王国',             defaultAmount: 1100, defaultBillingCycle: 'monthly', defaultCategory: '電子書籍', referenceUrl: 'https://comic.k-manga.jp/mypage' },
  { senderDomain: 'piccoma.com',      normalizedName: 'ぴっこまこうどくぷらん', displayName: 'ピッコマ',           defaultCategory: '電子書籍', referenceUrl: 'https://piccoma.com/web/mypage' },

  // 学習（追加）
  { senderDomain: 'zkai.co.jp',       normalizedName: 'z会',              displayName: 'Z会',                  defaultCategory: '学習', referenceUrl: 'https://secure.zkai.co.jp/z/member/account' },
  { senderDomain: 'eikaiwa.dmm.com',  normalizedName: 'dmmえいかいわ',    displayName: 'DMM英会話',             defaultCategory: '学習', referenceUrl: 'https://eikaiwa.dmm.com/mypage/' },
  { senderDomain: 'smilezemi.jp',     normalizedName: 'すまいるぜみ',      displayName: 'スマイルゼミ',           defaultCategory: '学習', referenceUrl: 'https://www.smilezemi.jp/member/' },
  { senderDomain: 'progate.com',      normalizedName: 'progate',          displayName: 'Progate',              defaultAmount: 1078, defaultBillingCycle: 'monthly', defaultCategory: '学習', referenceUrl: 'https://prog-8.com/settings/plan' },
  { senderDomain: 'schoo.jp',         normalizedName: 'schoo',            displayName: 'schoo',                defaultAmount: 980,  defaultBillingCycle: 'monthly', defaultCategory: '学習', referenceUrl: 'https://schoo.jp/settings' },
  { senderDomain: 'globis.jp',        normalizedName: 'ぐろーびすまなびほうだい', displayName: 'GLOBIS 学び放題', defaultAmount: 2057, defaultBillingCycle: 'monthly', defaultCategory: '学習', referenceUrl: 'https://globis.jp/mypage' },
  { senderDomain: 'nativecamp.net',   normalizedName: 'nativecamp',       displayName: 'Native Camp',          defaultAmount: 6480, defaultBillingCycle: 'monthly', defaultCategory: '学習', referenceUrl: 'https://nativecamp.net/mypage' },

  // セキュリティ / VPN（追加）
  { senderDomain: 'nordvpn.com',      normalizedName: 'nordvpn',          displayName: 'NordVPN',              defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://my.nordaccount.com/' },
  { senderDomain: 'expressvpn.com',   normalizedName: 'expressvpn',       displayName: 'ExpressVPN',           defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://www.expressvpn.com/jp/subscriptions' },
  { senderDomain: 'protonvpn.com',    normalizedName: 'protonvpnplus',    displayName: 'ProtonVPN Plus',       defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://proton.me/mail/upgrade' },
  { senderDomain: 'surfshark.com',    normalizedName: 'surfshark',        displayName: 'Surfshark',            defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://surfshark.com/vpn/account' },
  { senderDomain: 'norton.com',       normalizedName: 'norton360',        displayName: 'Norton 360',           defaultCategory: 'ソフトウェア', referenceUrl: 'https://my.norton.com/' },
  { senderDomain: 'trendmicro.co.jp', normalizedName: 'うぃるすばすたーくらうど', displayName: 'ウイルスバスター クラウド', defaultAmount: 4400, defaultBillingCycle: 'yearly', defaultCategory: 'ソフトウェア', referenceUrl: 'https://account.trendmicro.com/ja-jp/' },
  { senderDomain: 'kaspersky.co.jp',  normalizedName: 'かすぺるすきーぷれみあむ', displayName: 'カスペルスキー プレミアム', defaultCategory: 'ソフトウェア', referenceUrl: 'https://my.kaspersky.com/' },

  // AI（追加）
  { senderDomain: 'perplexity.ai',    normalizedName: 'perplexitypro',    displayName: 'Perplexity Pro',       defaultAmount: 20,   defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://www.perplexity.ai/settings/account' },
  { senderDomain: 'cursor.com',       normalizedName: 'cursorpro',        displayName: 'Cursor Pro',           defaultAmount: 20,   defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://www.cursor.com/settings' },

  // フィットネス / ヘルスケア（追加）
  { senderDomain: 'headspace.com',    normalizedName: 'headspace',        displayName: 'Headspace',            defaultAmount: 12.99, defaultBillingCycle: 'monthly', defaultCategory: 'フィットネス', defaultCurrency: 'USD', referenceUrl: 'https://www.headspace.com/settings' },
  { senderDomain: 'calm.com',         normalizedName: 'calm',             displayName: 'Calm',                 defaultAmount: 14.99, defaultBillingCycle: 'monthly', defaultCategory: 'フィットネス', defaultCurrency: 'USD', referenceUrl: 'https://app.calm.com/settings' },
  { senderDomain: 'leanbody.jp',      normalizedName: 'leanbody',         displayName: 'LEAN BODY',            defaultAmount: 980,  defaultBillingCycle: 'monthly', defaultCategory: 'フィットネス', referenceUrl: 'https://lean-body.jp/settings' },
  { senderDomain: 'soelu.com',        normalizedName: 'soelu',            displayName: 'SOELU',                defaultCategory: 'フィットネス', referenceUrl: 'https://www.soelu.com/mypage' },

  // フードデリバリー / グルメ
  { senderDomain: 'uber.com',         normalizedName: 'uberone',          displayName: 'Uber One',             defaultAmount: 598,  defaultBillingCycle: 'monthly', defaultCategory: 'その他', referenceUrl: 'https://www.uber.com/jp/ja/drive/services/uber-one/' },
  { senderDomain: 'wolt.com',         normalizedName: 'wolt+',            displayName: 'Wolt+',                defaultAmount: 599,  defaultBillingCycle: 'monthly', defaultCategory: 'その他', referenceUrl: 'https://wolt.com/ja/jpn' },
  { senderDomain: 'cookpad.com',      normalizedName: 'くっくぱっどぷれみあむ', displayName: 'クックパッドプレミアム', defaultAmount: 330,  defaultBillingCycle: 'monthly', defaultCategory: 'その他', referenceUrl: 'https://cookpad.com/settings/premium' },
  { senderDomain: 'tabelog.com',      normalizedName: 'たべろぐぷれみあむ', displayName: '食べログプレミアム',     defaultAmount: 400,  defaultBillingCycle: 'monthly', defaultCategory: 'その他', referenceUrl: 'https://tabelog.com/member' },
  { senderDomain: 'demae-can.com',    normalizedName: 'でまえかんだっしゅぱす', displayName: '出前館 ダッシュパス', defaultAmount: 300,  defaultBillingCycle: 'monthly', defaultCategory: 'その他', referenceUrl: 'https://demae-can.com/member/mypage' },

  // ニュース・新聞（追加）
  { senderDomain: 'yomiuri.co.jp',    normalizedName: 'よみうりしんぶんぷれみあむ', displayName: '読売新聞プレミアム', defaultAmount: 4400, defaultBillingCycle: 'monthly', defaultCategory: 'ニュース・雑誌', referenceUrl: 'https://www.yomiuri.co.jp/member/' },
  { senderDomain: 'mainichi.jp',      normalizedName: 'まいにちしんぶんでじたる', displayName: '毎日新聞デジタル',  defaultAmount: 1100, defaultBillingCycle: 'monthly', defaultCategory: 'ニュース・雑誌', referenceUrl: 'https://mainichi.jp/member/' },

  // カーシェア / 移動（追加）
  { senderDomain: 'timescar.jp',      normalizedName: 'たいむずかー',      displayName: 'タイムズカー',           defaultCategory: 'その他', referenceUrl: 'https://share.timescar.jp/member/' },
  { senderDomain: 'careneco.jp',      normalizedName: 'かれこ',            displayName: 'カレコ',               defaultCategory: 'その他', referenceUrl: 'https://crs.careneco.com/member/' },

  // ゲーム / エンタメ（追加）
  { senderDomain: 'ubisoft.com',      normalizedName: 'ubisoft+',          displayName: 'Ubisoft+',             defaultAmount: 1800, defaultBillingCycle: 'monthly', defaultCategory: 'ゲーム', defaultCurrency: 'USD', referenceUrl: 'https://www.ubisoft.com/ja-jp/ubisoft-plus' },
  { senderDomain: 'paramountplus.com', normalizedName: 'paramount+',       displayName: 'Paramount+',           defaultAmount: 880,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://www.paramountplus.com/jp/account/' },
  { senderDomain: 'ntv.co.jp',        normalizedName: 'にってれまいどぉ',  displayName: '日テレMyDo!',           defaultAmount: 550,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://ntv-mydo.jp/mypage/' },
  { senderDomain: 'p-liga.jp',        normalizedName: 'ぱりーぐてぃーびー', displayName: 'パ・リーグTV',          defaultAmount: 702,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://tv.p-liga.jp/' },

  // docomo dサービス（追加）
  { senderDomain: 'dhits.dmkt-sp.jp', normalizedName: 'dひっつ',           displayName: 'dヒッツ',               defaultAmount: 330,  defaultBillingCycle: 'monthly', defaultCategory: '音楽', referenceUrl: 'https://dhits.docomo.ne.jp/mypage/' },

  // 電子書籍 / マンガ（追加）
  { senderDomain: 'comic-days.com',   normalizedName: 'こみっくでいず',    displayName: 'コミックDAYS',           defaultAmount: 960,  defaultBillingCycle: 'monthly', defaultCategory: '電子書籍', referenceUrl: 'https://comic-days.com/member/' },
  { senderDomain: 'yanmaga.jp',       normalizedName: 'やんじゃんよみほうだい', displayName: 'ヤンジャン!読み放題', defaultAmount: 780,  defaultBillingCycle: 'monthly', defaultCategory: '電子書籍', referenceUrl: 'https://yanmaga.jp/mypage/' },
  { senderDomain: 'manga-mee.jp',     normalizedName: 'まんがみー',        displayName: 'マンガMee',             defaultAmount: 960,  defaultBillingCycle: 'monthly', defaultCategory: '電子書籍', referenceUrl: 'https://manga-mee.jp/mypage/' },
  { senderDomain: 'ameba.jp',         normalizedName: 'あめばまんがよみほうだい', displayName: 'Amebaマンガ読み放題', defaultAmount: 980,  defaultBillingCycle: 'monthly', defaultCategory: '電子書籍', referenceUrl: 'https://manga.ameba.jp/mypage/' },
  { senderDomain: 'renta.papy.co.jp', normalizedName: 'れんたよみほうだい', displayName: 'Renta!読み放題',        defaultAmount: 880,  defaultBillingCycle: 'monthly', defaultCategory: '電子書籍', referenceUrl: 'https://renta.papy.co.jp/renta/sc/frm/mypage/' },
  { senderDomain: 'auone.jp',         normalizedName: 'auぶっくぱす',      displayName: 'auブックパス',           defaultAmount: 618,  defaultBillingCycle: 'monthly', defaultCategory: '電子書籍', referenceUrl: 'https://bookpass.auone.jp/' },
  { senderDomain: 'mangabang.jp',     normalizedName: 'まんがばんぐよみほうだい', displayName: 'マンガBANG!読み放題', defaultCategory: '電子書籍', referenceUrl: 'https://www.mangabang.net/mypage/' },
  { senderDomain: 'comicwalker.net',  normalizedName: 'こみっくうぉーかーよみほうだい', displayName: 'コミックウォーカー 読み放題', defaultAmount: 880, defaultBillingCycle: 'monthly', defaultCategory: '電子書籍', referenceUrl: 'https://comic-walker.com/subscription' },

  // LINEサービス（追加）
  { senderDomain: 'scdn.line.me',     normalizedName: 'らいんすたんぷぷれみあむ', displayName: 'LINEスタンプ プレミアム', defaultAmount: 300, defaultBillingCycle: 'monthly', defaultCategory: 'その他', referenceUrl: 'https://store.line.me/settings/stamp-premium' },

  // こどもサービス（追加）
  { senderDomain: 'shimajiro.co.jp',  normalizedName: 'こどもちゃれんじ', displayName: 'こどもちゃれんじ',       defaultCategory: '学習', referenceUrl: 'https://www.shimajiro.co.jp/mypage/' },

  // ソフトウェア（追加）
  { senderDomain: 'grammarly.com',    normalizedName: 'grammarlypremium', displayName: 'Grammarly Premium',    defaultAmount: 12,   defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://www.grammarly.com/account/subscription' },
  { senderDomain: 'shopify.com',      normalizedName: 'shopify',          displayName: 'Shopify',              defaultAmount: 33,   defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://www.shopify.com/admin/settings/billing' },
  { senderDomain: 'backblaze.com',    normalizedName: 'backblaze',        displayName: 'Backblaze',            defaultAmount: 9,    defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://secure.backblaze.com/user_overview.htm' },
  { senderDomain: 'dotinstall.com',   normalizedName: 'どっとインすとーる', displayName: 'ドットインストール',    defaultAmount: 1080, defaultBillingCycle: 'monthly', defaultCategory: '学習', referenceUrl: 'https://dotinstall.com/settings' },
  { senderDomain: 'loom.com',         normalizedName: 'loom',             displayName: 'Loom',                 defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://www.loom.com/settings/billing' },
  { senderDomain: 'obsidian.md',      normalizedName: 'obsidiansync',     displayName: 'Obsidian Sync',        defaultAmount: 4,    defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://obsidian.md/account' },

  // 動画配信（追加）
  { senderDomain: 'videomarket.jp',   normalizedName: 'ビデオマーケット',  displayName: 'ビデオマーケット',        defaultAmount: 550,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://www.videomarket.jp/member/' },
  { senderDomain: 'jcom.co.jp',       normalizedName: 'j:comオんでまんど', displayName: 'J:COMオンデマンド',      defaultAmount: 605,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://www.jcom.co.jp/userinfo/video/' },

  // ニュース・ビジネス（追加）
  { senderDomain: 'president.jp',     normalizedName: 'プレジデントオンライン', displayName: 'プレジデントオンライン', defaultAmount: 600, defaultBillingCycle: 'monthly', defaultCategory: 'ニュース・雑誌', referenceUrl: 'https://president.jp/member' },
  { senderDomain: 'diamond.jp',       normalizedName: 'ダイヤモンド・オンライン', displayName: 'ダイヤモンド・オンライン', defaultAmount: 2200, defaultBillingCycle: 'monthly', defaultCategory: 'ニュース・雑誌', referenceUrl: 'https://diamond.jp/member' },
  { senderDomain: 'toyokeizai.net',   normalizedName: '東洋経済オンライン', displayName: '東洋経済オンライン', defaultAmount: 1047, defaultBillingCycle: 'monthly', defaultCategory: 'ニュース・雑誌', referenceUrl: 'https://toyokeizai.net/info/about/subscription' },

  // フィットネス（追加）
  { senderDomain: 'fitbit.com',       normalizedName: 'fitbitpremium',    displayName: 'Fitbit Premium',       defaultAmount: 9.99, defaultBillingCycle: 'monthly', defaultCategory: 'フィットネス', defaultCurrency: 'USD', referenceUrl: 'https://www.fitbit.com/global/jp/account' },
  { senderDomain: 'google.com',       normalizedName: 'fitbitpremium',    displayName: 'Fitbit Premium',       defaultAmount: 9.99, defaultBillingCycle: 'monthly', defaultCategory: 'フィットネス', defaultCurrency: 'USD', referenceUrl: 'https://www.fitbit.com/global/jp/products/fitbit-premium' },
  { senderDomain: 'myfitnesspal.com', normalizedName: 'myfitnesspal',     displayName: 'MyFitnessPal',         defaultAmount: 9.99, defaultBillingCycle: 'monthly', defaultCategory: 'フィットネス', defaultCurrency: 'USD', referenceUrl: 'https://www.myfitnesspal.com/account/premium' },

  // 学習（追加）
  {
    senderDomain: 'coursera.org',
    normalizedName: 'courseraplus',
    displayName: 'Coursera Plus',
    defaultAmount: 59,
    defaultBillingCycle: 'monthly',
    defaultCategory: '学習',
    defaultCurrency: 'USD',
    referenceUrl: 'https://www.coursera.org/settings/billing',
    plans: [
      { label: 'Plus (月払い)', amount: 59,  billingCycle: 'monthly', currency: 'USD', serviceName: 'Coursera Plus' },
      { label: 'Plus (年払い)', amount: 399, billingCycle: 'yearly',  currency: 'USD', serviceName: 'Coursera Plus' },
    ],
  },
  {
    senderDomain: 'linkedin.com',
    normalizedName: 'linkedinpremium',
    displayName: 'LinkedIn Premium',
    defaultAmount: 39.99,
    defaultBillingCycle: 'monthly',
    defaultCategory: 'ソフトウェア',
    defaultCurrency: 'USD',
    referenceUrl: 'https://www.linkedin.com/premium/manage',
    plans: [
      { label: 'Career (月払い)',   amount: 39.99, billingCycle: 'monthly', currency: 'USD', serviceName: 'LinkedIn Premium Career'   },
      { label: 'Business (月払い)', amount: 59.99, billingCycle: 'monthly', currency: 'USD', serviceName: 'LinkedIn Premium Business' },
    ],
  },

  // セキュリティ（追加）
  {
    senderDomain: 'bitwarden.com',
    normalizedName: 'bitwarden',
    displayName: 'Bitwarden',
    defaultAmount: 10,
    defaultBillingCycle: 'yearly',
    defaultCategory: 'ソフトウェア',
    defaultCurrency: 'USD',
    referenceUrl: 'https://bitwarden.com/settings/billing',
    plans: [
      { label: 'Premium (年払い)',      amount: 10,  billingCycle: 'yearly',  currency: 'USD', serviceName: 'Bitwarden'          },
      { label: 'Families (年払い)',     amount: 40,  billingCycle: 'yearly',  currency: 'USD', serviceName: 'Bitwarden Families' },
    ],
  },
  { senderDomain: 'dashlane.com',     normalizedName: 'dashlane',         displayName: 'Dashlane',             defaultAmount: 4.99, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://app.dashlane.com/settings/billing' },

  // ソフトウェア（追加）
  {
    senderDomain: 'todoist.com',
    normalizedName: 'todoist',
    displayName: 'Todoist',
    defaultAmount: 600,
    defaultBillingCycle: 'monthly',
    defaultCategory: 'ソフトウェア',
    referenceUrl: 'https://todoist.com/app/settings/subscriptions',
    plans: [
      { label: 'Pro (月払い)', amount: 600,  billingCycle: 'monthly', serviceName: 'Todoist Pro' },
      { label: 'Pro (年払い)', amount: 4800, billingCycle: 'yearly',  serviceName: 'Todoist Pro' },
    ],
  },
  { senderDomain: 'plex.tv',          normalizedName: 'plexpass',         displayName: 'Plex Pass',            defaultAmount: 4.99, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://www.plex.tv/plex-pass/' },

  // 日本語サービス（追加）
  { senderDomain: 'magazine.rakuten.co.jp', normalizedName: 'らくてんまがじん', displayName: '楽天マガジン', defaultAmount: 418, defaultBillingCycle: 'monthly', defaultCategory: 'ニュース・雑誌', referenceUrl: 'https://magazine.rakuten.co.jp/member/' },
  { senderDomain: 'recochoku.jp',   normalizedName: 'recmusic',          displayName: 'RecMusic',              defaultAmount: 550,  defaultBillingCycle: 'monthly', defaultCategory: '音楽', referenceUrl: 'https://recochoku.jp/member/' },
  { senderDomain: 'mora.jp',        normalizedName: 'moraqualitas',      displayName: 'mora qualitas',         defaultAmount: 1980, defaultBillingCycle: 'monthly', defaultCategory: '音楽', referenceUrl: 'https://mora.jp/member/' },
  { senderDomain: 'gaora.co.jp',    normalizedName: 'gaorasports',       displayName: 'GAORA SPORTS',          defaultAmount: 770,  defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://member.gaora.co.jp/' },
  { senderDomain: 'm-78.jp',        normalizedName: 'tsuburayaimagination', displayName: 'TSUBURAYA IMAGINATION', defaultAmount: 880, defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://imagination.m-78.jp/account' },
  { senderDomain: 'anyca.net',      normalizedName: 'anyca',             displayName: 'Anyca',                 defaultCategory: 'その他', referenceUrl: 'https://anyca.net/mypage/' },
  { senderDomain: 'softbank.jp',    normalizedName: 'softbanksafe',      displayName: 'SoftBank Safe',         defaultAmount: 220,  defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', referenceUrl: 'https://www.softbank.jp/mobile/service/safe/' },
  { senderDomain: 'eight.company',  normalizedName: 'eightprofessional', displayName: 'Eight Professional',    defaultAmount: 480,  defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', referenceUrl: 'https://8card.net/settings/billing' },
  { senderDomain: 'finc.com',       normalizedName: 'fincpremium',       displayName: 'FiNC Premium',          defaultAmount: 980,  defaultBillingCycle: 'monthly', defaultCategory: 'フィットネス', referenceUrl: 'https://app.finc.com/settings/subscription' },

  // 学習（追加）
  { senderDomain: 'cambly.com',     normalizedName: 'cambly',            displayName: 'Cambly',               defaultAmount: 15.99, defaultBillingCycle: 'monthly', defaultCategory: '学習', defaultCurrency: 'USD', referenceUrl: 'https://www.cambly.com/en/students/settings/subscription' },
  { senderDomain: 'babbel.com',     normalizedName: 'babbel',            displayName: 'Babbel',               defaultAmount: 9.99, defaultBillingCycle: 'monthly', defaultCategory: '学習', defaultCurrency: 'USD', referenceUrl: 'https://my.babbel.com/en/settings/subscription' },
  { senderDomain: 'skillshare.com', normalizedName: 'skillshare',        displayName: 'Skillshare',           defaultAmount: 14, defaultBillingCycle: 'monthly', defaultCategory: '学習', defaultCurrency: 'USD', referenceUrl: 'https://www.skillshare.com/en/membership' },
  { senderDomain: 'masterclass.com', normalizedName: 'masterclass',      displayName: 'MasterClass',          defaultAmount: 15, defaultBillingCycle: 'monthly', defaultCategory: '学習', defaultCurrency: 'USD', referenceUrl: 'https://www.masterclass.com/settings/billing' },
  { senderDomain: 'brilliant.org',  normalizedName: 'brilliant',         displayName: 'Brilliant',            defaultAmount: 19.99, defaultBillingCycle: 'monthly', defaultCategory: '学習', defaultCurrency: 'USD', referenceUrl: 'https://brilliant.org/settings/billing/' },
  { senderDomain: 'quizlet.com',    normalizedName: 'quizletplus',       displayName: 'Quizlet Plus',         defaultAmount: 7.99, defaultBillingCycle: 'monthly', defaultCategory: '学習', defaultCurrency: 'USD', referenceUrl: 'https://quizlet.com/settings/billing' },
  { senderDomain: 'codecademy.com', normalizedName: 'codecademypro',     displayName: 'Codecademy Pro',       defaultAmount: 19.99, defaultBillingCycle: 'monthly', defaultCategory: '学習', defaultCurrency: 'USD', referenceUrl: 'https://www.codecademy.com/account/billing' },
  { senderDomain: 'pluralsight.com', normalizedName: 'pluralsight',      displayName: 'Pluralsight',          defaultAmount: 29, defaultBillingCycle: 'monthly', defaultCategory: '学習', defaultCurrency: 'USD', referenceUrl: 'https://app.pluralsight.com/settings/billing' },

  // ソフトウェア/生産性（追加）
  { senderDomain: 'bear.app',       normalizedName: 'bear',              displayName: 'Bear',                 defaultAmount: 2.99, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://bear.app/settings/' },
  { senderDomain: 'flexibits.com',  normalizedName: 'fantastical',       displayName: 'Fantastical',          defaultAmount: 4.79, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://flexibits.com/fantastical/help/manage-subscription' },
  { senderDomain: 'asana.com',      normalizedName: 'asana',             displayName: 'Asana',                defaultAmount: 13.49, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://app.asana.com/-/admin_console/billing' },
  { senderDomain: 'trello.com',     normalizedName: 'trello',            displayName: 'Trello',               defaultAmount: 5, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://trello.com/billing' },
  { senderDomain: 'linear.app',     normalizedName: 'linear',            displayName: 'Linear',               defaultAmount: 8, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://linear.app/settings/billing' },
  { senderDomain: 'zapier.com',     normalizedName: 'zapier',            displayName: 'Zapier',               defaultAmount: 19.99, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://zapier.com/app/billing' },
  { senderDomain: 'make.com',       normalizedName: 'make',              displayName: 'Make',                 defaultAmount: 9, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://www.make.com/en/pricing' },

  // 辞書差分追加（service_dictionary.json にあってGmailSendersになかったエントリ）
  // Apple サービス
  { senderDomain: 'music.apple.com', normalizedName: 'applemusic', displayName: 'Apple Music', defaultAmount: 1080, defaultBillingCycle: 'monthly', defaultCategory: '音楽', referenceUrl: 'https://support.apple.com/ja-jp/118428' },
  { senderDomain: 'icloud.com', normalizedName: 'icloud+', displayName: 'iCloud+', defaultAmount: 130, defaultBillingCycle: 'monthly', defaultCategory: 'クラウドストレージ', referenceUrl: 'https://www.apple.com/jp/icloud/' },
  { senderDomain: 'tv.apple.com', normalizedName: 'appletv+', displayName: 'Apple TV+', defaultAmount: 900, defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://tv.apple.com/account' },
  { senderDomain: 'developer.apple.com', normalizedName: 'appledeveloperprogram', displayName: 'Apple Developer Program', defaultAmount: 12980, defaultBillingCycle: 'yearly', defaultCategory: 'ソフトウェア', referenceUrl: 'https://developer.apple.com/account/' },

  // Google サービス
  { senderDomain: 'one.google.com', normalizedName: 'googleone', displayName: 'Google One', defaultAmount: 250, defaultBillingCycle: 'monthly', defaultCategory: 'クラウドストレージ', referenceUrl: 'https://one.google.com/storage/subscriptions' },
  { senderDomain: 'music.youtube.com', normalizedName: 'youtubemusicpremium', displayName: 'YouTube Music Premium', defaultAmount: 980, defaultBillingCycle: 'monthly', defaultCategory: '音楽', referenceUrl: 'https://music.youtube.com/paid_memberships' },
  { senderDomain: 'play.google.com', normalizedName: 'googleplaypass', displayName: 'Google Play Pass', defaultAmount: 600, defaultBillingCycle: 'monthly', defaultCategory: 'ゲーム', referenceUrl: 'https://play.google.com/store/account/subscriptions' },
  { senderDomain: 'workspace.google.com', normalizedName: 'googleworkspaceindividual', displayName: 'Google Workspace Individual', defaultAmount: 680, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', referenceUrl: 'https://workspace.google.com/dashboard' },
  { senderDomain: 'gemini.google.com', normalizedName: 'geminiadvanced', displayName: 'Gemini Advanced', defaultAmount: 2900, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', referenceUrl: 'https://one.google.com/storage/subscriptions' },

  // Microsoft
  { senderDomain: 'onedrive.live.com', normalizedName: 'microsoftonedrive', displayName: 'Microsoft OneDrive', defaultAmount: 260, defaultBillingCycle: 'monthly', defaultCategory: 'クラウドストレージ', referenceUrl: 'https://account.microsoft.com/services/' },

  // LINE
  {
    senderDomain: 'music.line.me',
    normalizedName: 'linemusic',
    displayName: 'LINE MUSIC',
    defaultAmount: 980,
    defaultBillingCycle: 'monthly',
    defaultCategory: '音楽',
    referenceUrl: 'https://music.line.me/webapp/mypage/premium',
    plans: [
      { label: '個人 (月)',    amount: 980,  billingCycle: 'monthly', serviceName: 'LINE MUSIC' },
      { label: 'ファミリー (月)', amount: 1680, billingCycle: 'monthly', serviceName: 'LINE MUSIC ファミリー' },
      { label: '個人 (年)',    amount: 9800, billingCycle: 'yearly',  serviceName: 'LINE MUSIC' },
    ],
  },

  // AI
  { senderDomain: 'claude.ai', normalizedName: 'claudepro', displayName: 'Claude Pro', defaultAmount: 20, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://claude.ai/settings' },

  // 学習
  { senderDomain: 'eigosapuri.jp', normalizedName: 'すたでぃさぷりいんぐりっしゅ', displayName: 'スタディサプリ English', defaultAmount: 3278, defaultBillingCycle: 'monthly', defaultCategory: '学習', referenceUrl: 'https://eigosapuri.jp/account/' },
  { senderDomain: 'pimsleur.com', normalizedName: 'pimsleur', displayName: 'Pimsleur', defaultAmount: 15, defaultBillingCycle: 'monthly', defaultCategory: '学習', defaultCurrency: 'USD', referenceUrl: 'https://www.pimsleur.com/account/subscriptions' },
  { senderDomain: 'studyplus.jp', normalizedName: 'studypluspro', displayName: 'Studyplus Pro', defaultAmount: 480, defaultBillingCycle: 'monthly', defaultCategory: '学習', referenceUrl: 'https://studyplus.jp/settings/pro' },
  { senderDomain: 'englishlive.ef.com', normalizedName: 'efenglishlive', displayName: 'EF English Live', defaultBillingCycle: 'monthly', defaultCategory: '学習', defaultCurrency: 'USD', referenceUrl: 'https://englishlive.ef.com/account/' },
  { senderDomain: 'business.udemy.com', normalizedName: 'udemybusiness', displayName: 'Udemy Business', defaultBillingCycle: 'monthly', defaultCategory: '学習', defaultCurrency: 'USD', referenceUrl: 'https://business.udemy.com/account/billing/' },

  // ゲーム
  { senderDomain: 'nvidia.com', normalizedName: 'geforcenow', displayName: 'GeForce NOW', defaultAmount: 980, defaultBillingCycle: 'monthly', defaultCategory: 'ゲーム', referenceUrl: 'https://www.nvidia.com/en-us/geforce-now/account/' },
  { senderDomain: 'nintendo.com', normalizedName: 'nintendoswitchonlineふぁみりーぷらん', displayName: 'Nintendo Switch Online ファミリープラン', defaultAmount: 4500, defaultBillingCycle: 'yearly', defaultCategory: 'ゲーム', referenceUrl: 'https://accounts.nintendo.com/profile' },
  { senderDomain: 'dqx.jp', normalizedName: 'どらごんくえすとえっくすおんらいん', displayName: 'ドラゴンクエストXオンライン', defaultAmount: 1628, defaultBillingCycle: 'monthly', defaultCategory: 'ゲーム', referenceUrl: 'https://hiroba.dqx.jp/sc/' },
  { senderDomain: 'blizzard.com', normalizedName: 'worldofwarcraft', displayName: 'World of Warcraft', defaultAmount: 15, defaultBillingCycle: 'monthly', defaultCategory: 'ゲーム', defaultCurrency: 'USD', referenceUrl: 'https://account.battle.net/subscriptions' },
  { senderDomain: 'finalfantasyxiv.com', normalizedName: 'finalfantasyxivすたーたーぱっく', displayName: 'FINAL FANTASY XIV スターターパック', defaultAmount: 1234, defaultBillingCycle: 'monthly', defaultCategory: 'ゲーム', referenceUrl: 'https://secure.square-enix.com/account/app/svc/login?cont=account' },

  // ニュース・雑誌
  { senderDomain: 'sankei.com', normalizedName: 'さんけいしんぶんでんしばん', displayName: '産経新聞電子版', defaultAmount: 1100, defaultBillingCycle: 'monthly', defaultCategory: 'ニュース・雑誌', referenceUrl: 'https://www.sankei.com/member/' },
  { senderDomain: 'business.nikkei.com', normalizedName: 'にっけいびじねすでんしばん', displayName: '日経ビジネス電子版', defaultAmount: 2200, defaultBillingCycle: 'monthly', defaultCategory: 'ニュース・雑誌', referenceUrl: 'https://business.nikkei.com/mypage/' },
  { senderDomain: 'bunshun.jp', normalizedName: 'ぶんげいしゅんじゅうおんらいんぷれみあむ', displayName: '文藝春秋オンライン プレミアム', defaultAmount: 980, defaultBillingCycle: 'monthly', defaultCategory: 'ニュース・雑誌', referenceUrl: 'https://bunshun.jp/user/mypage' },
  { senderDomain: 'dhbr.net', normalizedName: 'harvardbusinessreviewjapan', displayName: 'Harvard Business Review Japan', defaultAmount: 1078, defaultBillingCycle: 'monthly', defaultCategory: 'ニュース・雑誌', referenceUrl: 'https://www.dhbr.net/user/mypage' },
  { senderDomain: 'newsweekjapan.jp', normalizedName: 'にゅーずうぃーくにほんばん', displayName: 'Newsweek 日本版', defaultAmount: 440, defaultBillingCycle: 'monthly', defaultCategory: 'ニュース・雑誌', referenceUrl: 'https://www.newsweekjapan.jp/member/' },

  // 金融
  { senderDomain: 'zaim.net', normalizedName: 'zaimpremium', displayName: 'Zaim Premium', defaultAmount: 480, defaultBillingCycle: 'monthly', defaultCategory: '金融', referenceUrl: 'https://zaim.net/settings/membership' },
  { senderDomain: 'yayoi-kk.co.jp', normalizedName: 'やよいかいけいおんらいん', displayName: '弥生会計オンライン', defaultAmount: 8800, defaultBillingCycle: 'yearly', defaultCategory: '金融', referenceUrl: 'https://yayoi-kk.co.jp/mypage/' },
  { senderDomain: 'getmoneytree.com', normalizedName: 'moneytreelinkpremium', displayName: 'Moneytree LINK Premium', defaultAmount: 500, defaultBillingCycle: 'monthly', defaultCategory: '金融', referenceUrl: 'https://app.getmoneytree.com/settings/subscription' },

  // フード
  { senderDomain: 'menu.inc', normalizedName: 'menupass', displayName: 'menu Pass', defaultAmount: 480, defaultBillingCycle: 'monthly', defaultCategory: 'フード', referenceUrl: 'https://menu.inc/account' },
  { senderDomain: 'oisix.com', normalizedName: 'oisix', displayName: 'Oisix', defaultCategory: 'フード', referenceUrl: 'https://www.oisix.com/member/mypage' },
  { senderDomain: 'pal-system.co.jp', normalizedName: 'ぱるしすてむ', displayName: 'パルシステム', defaultCategory: 'フード', referenceUrl: 'https://www.pal-system.co.jp/mypage/' },

  // フィットネス
  { senderDomain: 'fith.jp', normalizedName: 'fithonline', displayName: 'FITH ONLINE', defaultAmount: 2178, defaultBillingCycle: 'monthly', defaultCategory: 'フィットネス', referenceUrl: 'https://fith.jp/account' },
  { senderDomain: 'onepeloton.com', normalizedName: 'pelotonapp', displayName: 'Peloton App', defaultAmount: 13, defaultBillingCycle: 'monthly', defaultCategory: 'フィットネス', defaultCurrency: 'USD', referenceUrl: 'https://account.onepeloton.com/' },
  { senderDomain: 'yogastudioapp.com', normalizedName: 'yogastudio', displayName: 'Yoga Studio', defaultAmount: 13, defaultBillingCycle: 'monthly', defaultCategory: 'フィットネス', defaultCurrency: 'USD', referenceUrl: 'https://www.yogastudioapp.com/account' },

  // 動画配信
  { senderDomain: 'basketball.mb.softbank.jp', normalizedName: 'ばすけっとらいぶ', displayName: 'バスケットLIVE', defaultAmount: 1980, defaultBillingCycle: 'monthly', defaultCategory: '動画配信', referenceUrl: 'https://basketball.mb.softbank.jp/account' },
  { senderDomain: 'viki.com', normalizedName: 'vikipass', displayName: 'Viki Pass', defaultAmount: 5, defaultBillingCycle: 'monthly', defaultCategory: '動画配信', defaultCurrency: 'USD', referenceUrl: 'https://www.viki.com/settings/subscription' },

  // 音楽
  { senderDomain: 'soundcloud.com', normalizedName: 'soundcloudgo+', displayName: 'SoundCloud Go+', defaultAmount: 11, defaultBillingCycle: 'monthly', defaultCategory: '音楽', defaultCurrency: 'USD', referenceUrl: 'https://soundcloud.com/settings/subscription' },

  // 電子書籍
  { senderDomain: 'mechacomic.jp', normalizedName: 'めちゃこみっくよみほうだい', displayName: 'めちゃコミック 読み放題', defaultAmount: 960, defaultBillingCycle: 'monthly', defaultCategory: '電子書籍', referenceUrl: 'https://mechacomic.jp/users/membership' },
  { senderDomain: 'bookpass.auone.jp', normalizedName: 'ぶっくぱす', displayName: 'ブックパス', defaultAmount: 618, defaultBillingCycle: 'monthly', defaultCategory: '電子書籍', referenceUrl: 'https://bookpass.auone.jp/' },
  { senderDomain: 'comic-fuz.com', normalizedName: 'こみっくふぁず', displayName: 'コミックFUZ', defaultAmount: 980, defaultBillingCycle: 'monthly', defaultCategory: '電子書籍', referenceUrl: 'https://comic-fuz.com/' },

  // ショッピング
  { senderDomain: 'costco.co.jp', normalizedName: 'こすとこかいいんしょう', displayName: 'コストコ 会員証', defaultAmount: 4840, defaultBillingCycle: 'yearly', defaultCategory: 'ショッピング', referenceUrl: 'https://costco.co.jp/' },

  // その他
  { senderDomain: 'au.com', normalizedName: 'auあんしんさぽーとにじゅうよん', displayName: 'au あんしんサポート24', defaultAmount: 660, defaultBillingCycle: 'monthly', defaultCategory: 'その他', referenceUrl: 'https://au.com/' },
  { senderDomain: 'docomo.ne.jp', normalizedName: 'どこもあんしんせっていさーびす', displayName: 'ドコモ あんしん設定サービス', defaultAmount: 220, defaultBillingCycle: 'monthly', defaultCategory: 'その他', referenceUrl: 'https://docomo.ne.jp/' },

  // ソフトウェア
  { senderDomain: 'nordpass.com', normalizedName: 'nordpass', displayName: 'NordPass', defaultAmount: 3, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://nordpass.com/account/' },
  { senderDomain: 'squarespace.com', normalizedName: 'squarespace', displayName: 'Squarespace', defaultAmount: 16, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://account.squarespace.com/' },
  { senderDomain: 'webflow.com', normalizedName: 'webflow', displayName: 'Webflow', defaultAmount: 14, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://webflow.com/dashboard/billing' },
  { senderDomain: 'gopro.com', normalizedName: 'goproquik', displayName: 'GoPro Quik', defaultAmount: 2700, defaultBillingCycle: 'yearly', defaultCategory: 'ソフトウェア', referenceUrl: 'https://gopro.com/' },
  { senderDomain: 'inoreader.com', normalizedName: 'inoreader+pro', displayName: 'Inoreader Pro', defaultAmount: 8, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://inoreader.com/' },
  { senderDomain: 'cleanmymac.com', normalizedName: 'cleanmymac+', displayName: 'CleanMyMac+', defaultAmount: 10, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://cleanmymac.com/' },
  { senderDomain: 'omnigroup.com', normalizedName: 'omnifocus', displayName: 'OmniFocus', defaultAmount: 10, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://omnigroup.com/' },
  { senderDomain: 'stock.adobe.com', normalizedName: 'adobestock', displayName: 'Adobe Stock', defaultAmount: 30, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://stock.adobe.com/' },
  { senderDomain: 'cloudflare.com', normalizedName: 'cloudflarepro', displayName: 'Cloudflare Pro', defaultAmount: 20, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://cloudflare.com/' },
  { senderDomain: 'craft.do', normalizedName: 'craft', displayName: 'Craft', defaultAmount: 5, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://craft.do/' },
  { senderDomain: 'dayoneapp.com', normalizedName: 'dayonepremium', displayName: 'Day One Premium', defaultAmount: 3, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://dayoneapp.com/' },
  { senderDomain: 'wordpress.com', normalizedName: 'wordpress.compersonal', displayName: 'WordPress.com Personal', defaultAmount: 4800, defaultBillingCycle: 'yearly', defaultCategory: 'ソフトウェア', referenceUrl: 'https://wordpress.com/' },
  { senderDomain: 'wix.com', normalizedName: 'wixlight', displayName: 'Wix Light', defaultAmount: 17, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://wix.com/' },
  { senderDomain: 'storyblocks.com', normalizedName: 'storyblocks', displayName: 'Storyblocks', defaultAmount: 15, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://storyblocks.com/' },
  { senderDomain: 'sketch.com', normalizedName: 'sketch', displayName: 'Sketch', defaultAmount: 100, defaultBillingCycle: 'yearly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://sketch.com/' },
  { senderDomain: 'firefly.adobe.com', normalizedName: 'adobefireflyプレミアム', displayName: 'Adobe Firefly Premium', defaultAmount: 5, defaultBillingCycle: 'monthly', defaultCategory: 'ソフトウェア', defaultCurrency: 'USD', referenceUrl: 'https://firefly.adobe.com/' },

  // Apple 追加ドメイン
  { senderDomain: 'appleid.apple.com',     normalizedName: 'appleid',      displayName: 'Apple',         defaultCategory: 'ソフトウェア', referenceUrl: 'https://appleid.apple.com/' },
  { senderDomain: 'noreply.apple.com',     normalizedName: 'noreply_apple', displayName: 'Apple',         defaultCategory: 'ソフトウェア', referenceUrl: 'https://appleid.apple.com/' },

  // Google 追加ドメイン
  { senderDomain: 'accounts.google.com',   normalizedName: 'accounts_google', displayName: 'Google',      defaultCategory: 'ソフトウェア', referenceUrl: 'https://myaccount.google.com/' },
  { senderDomain: 'payments.google.com',   normalizedName: 'payments_google', displayName: 'Google',      defaultCategory: 'ソフトウェア', referenceUrl: 'https://payments.google.com/payments/home' },

  // Microsoft 追加ドメイン
  { senderDomain: 'microsoftonline.com',   normalizedName: 'microsoftonline', displayName: 'Microsoft',   defaultCategory: 'ソフトウェア', referenceUrl: 'https://account.microsoft.com/services/' },
  { senderDomain: 'account.microsoft.com', normalizedName: 'account_microsoft', displayName: 'Microsoft', defaultCategory: 'ソフトウェア', referenceUrl: 'https://account.microsoft.com/services/' },

  // Rakuten 追加ドメイン
  { senderDomain: 'grp.rakuten.co.jp',     normalizedName: 'grp_rakuten',  displayName: '楽天',          defaultCategory: 'ショッピング', referenceUrl: 'https://www.rakuten.co.jp/mypage/' },

  // Spotify 追加ドメイン
  { senderDomain: 'spotify-mail.com',      normalizedName: 'spotifymail',  displayName: 'Spotify',       defaultAmount: 980, defaultBillingCycle: 'monthly', defaultCategory: '音楽', referenceUrl: 'https://www.spotify.com/jp/account/overview/' },

  // Adobe 追加ドメイン
  { senderDomain: 'adobeid.com',           normalizedName: 'adobeid',      displayName: 'Adobe',         defaultCategory: 'ソフトウェア', referenceUrl: 'https://account.adobe.com/plans' },

  // Amazon 追加ドメイン
  { senderDomain: 'gc.email.amazon.co.jp', normalizedName: 'amazonprime_gc', displayName: 'Amazon Prime', defaultAmount: 600, defaultBillingCycle: 'monthly', defaultCategory: 'ショッピング', referenceUrl: 'https://www.amazon.co.jp/gp/subs/primeclub/account/homepage.html' },
];
