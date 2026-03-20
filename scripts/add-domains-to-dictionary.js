/**
 * service_dictionary.json の各エントリに domain フィールドを付与するスクリプト。
 * serviceLogos.ts の正規化名→ドメインマッピングを元に自動追記する。
 *
 * 使い方: node scripts/add-domains-to-dictionary.js
 *
 * 冪等性: 既に domain が設定されているエントリはスキップする。
 */
const fs   = require('fs');
const path = require('path');

// serviceLogos.ts と同等のマッピング（JS で再定義）
const LOGO_DOMAIN_MAP = {
  // 動画配信
  'amazonprime':                   'amazon.co.jp',
  'netflix':                       'netflix.com',
  'youtubepremium':                'youtube.com',
  'disney+':                       'disneyplus.com',
  'hulu':                          'hulu.com',
  'u-next':                        'unext.jp',
  'abemaぷれみあむ':               'abema.tv',
  'dazn':                          'dazn.com',
  'nhkおんでまんど':               'nhk-ondemand.jp',
  'fodぷれみあむ':                 'fod.fujitv.co.jp',
  'wowowおんでまんど':             'wowow.co.jp',
  'dあにめすとあ':                 'anime.dmkt-sp.jp',
  'ばんだいちゃんねる':            'b-ch.com',
  'lemino':                        'lemino.docomo.ne.jp',
  'すかぱー':                      'skyperfectv.co.jp',
  'にこにこぷれみあむ':            'nicovideo.jp',
  // 音楽
  'spotify':                       'spotify.com',
  'applemusic':                    'music.apple.com',
  'linemusic':                     'music.line.me',
  'appletv+':                      'tv.apple.com',
  'amazonmusicunlimited':          'music.amazon.co.jp',
  'awa':                           'awa.fm',
  'youtubemusicpremium':           'music.youtube.com',
  // クラウドストレージ
  'icloud+':                       'icloud.com',
  'googleone':                     'one.google.com',
  'dropbox':                       'dropbox.com',
  'microsoftonedrive':             'onedrive.live.com',
  // ソフトウェア
  'chatgptplus':                   'openai.com',
  'claudepro':                     'claude.ai',
  'perplexitypro':                 'perplexity.ai',
  'microsoft365':                  'microsoft.com',
  'notion':                        'notion.so',
  'ubisoft+':                      'ubisoft.com',
  'adobecreativecloud':            'adobe.com',
  'adobephotoshop':                'adobe.com',
  'canvapro':                      'canva.com',
  'evernote':                      'evernote.com',
  'githubpro':                     'github.com',
  'appleone':                      'apple.com',
  'appledeveloperprogram':         'developer.apple.com',
  // ゲーム
  'nintendoswitchonline':          'nintendo.com',
  'playstationplus':               'playstation.com',
  'xboxgamepassultimate':          'xbox.com',
  'eaplay':                        'ea.com',
  'applearc':                      'apple.com',
  // 電子書籍
  'kindleunlimited':               'amazon.co.jp',
  'audible':                       'audible.co.jp',
  // 学習
  'duolingosuper':                 'duolingo.com',
  'すたでぃさぷり':                'studysapuri.jp',
  'すたでぃさぷりいんぐりっしゅ': 'eigosapuri.jp',
  'progate':                       'progate.com',
  'どっとインすとーる':            'dotinstall.com',
  'でぃーえむえむえいかいわ':     'eikaiwa.dmm.com',
  // ニュース・雑誌
  'newspicks':                     'newspicks.com',
  'にほんけいざいしんぶんでんしばん': 'nikkei.com',
  'あさひしんぶんでじたる':        'digital.asahi.com',
  // ショッピング
  'らくてんぷれみあむ':            'rakuten.co.jp',
  // 金融
  'まねーふぉわーどmeぷれみあむ': 'moneyforward.com',
};

const dictPath = path.join(
  __dirname, '..', 'src', 'services', 'remoteConfig', 'fallback', 'service_dictionary.json',
);

const dict = JSON.parse(fs.readFileSync(dictPath, 'utf-8'));

let addedCount = 0;
for (const entry of dict.entries) {
  if (entry.domain) continue; // 既に設定済み
  const domain = LOGO_DOMAIN_MAP[entry.normalizedName];
  if (domain) {
    entry.domain = domain;
    addedCount++;
  }
}

fs.writeFileSync(dictPath, JSON.stringify(dict, null, 2) + '\n', 'utf-8');
console.log(`add-domains: ${addedCount} エントリに domain を追記しました。`);
