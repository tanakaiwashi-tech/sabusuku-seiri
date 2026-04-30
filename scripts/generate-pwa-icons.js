/**
 * PWAアイコン生成スクリプト
 * expo export 後に実行し、icon-192.png / icon-512.png を
 * assets/icon.png から強制的に再生成する。
 * Vercelのビルドキャッシュによるアイコン古残り問題を防ぐ。
 */
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const SRC  = path.join(ROOT, 'assets', 'icon.png');
const DIST = path.join(ROOT, 'dist');

async function run() {
  if (!fs.existsSync(SRC)) {
    console.error('generate-pwa-icons: assets/icon.png が見つかりません');
    process.exit(1);
  }

  const { generateImageAsync } = require('@expo/image-utils');

  const sizes = [
    { name: 'icon-192.png', width: 192, height: 192 },
    { name: 'icon-512.png', width: 512, height: 512 },
    { name: 'favicon.png',  width: 48,  height: 48  },
  ];

  for (const { name, width, height } of sizes) {
    const result = await generateImageAsync(
      { projectRoot: ROOT, cacheType: 'pwa-icon' },
      { src: SRC, width, height, resizeMode: 'contain', backgroundColor: 'transparent' }
    );
    const dest = path.join(DIST, name);
    fs.writeFileSync(dest, result.source);
    console.log(`generate-pwa-icons: ${name} (${width}x${height}) → dist/${name}`);
  }

  console.log('generate-pwa-icons: 完了');
}

run().catch(e => { console.error(e); process.exit(1); });
