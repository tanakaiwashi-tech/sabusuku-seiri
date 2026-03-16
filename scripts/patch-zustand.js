/**
 * Zustand の devtools middleware に含まれる import.meta.env を
 * process.env へ置換するポストインストールパッチ。
 *
 * Metro は web ビルドで zustand/esm/middleware.mjs を使用するが、
 * このファイルに含まれる import.meta.env は非モジュールバンドルでは
 * SyntaxError になる。Babel コンフィグ経由では node_modules の ESM ファイルに
 * 届かないため、npm ci / npm install 後に直接ソースをパッチする。
 *
 * 対象: node_modules/zustand/esm/middleware.mjs
 * 変換: import.meta.env → process.env
 */
const fs = require('fs');
const path = require('path');

const TARGET_FILES = [
  path.join(__dirname, '..', 'node_modules', 'zustand', 'esm', 'middleware.mjs'),
];

const PATTERN     = /import\.meta\.env/g;
const REPLACEMENT = 'process.env';

let patchedCount = 0;

for (const filePath of TARGET_FILES) {
  if (!fs.existsSync(filePath)) {
    console.warn(`patch-zustand: not found: ${filePath} (スキップ)`);
    continue;
  }

  const original = fs.readFileSync(filePath, 'utf-8');
  const count = (original.match(PATTERN) || []).length;

  if (count === 0) {
    console.log(`patch-zustand: ${path.basename(filePath)} — 既にパッチ済み or 対象なし`);
    continue;
  }

  const patched = original.replace(PATTERN, REPLACEMENT);
  fs.writeFileSync(filePath, patched, 'utf-8');
  console.log(`patch-zustand: ${path.basename(filePath)} — import.meta.env ${count} 件を process.env に置換`);
  patchedCount += count;
}

if (patchedCount > 0) {
  console.log(`patch-zustand: 合計 ${patchedCount} 件パッチ完了`);
} else {
  console.log('patch-zustand: パッチ不要 (対象なし)');
}
