/**
 * gmailSenders.ts と service_dictionary.json の整合性チェックスクリプト。
 *
 * チェック内容:
 *   1. gmailSenders の normalizedName が辞書に存在しない（辞書追加が必要）
 *   2. gmailSenders の normalizedName が辞書に存在するが domain 未設定
 *   3. 辞書エントリのうち domain 未設定のもの一覧（serviceLogos.ts で補完できるか確認用）
 *
 * 使い方: node scripts/sync-check.js
 */

'use strict';
const fs   = require('fs');
const path = require('path');

// ── パス定義 ──────────────────────────────────────────
const ROOT = path.join(__dirname, '..');
const DICT_PATH    = path.join(ROOT, 'src', 'services', 'remoteConfig', 'fallback', 'service_dictionary.json');
const SENDERS_PATH = path.join(ROOT, 'src', 'constants', 'gmailSenders.ts');

// ── 辞書読み込み ──────────────────────────────────────
const dict    = JSON.parse(fs.readFileSync(DICT_PATH, 'utf-8'));
const entries = dict.entries;

/** normalizedName → entry のマップ */
const dictMap = new Map(entries.map(e => [e.normalizedName, e]));

// ── gmailSenders.ts から normalizedName を抽出 ──────────
const sendersTs = fs.readFileSync(SENDERS_PATH, 'utf-8');
// normalizedName: 'xxx' または normalizedName: "xxx" の形式を抽出
const senderNames = [...sendersTs.matchAll(/normalizedName:\s*['"]([^'"]+)['"]/g)]
  .map(m => m[1]);

// ── チェック実行 ──────────────────────────────────────
const missingInDict   = [];  // senders にあるが辞書に無い
const missingDomain   = [];  // 辞書に存在するが domain 未設定
const dictNoDomain    = [];  // 辞書全体で domain 未設定のエントリ

for (const name of senderNames) {
  const entry = dictMap.get(name);
  if (!entry) {
    missingInDict.push(name);
  } else if (!entry.domain) {
    missingDomain.push(name);
  }
}

for (const entry of entries) {
  if (!entry.domain) {
    dictNoDomain.push(entry.normalizedName);
  }
}

// ── 結果表示 ──────────────────────────────────────────
let hasIssue = false;

if (missingInDict.length > 0) {
  hasIssue = true;
  console.error('\n🔴 gmailSenders に存在するが service_dictionary に未登録:');
  missingInDict.forEach(n => console.error(`  - ${n}`));
}

if (missingDomain.length > 0) {
  hasIssue = true;
  console.warn('\n🟡 gmailSenders の normalizedName が辞書にあるが domain 未設定:');
  missingDomain.forEach(n => console.warn(`  - ${n}`));
  console.warn('  → node scripts/add-domains-to-dictionary.js で一括補完できる場合があります。');
}

if (dictNoDomain.length > 0) {
  console.log(`\n🔵 辞書エントリのうち domain 未設定: ${dictNoDomain.length} 件`);
  if (process.argv.includes('--verbose')) {
    dictNoDomain.forEach(n => console.log(`  - ${n}`));
  } else {
    console.log('  → --verbose オプションで全件表示できます。');
  }
}

const total = senderNames.length;
const ok    = total - missingInDict.length - missingDomain.length;
console.log(`\n📊 gmailSenders: ${total} 件中 ${ok} 件が辞書と整合 (未登録=${missingInDict.length}, domain未設定=${missingDomain.length})`);
console.log(`📚 辞書エントリ数: ${entries.length} 件 (domain設定済み=${entries.length - dictNoDomain.length}, 未設定=${dictNoDomain.length})`);

if (!hasIssue) {
  console.log('\n✅ 問題なし');
}

process.exit(hasIssue ? 1 : 0);
