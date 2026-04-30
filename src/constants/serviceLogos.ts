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
  'disney+':               'disneyplus.com',  // 旧キー（後方互換）
  disneyplus:              'disneyplus.com',
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
  'appletv+':              'tv.apple.com',    // 旧キー（後方互換）
  appletvplus:             'tv.apple.com',
  amazonmusicunlimited:    'music.amazon.co.jp',
  awa:                     'awa.fm',
  youtubemusicpremium:     'music.youtube.com',

  // クラウドストレージ
  'icloud+':               'icloud.com',      // 旧キー（後方互換）
  icloudplus:              'icloud.com',
  icloudplus200gb:         'icloud.com',
  icloudplus2tb:           'icloud.com',
  googleone:               'one.google.com',
  dropbox:                 'dropbox.com',
  microsoftonedrive:       'onedrive.live.com',

  // ソフトウェア
  zoompro:                 'zoom.us',
  slackpro:                'slack.com',
  figmaprofessional:       'figma.com',
  grammarlypremium:        'grammarly.com',
  shopify:                 'shopify.com',
  backblaze:               'backblaze.com',
  obsidiansync:            'obsidian.md',
  loom:                    'loom.com',
  chatgptplus:             'openai.com',
  chatgptpro:              'openai.com',
  claudepro:               'claude.ai',
  perplexitypro:           'perplexity.ai',
  microsoft365:            'microsoft.com',
  notion:                  'notion.so',
  'ubisoft+':              'ubisoft.com',     // 旧キー（後方互換）
  ubisoftplus:             'ubisoft.com',
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
  smartnewsplus:           'smartnews.com',
  'にほんけいざいしんぶんでんしばん': 'nikkei.com',
  'あさひしんぶんでじたる': 'digital.asahi.com',
  'にってれまいどぉ':       'ntv.co.jp',
  'ぱりーぐてぃーびー':    'p-liga.jp',

  // ショッピング
  'らくてんぷれみあむ':    'rakuten.co.jp',

  // 金融
  'まねーふぉわーどmeぷれみあむ': 'moneyforward.com',

  // SNS / コミュニティ
  xpremium:                'x.com',
  discordnitro:            'discord.com',
  patreon:                 'patreon.com',
  notecreator:             'note.com',
  substack:                'substack.com',

  // 動画配信（追加）
  crunchyroll:             'crunchyroll.com',
  rakutentv:               'rakuten.co.jp',
  'らくてんてぃびー':      'tv.rakuten.co.jp',
  jsportsonline:           'jsports.co.jp',
  vikipass:                'viki.com',
  hikaritv:                'hikaritv.net',
  'ひかりてぃびー':        'hikaritv.net',
  'dmmtvぷれみあむ':       'tv.dmm.com',

  // 音楽（追加）
  'らくてんみゅーじっく':  'music.rakuten.co.jp',
  'dひっつ':               'dhits.docomo.ne.jp',
  kkbox:                   'kkbox.com',
  deezer:                  'deezer.com',
  soundcloudgoplus:        'soundcloud.com',
  tidal:                   'tidal.com',

  // 電子書籍 / マンガ（追加）
  jumpplus:                'shonenjump.com',
  ebookjapan:              'ebookjapan.yahoo.co.jp',
  flier:                   'flierinc.com',
  comicfuz:                'comic-fuz.com',
  piccoma:                 'piccoma.com',

  // 学習（追加）
  'z会':                   'zkai.co.jp',
  'dmmえいかいわ':          'eikaiwa.dmm.com',
  'すまいるぜみ':           'smilezemi.jp',
  schoo:                   'schoo.jp',
  'ぐろーびすまなびほうだい': 'globis.jp',
  nativecamp:              'nativecamp.net',
  rosettastone:            'rosettastone.com',
  busuu:                   'busuu.com',
  italki:                  'italki.com',
  udemybusiness:           'udemy.com',

  // ニュース（追加）
  bloombergjp:             'bloomberg.co.jp',
  newsweekjapan:           'newsweekjapan.jp',

  // フィットネス
  zwift:                   'zwift.com',
  whoop:                   'whoop.com',
  oura:                    'ouraring.com',
  yogastudioapp:           'yogastudioapp.com',
  noom:                    'noom.com',
  headspace:               'headspace.com',
  calm:                    'calm.com',
  leanbody:                'lean-body.jp',
  soelu:                   'soelu.com',

  // フードデリバリー / グルメ
  uberone:                 'uber.com',
  'wolt+':                 'wolt.com',
  'くっくぱっどぷれみあむ': 'cookpad.com',
  'たべろぐぷれみあむ':    'tabelog.com',
  'でまえかんだっしゅぱす': 'demae-can.com',

  // カーシェア / こどもサービス
  'たいむずかー':           'timescar.jp',
  'かれこ':                'careco.jp',
  'こどもちゃれんじ':      'shimajiro.co.jp',
  'らいんすたんぷぷれみあむ': 'store.line.me',

  // ニュース（追加）
  'よみうりしんぶんぷれみあむ': 'yomiuri.co.jp',
  'まいにちしんぶんでじたる':   'mainichi.jp',

  // セキュリティ / VPN
  nordvpn:                 'nordvpn.com',
  expressvpn:              'expressvpn.com',
  protonvpnplus:           'proton.me',
  surfshark:               'surfshark.com',
  norton360:               'norton.com',
  'うぃるすばすたーくらうど': 'trendmicro.co.jp',
  'かすぺるすきーぷれみあむ':  'kaspersky.co.jp',

  // AI（追加）
  cursorpro:               'cursor.com',

  // 電子書籍 / マンガ（追加）
  'こみっくしーもあよみほうだい': 'cmoa.jp',
  'らいんまんがよみほうだい':    'manga.line.me',
  'まんがおうこく':        'manga.k-manga.jp',
  'ぴっこまこうどくぷらん': 'piccoma.com',
  'book☆walkerぷれみあむ': 'bookwalker.jp',
  'こみっくでいず':        'comic-days.com',
  'やんじゃんよみほうだい': 'yanmaga.jp',
  'まんがみー':            'manga-mee.jp',
  'あめばまんがよみほうだい': 'ameba.jp',
  'れんたよみほうだい':    'renta.papy.co.jp',
  'auぶっくぱす':          'bookpass.auone.jp',
  'まんがばんぐよみほうだい': 'mangabang.jp',
  'こみっくうぉーかーよみほうだい': 'comic-walker.com',
  'ふらいやー':            'flierinc.com',
  'ぴくしぶぷれみあむ':    'pixiv.net',

  // 金融（追加）
  moneytree:               'moneytree.jp',
  revolut:                 'revolut.com',

  // セキュリティ（追加）
  eset:                    'eset.com',
  mcafeeplus:              'mcafee.com',
  keeper:                  'keepersecurity.com',
  malwarebytes:            'malwarebytes.com',

  // ソフトウェア / AI（追加）
  render:                  'render.com',
  deeplpro:                'deepl.com',
  setapp:                  'setapp.com',
  craftnotes:              'craft.do',
  dayone:                  'dayoneapp.com',
  readwisereader:          'readwise.io',
  feedlypro:               'feedly.com',
  atlassianjira:           'atlassian.net',
  clickupunlimited:        'clickup.com',
  mondaybasic:             'monday.com',
  airtableplus:            'airtable.com',
  cloudflarepro:           'cloudflare.com',
  vercelpro:               'vercel.com',
  gitlabpremium:           'gitlab.com',
  geminiadvanced:          'gemini.google.com',
  jasperai:                'jasper.ai',
  kagisearch:              'kagi.com',
  inoreader:               'inoreader.com',
  inoreaderpro:            'inoreader.com',
  cleanmymac:              'macpaw.com',
  cleanmymacplus:          'macpaw.com',
  omnifocus:               'omnigroup.com',
  microsoft365basic:       'microsoft.com',
  microsoftteams:          'microsoft.com',
  hubspot:                 'hubspot.com',
  hootsuitepro:            'hootsuite.com',
  mailchimp:               'mailchimp.com',
  miro:                    'miro.com',
  typeform:                'typeform.com',
  jetbrainstoolbox:        'jetbrains.com',
  sketch:                  'sketch.com',

  // クリエイター / 素材（追加）
  adobestock:              'adobe.com',
  pixtaunlimited:          'pixta.jp',
  shutterstock:            'shutterstock.com',
  epidemicsound:           'epidemicsound.com',
  envatoelements:          'elements.envato.com',
  freepikpremium:          'freepik.com',
  vimeopro:                'vimeo.com',
  descriptcreator:         'descript.com',
  capcutpro:               'capcut.com',
  artlist:                 'artlist.io',
  midjourney:              'midjourney.com',
  runwaystudio:            'runway.ml',
  elevenlabs:              'elevenlabs.io',
  adobefirefly:            'adobe.com',
  canvaproteams:           'canva.com',
  storyblocks:             'storyblocks.com',

  // ゲーム（追加）
  'paramount+':            'paramountplus.com',
  paramountplus:           'paramountplus.com',
  humblefinancial:         'humblebundle.com',
  dragonquestx:            'dqx.jp',
  wowsubscription:         'worldofwarcraft.com',

  // ──────────────────────────────────────────────────────────────────────────
  // 漢字/カタカナ表記エイリアス
  // normalizeServiceName(displayName) で生成されるキー。
  // Gmail登録や手動入力でサービス名が漢字/カタカナ混じりで登録された場合のロゴ対応。
  // ──────────────────────────────────────────────────────────────────────────

  // 動画配信
  'abemaプレミアム':           'abema.tv',
  'nhkオンデマンド':           'nhk-ondemand.jp',
  'fodプレミアム':             'fod.fujitv.co.jp',
  'wowowオンデマンド':         'wowow.co.jp',
  'dアニメストア':             'anime.dmkt-sp.jp',
  'dマガジン':                 'docomo.ne.jp',
  'バンダイチャンネル':        'b-ch.com',
  'スカパー！':                'skyperfectv.co.jp',
  'ニコニコプレミアム':        'nicovideo.jp',
  'ひかりtv':                  'hikaritv.net',
  dmmtv:                      'tv.dmm.com',
  '楽天tv':                    'tv.rakuten.co.jp',
  '日テレmydo!':               'ntv.co.jp',
  'パ・リーグtv':              'p-liga.jp',

  // 音楽
  '楽天ミュージック':          'music.rakuten.co.jp',
  'dヒッツ':                   'dhits.docomo.ne.jp',
  'radikoプレミアム':          'radiko.jp',

  // ニュース・雑誌
  '日本経済新聞（電子版）':    'nikkei.com',
  '朝日新聞デジタル':          'digital.asahi.com',
  '読売新聞プレミアム':        'yomiuri.co.jp',
  '毎日新聞デジタル':          'mainichi.jp',

  // 電子書籍 / マンガ
  '少年ジャンプ+':             'shonenjump.com',
  'book☆walkerプレミアム':    'bookwalker.jp',
  'コミックシーモア':          'cmoa.jp',
  'lineマンガ読み放題':        'manga.line.me',
  'まんが王国':                'manga.k-manga.jp',
  'ピッコマ':                  'piccoma.com',
  'コミックdays':              'comic-days.com',
  'ヤンジャン!読み放題':       'yanmaga.jp',
  'マンガmee':                 'manga-mee.jp',
  'amebaマンガ読み放題':       'ameba.jp',
  'renta!読み放題':            'renta.papy.co.jp',
  'auブックパス':              'bookpass.auone.jp',
  'マンガbang!読み放題':       'mangabang.jp',
  'コミックウォーカー読み放題': 'comic-walker.com',
  'flier（フライヤー）':       'flierinc.com',
  'pixivプレミアム':           'pixiv.net',

  // 学習
  'スタディサプリ':            'studysapuri.jp',
  '進研ゼミ':                  'benesse.ne.jp',
  'スマイルゼミ':              'smilezemi.jp',
  'ドットインストール':        'dotinstall.com',
  'dmm英会話':                 'eikaiwa.dmm.com',
  'globis学び放題':            'globis.jp',

  // ショッピング / キャリア
  '楽天プレミアム':            'rakuten.co.jp',
  'lypプレミアム':             'yahoo.co.jp',
  'auスマートパスプレミアム':  'au.com',

  // 金融
  'マネーフォワードmeプレミアム': 'moneyforward.com',

  // フードデリバリー / グルメ
  'クックパッドプレミアム':    'cookpad.com',
  '食べログプレミアム':        'tabelog.com',
  '出前館ダッシュパス':        'demae-can.com',

  // カーシェア
  'タイムズカー':              'timescar.jp',
  'カレコ':                    'careco.jp',

  // セキュリティ
  'ウイルスバスタークラウド':  'trendmicro.co.jp',
  'カスペルスキープレミアム':  'kaspersky.co.jp',

  // SNS / その他
  'lineスタンププレミアム':    'store.line.me',

  // ゲーム
  'ファイナルファンタジーxiv': 'finalfantasyxiv.com',
  'jスポーツオンデマンド':     'jsports.co.jp',

  // ──────────────────────────────────────────────────────────────────────────
  // 新規エントリ（辞書未登録サービス・プランから生成されるキー）
  // ──────────────────────────────────────────────────────────────────────────

  // Apple（プランから生成されるキー）
  applearcade:               'apple.com',
  'applefitness+':           'apple.com',
  applefitnessplus:          'apple.com',
  'appleoneファミリー':      'apple.com',

  // Microsoft
  microsoftcopilotpro:       'microsoft.com',

  // Amazon
  'amazonkids+':             'amazon.co.jp',

  // Duolingo
  duolingomax:               'duolingo.com',

  // ゲーム（プランから生成されるキー）
  xboxgamepasspc:            'xbox.com',
  eaplaypro:                 'ea.com',

  // ひらがな表記（gmailSenders.normalizedName → ロゴ補完）
  'しんけんぜみ':            'benesse.ne.jp',
  'ふぁいなるふぁんたじーじゅうよん': 'finalfantasyxiv.com',
  'じぇいすぽーつおんでまんど': 'jsports.co.jp',
  'radikoぷれみあむ':        'radiko.jp',
  'lypぷれみあむ':           'yahoo.co.jp',
  'auすまーとぱすぷれみあむ': 'au.com',
  'dまがじん':               'docomo.ne.jp',

  // 精度修正エイリアス（normalizedName修正後の正しいキー）
  readwise:                  'readwise.io',
  feedly:                    'feedly.com',
  atlassian:                 'atlassian.net',
  clickup:                   'clickup.com',
  'monday.com':              'monday.com',
  airtable:                  'airtable.com',
  hootsuite:                 'hootsuite.com',
  kagi:                      'kagi.com',
  jetbrains:                 'jetbrains.com',
  vercel:                    'vercel.com',
  gitlab:                    'gitlab.com',
  freepik:                   'freepik.com',
  descript:                  'descript.com',
  runway:                    'runway.ml',
  ouaring:                   'ouraring.com',
  'mcafee+':                 'mcafee.com',
  'audiobook.jp':            'audiobook.jp',

  // 精度修正後の追加キー
  ouraring:                  'ouraring.com',
  vimeo:                     'vimeo.com',
  epicgames:                 'epicgames.com',
  freee:                     'freee.co.jp',
  trello:                    'trello.com',
  linear:                    'linear.app',
  asana:                     'asana.com',
  zapier:                    'zapier.com',
  make:                      'make.com',

  // ──────────────────────────────────────────────────────────────────────────
  // 手入力・英語スペル表記揺れカバー
  // normalizeServiceName は小文字化＋スペース除去のみ（カタカナ→ひらがな変換なし）。
  // ユーザーが英語スペルやカタカナで手動登録した場合に対応する。
  // ──────────────────────────────────────────────────────────────────────────

  // 動画配信
  dmagazine:                 'docomo.ne.jp',
  danimesutoa:               'anime.dmkt-sp.jp',
  danimestore:               'anime.dmkt-sp.jp',
  abemapremium:              'abema.tv',
  nhkondemand:               'nhk-ondemand.jp',
  fodpremium:                'fod.fujitv.co.jp',
  wowowondemand:             'wowow.co.jp',
  bandaichannel:             'b-ch.com',
  skyperfectv:               'skyperfectv.co.jp',
  'スカパー':                'skyperfectv.co.jp',
  nicopremium:               'nicovideo.jp',
  videomarket:               'videomarket.jp',
  'ビデオマーケット':        'videomarket.jp',

  // 音楽
  radiko:                    'radiko.jp',
  'ラジコプレミアム':        'radiko.jp',
  linemusic2:                'music.line.me',
  'lineミュージック':        'music.line.me',
  dhitsu:                    'dhits.docomo.ne.jp',
  rakutenmusic:              'music.rakuten.co.jp',

  // カーシェア
  timescar:                  'timescar.jp',
  'タイムズカーシェア':      'timescar.jp',
  careco:                    'careco.jp',

  // 学習
  studysapuri:               'studysapuri.jp',
  studysapurienglish:        'eigosapuri.jp',
  'スタディサプリenglish':   'eigosapuri.jp',
  smilezemi:                 'smilezemi.jp',
  shinkenzeji:               'benesse.ne.jp',
  shimajiro:                 'shimajiro.co.jp',
  dotinstall:                'dotinstall.com',
  dmmeikaiwa:                'eikaiwa.dmm.com',
  glovismanabihodai:         'globis.jp',

  // ニュース
  nikkei:                    'nikkei.com',
  '日本経済新聞':            'nikkei.com',
  asahidigital:              'digital.asahi.com',
  yomiuri:                   'yomiuri.co.jp',
  '読売新聞':                'yomiuri.co.jp',
  mainichi:                  'mainichi.jp',
  newspicks2:                'newspicks.com',
  toyokeizai:                'toyokeizai.net',
  '東洋経済オンライン':      'toyokeizai.net',
  presidentonline:           'president.jp',
  'プレジデントオンライン':  'president.jp',
  diamondonline:             'diamond.jp',
  'ダイヤモンド・オンライン': 'diamond.jp',

  // 電子書籍・マンガ
  mangaone:                  'manga-one.jp',
  bookwalker:                'bookwalker.jp',
  cmoa:                      'cmoa.jp',
  mangakingdom:              'manga.k-manga.jp',
  piccoma2:                  'piccoma.com',
  comicdays:                 'comic-days.com',
  yanjyan:                   'yanmaga.jp',
  'ヤンジャン！':            'yanmaga.jp',
  linemangarentai:           'manga.line.me',
  ebookjapan2:               'ebookjapan.yahoo.co.jp',
  mangabang:                 'mangabang.jp',
  'マンガbang！':            'mangabang.jp',
  comicwalker:               'comic-walker.com',
  'コミックウォーカー':      'comic-walker.com',
  renta:                     'renta.papy.co.jp',
  'renta！':                 'renta.papy.co.jp',
  aubookpass:                'bookpass.auone.jp',
  flier2:                    'flierinc.com',
  pixivpremium:              'pixiv.net',

  // ショッピング
  rakutenpremium:            'rakuten.co.jp',
  rakutenmagazine:           'magazine.rakuten.co.jp',
  '楽天マガジン':            'magazine.rakuten.co.jp',
  lyppremium:                'yahoo.co.jp',
  ausmartpas:                'au.com',
  amazon3:                   'amazon.co.jp',

  // 金融
  moneyforward:              'moneyforward.com',
  'マネーフォワードme':      'moneyforward.com',
  moneytree2:                'moneytree.jp',

  // セキュリティ
  virusbuster:               'trendmicro.co.jp',
  'ウイルスバスター':        'trendmicro.co.jp',
  kasperskypremium:          'kaspersky.co.jp',
  'カスペルスキー':          'kaspersky.co.jp',

  // SNS
  linestamp:                 'store.line.me',
  'lineスタンプ':            'store.line.me',

  // ゲーム
  ffxiv:                     'finalfantasyxiv.com',
  'ff14':                    'finalfantasyxiv.com',
  'ファイナルファンタジー14': 'finalfantasyxiv.com',
  dragonquest:               'dqx.jp',
  'ドラゴンクエストx':       'dqx.jp',

  // フィットネス
  leanbody2:                 'lean-body.jp',
  soelu2:                    'soelu.com',

  // フードデリバリー
  ubereats:                  'uber.com',
  'ウーバーイーツ':          'uber.com',
  woltplus:                  'wolt.com',
  cookpad:                   'cookpad.com',
  'クックパッド':            'cookpad.com',
  tabelog:                   'tabelog.com',
  '食べログ':                'tabelog.com',

  // 新規サービス（第2弾）
  recmusic:                  'recochoku.jp',
  moraqualitas:              'mora.jp',
  'mora qualitas':           'mora.jp',
  gaorasports:               'gaora.co.jp',
  tsuburayaimagination:      'imagination.m-78.jp',
  anyca:                     'anyca.net',
  softbanksafe:              'softbank.jp',
  eightprofessional:         'eight.company',
  fincpremium:               'finc.com',
  cambly:                    'cambly.com',
  babbel:                    'babbel.com',
  skillshare:                'skillshare.com',
  masterclass:               'masterclass.com',
  brilliant:                 'brilliant.org',
  quizletplus:               'quizlet.com',
  codecademypro:             'codecademy.com',
  pluralsight:               'pluralsight.com',
  bear:                      'bear.app',
  fantastical:               'flexibits.com',
  nordpass:                  'nordpass.com',
  squarespace:               'squarespace.com',
  webflow:                   'webflow.com',
  pelotonapp:                'onepeloton.com',
  geforcenow:                'nvidia.com',
  'j:comオんでまんど':        'jcom.co.jp',

  // 新規サービス
  'jcomオンデマンド':         'jcom.co.jp',
  'ぷれじでんとおんらいん':   'president.jp',
  'だいやもんどおんらいん':   'diamond.jp',
  'とうようけいざいおんらいん': 'toyokeizai.net',
  fitbitpremium:             'fitbit.com',
  'fitbit premium':          'fitbit.com',
  myfitnesspal:              'myfitnesspal.com',
  courseraplus:              'coursera.org',
  'coursera plus':           'coursera.org',
  linkedinpremium:           'linkedin.com',
  'linkedin premium career': 'linkedin.com',
  'linkedin premium business': 'linkedin.com',
  bitwarden:                 'bitwarden.com',
  'bitwarden families':      'bitwarden.com',
  dashlane:                  'dashlane.com',
  todoist:                   'todoist.com',
  'todoist pro':             'todoist.com',
  plexpass:                  'plex.tv',
  'plex pass':               'plex.tv',
};

