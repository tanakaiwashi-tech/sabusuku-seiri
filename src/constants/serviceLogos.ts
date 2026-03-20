/**
 * サービスの normalizedName → ファビコン取得用ドメイン のマッピング。
 *
 * ## 運用方針
 * - service_dictionary.json のエントリに `domain` フィールドが設定されている場合は
 *   そちらが優先される（getServiceLogoUrl / getEntryLogoUrl 参照）。
 * - このファイルは「辞書に domain がまだ追加されていないサービス」の補完用フォールバック。
 * - 辞書に domain を追加したら、対応するエントリをこのファイルから削除して構わない。
 *
 * Google Favicon API (sz=64) でロゴを取得する。
 * ここに載っていないサービスは頭文字アバターにフォールバックする。
 */
const SERVICE_LOGO_DOMAINS: Record<string, string> = {
  // 動画配信
  amazonprime:             'amazon.co.jp',
  netflix:                 'netflix.com',
  youtubepremium:          'youtube.com',
  'disney+':               'disneyplus.com',
  hulu:                    'hulu.com',
  'u-next':                'unext.jp',
  'abemaぷれみあむ':       'abema.tv',
  dazn:                    'dazn.com',
  'nhkおんでまんど':       'nhk-ondemand.jp',
  'fodぷれみあむ':         'fod.fujitv.co.jp',
  'wowowおんでまんど':     'wowow.co.jp',
  'dあにめすとあ':         'anime.dmkt-sp.jp',
  'ばんだいちゃんねる':    'b-ch.com',
  lemino:                  'lemino.docomo.ne.jp',
  'すかぱー':              'skyperfectv.co.jp',
  'にこにこぷれみあむ':    'nicovideo.jp',

  // 音楽
  spotify:                 'spotify.com',
  applemusic:              'music.apple.com',
  linemusic:               'music.line.me',
  'appletv+':              'tv.apple.com',
  amazonmusicunlimited:    'music.amazon.co.jp',
  awa:                     'awa.fm',
  youtubemusicpremium:     'music.youtube.com',

  // クラウドストレージ
  'icloud+':               'icloud.com',
  googleone:               'one.google.com',
  dropbox:                 'dropbox.com',
  microsoftonedrive:       'onedrive.live.com',

  // ソフトウェア
  chatgptplus:             'openai.com',
  claudepro:               'claude.ai',
  perplexitypro:           'perplexity.ai',
  microsoft365:            'microsoft.com',
  notion:                  'notion.so',
  'ubisoft+':              'ubisoft.com',
  adobecreativecloud:      'adobe.com',
  adobephotoshop:          'adobe.com',
  canvapro:                'canva.com',
  evernote:                'evernote.com',
  githubpro:               'github.com',
  appleone:                'apple.com',
  appledeveloperprogram:   'developer.apple.com',

  // ゲーム
  nintendoswitchonline:    'nintendo.com',
  playstationplus:         'playstation.com',
  xboxgamepassultimate:    'xbox.com',
  eaplay:                  'ea.com',
  applearc:                'apple.com',

  // 電子書籍
  kindleunlimited:         'amazon.co.jp',
  audible:                 'audible.co.jp',

  // 学習
  duolingosuper:           'duolingo.com',
  'すたでぃさぷり':        'studysapuri.jp',
  'すたでぃさぷりいんぐりっしゅ': 'eigosapuri.jp',
  progate:                 'progate.com',
  'どっとインすとーる':    'dotinstall.com',
  'でぃーえむえむえいかいわ': 'eikaiwa.dmm.com',

  // ニュース・雑誌
  newspicks:               'newspicks.com',
  'にほんけいざいしんぶんでんしばん': 'nikkei.com',
  'あさひしんぶんでじたる': 'digital.asahi.com',

  // ショッピング
  'らくてんぷれみあむ':    'rakuten.co.jp',

  // 金融
  'まねーふぉわーどmeぷれみあむ': 'moneyforward.com',
};

const FAVICON_BASE = 'https://www.google.com/s2/favicons?domain=';

/**
 * normalizedName からロゴ画像 URL を返す。
 * 辞書にない場合は null（頭文字フォールバック）。
 *
 * @deprecated entryに domain フィールドが設定されている場合は getEntryLogoUrl を優先すること。
 */
export function getServiceLogoUrl(normalizedName: string): string | null {
  const domain = SERVICE_LOGO_DOMAINS[normalizedName];
  if (!domain) return null;
  return `${FAVICON_BASE}${domain}&sz=64`;
}

/**
 * ServiceDictionaryEntry.domain → ロゴ URL を返す。
 * entry.domain が設定されていればそれを優先し、なければ normalizedName でフォールバック。
 *
 * 使用例:
 *   const logoUrl = getEntryLogoUrl(entry.domain, entry.normalizedName);
 */
export function getEntryLogoUrl(
  entryDomain: string | undefined,
  normalizedName: string,
): string | null {
  const domain = entryDomain ?? SERVICE_LOGO_DOMAINS[normalizedName];
  if (!domain) return null;
  return `${FAVICON_BASE}${domain}&sz=64`;
}
