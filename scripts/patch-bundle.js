/**
 * Zustand v5 の devtools middleware が import.meta.env を使用しているため、
 * Metro ビルド後のバンドルを process.env に置換するパッチスクリプト。
 *
 * 通常は babel.config.js のインラインプラグインが Babel コンパイル時に変換するため、
 * このスクリプトは 0 件を検出して正常終了する（フォールバック確認として維持）。
 * もし Babel の変換が漏れた場合は、このスクリプトがバンドル後に補完する。
 *
 * ⚠️  Zustand のバージョンを上げたとき、出力文字列が変わってパッチが
 *    当たらなくなる場合がある。そのときは TARGET_PATTERN を更新すること。
 *    パッチ後に import.meta.env が残存していればビルドを強制失敗させる
 *    （サイレント失敗でブラウザエラーのまま配信されるのを防ぐ）。
 */
const fs = require('fs');
const path = require('path');

// このパッチが動作確認済みの Zustand バージョン。
// Zustand を更新したときは必ずここも合わせて更新し、TARGET_PATTERN を再検証すること。
const TESTED_ZUSTAND_VERSION = '5.0.11';

// 実際にインストールされている Zustand のバージョンを確認し、差異があれば警告する。
try {
  const zustandPkg = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '..', 'node_modules', 'zustand', 'package.json'),
      'utf-8',
    ),
  );
  if (zustandPkg.version !== TESTED_ZUSTAND_VERSION) {
    console.warn(
      `\n⚠️  WARNING: patch-bundle.js は Zustand v${TESTED_ZUSTAND_VERSION} 用です。` +
      `\n   現在の Zustand: v${zustandPkg.version}` +
      '\n   TARGET_PATTERN が変わっている可能性があります。' +
      '\n   パッチ後に残存チェックが走るので、失敗した場合は TARGET_PATTERN を更新してください。\n',
    );
  }
} catch {
  console.warn('⚠️  Zustand のバージョン確認に失敗しました。node_modules が存在するか確認してください。');
}

const TARGET_PATTERN = 'import.meta.env?import.meta.env.MODE:void 0';
const REPLACEMENT    = '(process.env?process.env.NODE_ENV:void 0)';

const distDir = path.join(__dirname, '..', 'dist', '_expo', 'static', 'js', 'web');
const files = fs.readdirSync(distDir).filter(f => f.endsWith('.js'));

if (files.length === 0) {
  console.error('No bundle found in', distDir);
  process.exit(1);
}

let totalRemaining = 0;

for (const file of files) {
  const filePath = path.join(distDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  const before = (content.match(/import\.meta\.env/g) || []).length;

  if (before > 0) {
    // Babel プラグインが変換漏れした場合のフォールバックパッチ
    content = content.split(TARGET_PATTERN).join(REPLACEMENT);
    fs.writeFileSync(filePath, content, 'utf-8');
    const after = (content.match(/import\.meta\.env/g) || []).length;
    console.log(`Patched ${file}: import.meta.env ${before} -> ${after}`);

    // パッチ後も残存 → TARGET_PATTERN が古い可能性。ビルドを止める。
    if (after > 0) {
      console.error(
        `\nERROR: ${after} import.meta.env references remain in ${file} after patching.` +
        '\nZustand の出力が変わった可能性があります。' +
        '\nscripts/patch-bundle.js の TARGET_PATTERN を確認・更新してください。'
      );
      totalRemaining += after;
    }
  } else {
    // babel.config.js のプラグインが正常に変換済み（期待される正常ケース）
    console.log(`${file}: import.meta.env 0 件 (Babel プラグインで変換済み)`);
  }
}

if (totalRemaining > 0) {
  process.exit(1);
}

console.log('patch-bundle: done.');