// ─────────────────────────────────────────────────────────────────────────────
// 辞書の domain フィールドから normalizedName → domain の補完マップを生成する。
// SERVICE_LOGO_DOMAINS にないキーを辞書エントリの domain で補完する。
// これにより、辞書に domain が設定されていれば SERVICE_LOGO_DOMAINS への手動追加が不要になる。
// ─────────────────────────────────────────────────────────────────────────────
import type { ServiceDictionaryEntry } from '@/src/types';
import serviceDictionary from '@/src/services/remoteConfig/fallback/service_dictionary.json';

const ENTRY_DOMAIN_MAP: Record<string, string> = Object.fromEntries(
  (serviceDictionary.entries as ServiceDictionaryEntry[])
    .filter((e) => e.domain && !e.defunct)
    .map((e) => [e.normalizedName, e.domain as string]),
);

/**
 * entry.name を normalizeServiceName と同じルール（小文字化＋スペース除去）で
 * 正規化したキー → domain のマップ。
 * subscriptionStore が normalizeServiceName(data.serviceName) で normalizedName を生成するため、
 * サービス辞書経由で登録した場合も entry.name ベースのキーで確実にヒットさせる。
 */
const ENTRY_NAME_MAP: Record<string, string> = Object.fromEntries(
  (serviceDictionary.entries as ServiceDictionaryEntry[])
    .filter((e) => e.domain && !e.defunct)
    .map((e) => [e.name.toLowerCase().replace(/\s+/g, ''), e.domain as string]),
);

