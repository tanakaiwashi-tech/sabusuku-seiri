/**
 * service_dictionary.json の officialCancelUrl が生きているかチェックするスクリプト。
 *
 * HEAD → 405 の場合は GET にフォールバックして再チェックする。
 * リダイレクト（301/302 等）は追跡して最終 URL まで確認する。
 *
 * 使い方:
 *   node scripts/check-cancel-urls.js            # 全件チェック
 *   node scripts/check-cancel-urls.js --fail-only # 問題のある URL のみ表示
 *   node scripts/check-cancel-urls.js --timeout 5000 # タイムアウト変更（ms）
 *
 * 出力例:
 *   ✅ netflix          200  https://www.netflix.com/cancelplan
 *   🔀 amazon           301  https://www.amazon.co.jp/... → https://...
 *   ❌ oldservice       404  https://oldservice.com/cancel
 *   ⏱️  timeout         ---  https://...
 */

'use strict';
const fs      = require('fs');
const path    = require('path');
const https   = require('https');
const http    = require('http');
const { URL } = require('url');

// ── オプション解析 ─────────────────────────────────────
const args         = process.argv.slice(2);
const FAIL_ONLY    = args.includes('--fail-only');
const TIMEOUT_IDX  = args.indexOf('--timeout');
const TIMEOUT_MS   = TIMEOUT_IDX !== -1 ? parseInt(args[TIMEOUT_IDX + 1], 10) : 8000;
const MAX_REDIRECT = 5;
const CONCURRENCY  = 6; // 同時リクエスト数

// ── 辞書読み込み ──────────────────────────────────────
const DICT_PATH = path.join(
  __dirname, '..', 'src', 'services', 'remoteConfig', 'fallback', 'service_dictionary.json',
);
const dict = JSON.parse(fs.readFileSync(DICT_PATH, 'utf-8'));

const targets = dict.entries
  .filter(e => e.officialCancelUrl)
  .map(e => ({ id: e.id, name: e.normalizedName, url: e.officialCancelUrl }));

// ── HTTP リクエスト（メソッド指定・リダイレクト追跡） ──
function httpRequest(urlStr, method, redirectCount = 0) {
  return new Promise((resolve) => {
    if (redirectCount > MAX_REDIRECT) {
      return resolve({ status: 'too-many-redirects', code: null, finalUrl: urlStr });
    }
    let parsed;
    try { parsed = new URL(urlStr); } catch {
      return resolve({ status: 'invalid-url', code: null, finalUrl: urlStr });
    }

    const lib = parsed.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; sabusuku-url-checker/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      timeout: TIMEOUT_MS,
    };

    const req = lib.request(options, (res) => {
      const code = res.statusCode;
      // リダイレクト追跡
      if ([301, 302, 303, 307, 308].includes(code) && res.headers.location) {
        const next = new URL(res.headers.location, urlStr).toString();
        httpRequest(next, method, redirectCount + 1).then(result => {
          resolve({ ...result, redirected: true, originalUrl: urlStr });
        });
      } else {
        resolve({ status: code >= 200 && code < 400 ? 'ok' : 'error', code, finalUrl: urlStr });
      }
      res.resume();
    });

    req.on('timeout', () => { req.destroy(); resolve({ status: 'timeout', code: null, finalUrl: urlStr }); });
    req.on('error', (e) => resolve({ status: 'network-error', code: null, finalUrl: urlStr, error: e.message }));
    req.end();
  });
}

// HEAD → 405 の場合は GET でリトライ
async function checkUrl(urlStr) {
  const headResult = await httpRequest(urlStr, 'HEAD');
  if (headResult.code === 405 || headResult.code === 400) {
    // HEAD を拒否するサイトは GET で再確認
    const getResult = await httpRequest(headResult.finalUrl ?? urlStr, 'GET');
    return { ...getResult, headFallback: true };
  }
  return headResult;
}

// ── 並列実行ヘルパー ──────────────────────────────────
async function runConcurrent(items, fn, concurrency) {
  const results = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

// ── メイン ────────────────────────────────────────────
(async () => {
  console.log(`\n🔍 officialCancelUrl チェック開始 (${targets.length}件, timeout=${TIMEOUT_MS}ms)\n`);

  const results = await runConcurrent(targets, async (target) => {
    const result = await checkUrl(target.url);
    return { ...target, ...result };
  }, CONCURRENCY);

  // ── 表示 ──────────────────────────────────────────
  const ok       = results.filter(r => r.status === 'ok' && !r.redirected);
  const redirect = results.filter(r => r.redirected && r.status === 'ok');
  const errors   = results.filter(r => r.status === 'error');
  const timeouts = results.filter(r => r.status === 'timeout');
  const netErrs  = results.filter(r => ['network-error', 'invalid-url', 'too-many-redirects'].includes(r.status));

  if (!FAIL_ONLY) {
    for (const r of ok) {
      const mark = r.headFallback ? '✅(GET)' : '✅';
      console.log(`${mark} ${r.name.padEnd(32)} ${r.code}  ${r.url}`);
    }
    for (const r of redirect) {
      console.log(`🔀 ${r.name.padEnd(32)} ${r.code}  ${r.originalUrl ?? r.url}`);
      console.log(`   ${''.padEnd(32)}      → ${r.finalUrl}`);
    }
  }

  for (const r of errors) {
    console.error(`❌ ${r.name.padEnd(32)} ${r.code}  ${r.url}`);
  }
  for (const r of timeouts) {
    console.warn(`⏱️  ${r.name.padEnd(32)} ---  ${r.url}`);
  }
  for (const r of netErrs) {
    console.error(`⚠️  ${r.name.padEnd(32)} ---  ${r.url}  (${r.error ?? r.status})`);
  }

  // ── サマリー ────────────────────────────────────
  const problemCount = errors.length + timeouts.length + netErrs.length;
  console.log(`\n📊 結果: 正常=${ok.length}件 / リダイレクト=${redirect.length}件 / エラー=${errors.length}件 / タイムアウト=${timeouts.length}件 / ネット障害=${netErrs.length}件`);

  if (redirect.length > 0) {
    console.log('💡 リダイレクト URL は officialCancelUrl を最終 URL に更新することを検討してください。');
  }
  if (problemCount === 0) {
    console.log('\n✅ すべての URL が正常です。');
  } else {
    console.log(`\n🔴 ${problemCount}件に問題があります。辞書の更新を検討してください。`);
  }

  process.exit(problemCount > 0 ? 1 : 0);
})();
