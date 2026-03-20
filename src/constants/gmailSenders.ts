/**
 * Gmailスキャンで差出人ドメインと照合するサービスパターン辞書。
 * senderDomain は From ヘッダーのドメイン部分との部分一致で使用する。
 */
export interface GmailSenderPattern {
  /** 差出人メールアドレスに含まれるドメイン文字列（部分一致） */
  senderDomain: string;
  /** サービス辞書の normalizedName（登録時のデフォルト名として使用） */
  normalizedName: string;
  /** 画面表示用サービス名 */
  displayName: string;
}

export const GMAIL_SENDER_PATTERNS: GmailSenderPattern[] = [
  // 動画配信
  { senderDomain: 'netflix.com',      normalizedName: 'netflix',          displayName: 'Netflix' },
  { senderDomain: 'disneyplus.com',   normalizedName: 'disney+',          displayName: 'Disney+' },
  { senderDomain: 'hulu.com',         normalizedName: 'hulu',             displayName: 'Hulu' },
  { senderDomain: 'unext.jp',         normalizedName: 'u-next',           displayName: 'U-NEXT' },
  { senderDomain: 'd-anime.ne.jp',    normalizedName: 'd anime',          displayName: 'dアニメストア' },
  { senderDomain: 'dmkt-sp.jp',       normalizedName: 'd anime',          displayName: 'dアニメストア' },
  { senderDomain: 'abema.io',         normalizedName: 'abema',            displayName: 'ABEMA' },
  { senderDomain: 'nicovideo.jp',     normalizedName: 'niconico',         displayName: 'ニコニコプレミアム' },
  { senderDomain: 'dazn.com',         normalizedName: 'dazn',             displayName: 'DAZN' },
  { senderDomain: 'wowow.co.jp',      normalizedName: 'wowow',            displayName: 'WOWOW' },

  // 音楽
  { senderDomain: 'spotify.com',      normalizedName: 'spotify',          displayName: 'Spotify' },
  { senderDomain: 'line-music.jp',    normalizedName: 'line music',       displayName: 'LINE MUSIC' },
  { senderDomain: 'music.amazon.co.jp', normalizedName: 'amazon music', displayName: 'Amazon Music' },

  // Apple / Google / Microsoft
  { senderDomain: 'apple.com',        normalizedName: 'apple music',      displayName: 'Apple（Music/TV+/iCloud）' },
  { senderDomain: 'google.com',       normalizedName: 'google one',       displayName: 'Google（One/YouTube）' },
  { senderDomain: 'youtube.com',      normalizedName: 'youtube premium',  displayName: 'YouTube Premium' },
  { senderDomain: 'microsoft.com',    normalizedName: 'microsoft 365',    displayName: 'Microsoft 365' },

  // Amazon
  { senderDomain: 'amazon.co.jp',     normalizedName: 'amazon prime',     displayName: 'Amazon' },
  { senderDomain: 'amazon.com',       normalizedName: 'amazon prime',     displayName: 'Amazon' },

  // クラウド / ストレージ
  { senderDomain: 'dropbox.com',      normalizedName: 'dropbox',          displayName: 'Dropbox' },

  // 仕事 / 生産性
  { senderDomain: 'notion.so',        normalizedName: 'notion',           displayName: 'Notion' },
  { senderDomain: 'slack.com',        normalizedName: 'slack',            displayName: 'Slack' },
  { senderDomain: 'figma.com',        normalizedName: 'figma',            displayName: 'Figma' },
  { senderDomain: 'zoom.us',          normalizedName: 'zoom',             displayName: 'Zoom' },
  { senderDomain: 'canva.com',        normalizedName: 'canva',            displayName: 'Canva' },
  { senderDomain: 'evernote.com',     normalizedName: 'evernote',         displayName: 'Evernote' },

  // ソフトウェア / 開発
  { senderDomain: 'adobe.com',        normalizedName: 'adobe cc',         displayName: 'Adobe' },
  { senderDomain: 'github.com',       normalizedName: 'github',           displayName: 'GitHub' },

  // AI
  { senderDomain: 'openai.com',       normalizedName: 'chatgpt plus',     displayName: 'ChatGPT Plus' },
  { senderDomain: 'anthropic.com',    normalizedName: 'claude pro',       displayName: 'Claude Pro' },

  // セキュリティ
  { senderDomain: '1password.com',    normalizedName: '1password',        displayName: '1Password' },
  { senderDomain: 'lastpass.com',     normalizedName: 'lastpass',         displayName: 'LastPass' },

  // 電子書籍 / オーディオ
  { senderDomain: 'audible.co.jp',    normalizedName: 'audible',          displayName: 'Audible' },
  { senderDomain: 'audiobook.jp',     normalizedName: 'audiobook',        displayName: 'audiobook.jp' },
  { senderDomain: 'bookwalker.jp',    normalizedName: 'book walker',      displayName: 'BOOK☆WALKER' },

  // 学習
  { senderDomain: 'duolingo.com',     normalizedName: 'duolingo',         displayName: 'Duolingo' },

  // ニュース
  { senderDomain: 'nikkei.com',       normalizedName: '日経電子版',        displayName: '日本経済新聞' },
  { senderDomain: 'asahi.com',        normalizedName: '朝日新聞',          displayName: '朝日新聞デジタル' },

  // クリエイター
  { senderDomain: 'pixiv.net',        normalizedName: 'pixiv premium',    displayName: 'pixiv' },
  { senderDomain: 'fanbox.cc',        normalizedName: 'fanbox',           displayName: 'pixivFANBOX' },
];