/**
 * ファビコン URL を生成する。
 * Google S2 を優先する（PNG 64×64 を返すため信頼性が高く、日本ドメインにも対応）。
 * 取得できない場合は DuckDuckGo Favicon API にフォールバックする。
 */
export function buildFaviconUrl(domain: string): string {
  // Google S2 Favicon API（プライマリ）- PNG 64×64 を返す
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

/** DuckDuckGo をフォールバックとして返す（Google S2 で取得できなかった場合に使用） */
export function buildFaviconFallbackUrl(domain: string): string {
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

/**
 * normalizedName → ドメインを解決する。
 * 優先順:
 *   1. SERVICE_LOGO_DOMAINS（手動マッピング）—— 完全一致
 *   2. ENTRY_DOMAIN_MAP（辞書の normalizedName フィールド）—— 完全一致
 *   3. ENTRY_NAME_MAP（辞書の name を normalizeServiceName したキー）—— 完全一致
 *   4. SERVICE_LOGO_DOMAINS —— 最長プレフィックス一致
 *      "Render | The cloud for builders" → "render|thecloudforbuilders" が
 *      辞書の normalizedName "render" と完全一致しない場合のフォールバック。
 *      サービス名の後に「|」「-」などの区切り文字が続くケースに対応。
 */
function resolveDomain(normalizedName: string): string | null {
  if (!normalizedName) return null;
  // 完全一致
  const exact =
    SERVICE_LOGO_DOMAINS[normalizedName] ??
    ENTRY_DOMAIN_MAP[normalizedName] ??
    ENTRY_NAME_MAP[normalizedName] ??
    null;
  if (exact) return exact;
  // 最長プレフィックス一致（4文字以上のキーのみ対象、誤検知を最小化）
  // キーの直後の文字が英数字でないことを確認し、別サービスへの誤マッチを防ぐ。
  // 例: "render" キーが "renderforest" にマッチしないようにする。
  const prefixMatch = Object.entries(SERVICE_LOGO_DOMAINS)
    .filter(([key]) => {
      if (key.length < 4 || !normalizedName.startsWith(key)) return false;
      if (normalizedName.length === key.length) return true;
      const nextChar = normalizedName[key.length];
      return !/[a-z0-9]/.test(nextChar);
    })
    .sort(([a], [b]) => b.length - a.length)[0];
  if (prefixMatch) return prefixMatch[1];
  return null;
}

/**
 * normalizedName から Google S2 フォールバック URL を返す。
 * DuckDuckGo Favicon が読み込めなかった場合に img.onError / onLoad で使用する。
 */
export function getServiceLogoFallbackUrl(normalizedName: string): string | null {
  const domain = resolveDomain(normalizedName);
  if (!domain) return null;
  return buildFaviconFallbackUrl(domain);
}

/**
 * normalizedName からロゴ画像 URL を返す（DuckDuckGo 優先）。
 * 辞書 domain フィールドもフォールバックとして参照するため、
 * SERVICE_LOGO_DOMAINS への手動追加なしに辞書登録済みサービスのロゴが取得可能。
 *
 * @deprecated entryに domain フィールドが設定されている場合は getEntryLogoUrl を優先すること。
 */
export function getServiceLogoUrl(normalizedName: string): string | null {
  const domain = resolveDomain(normalizedName);
  if (!domain) return null;
  return buildFaviconUrl(domain);
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
  return buildFaviconUrl(domain);
}
