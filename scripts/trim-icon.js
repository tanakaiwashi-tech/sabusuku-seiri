/**
 * アイコントリミングスクリプト
 * 白背景の余白を自動検出してトリムし、
 * デザインを大きく見せるようにリサイズしてから保存する。
 */
const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

const SRC  = path.join(__dirname, '..', 'assets', 'icon.png');
const DEST = path.join(__dirname, '..', 'assets', 'icon.png');

// 余白を残す割合（0.01 = 1%の余白）
const PADDING_RATIO = 0.01;

async function run() {
  console.log('icon.png を読み込み中...');
  const img = await Jimp.read(SRC);
  const { width, height } = img.bitmap;
  console.log(`元サイズ: ${width}x${height}`);

  // 横長の場合は中央を正方形にクロップ
  let workImg = img;
  if (width !== height) {
    const sq = Math.min(width, height);
    const offX = Math.round((width - sq) / 2);
    const offY = Math.round((height - sq) / 2);
    workImg = img.clone().crop({ x: offX, y: offY, w: sq, h: sq });
    console.log(`正方形クロップ: ${sq}x${sq} (offset ${offX}, ${offY})`);
  }

  // コーナーから背景色をサンプリング（正方形クロップ後の画像を使用）
  const ww = workImg.bitmap.width;
  const wh = workImg.bitmap.height;
  function getPixel(image, x, y) {
    const idx = (y * image.bitmap.width + x) * 4;
    return [image.bitmap.data[idx], image.bitmap.data[idx+1], image.bitmap.data[idx+2]];
  }
  const corners = [
    getPixel(workImg, 5, 5),
    getPixel(workImg, ww-5, 5),
    getPixel(workImg, 5, wh-5),
    getPixel(workImg, ww-5, wh-5),
  ];
  const bgR = Math.round(corners.reduce((s,c) => s+c[0], 0) / 4);
  const bgG = Math.round(corners.reduce((s,c) => s+c[1], 0) / 4);
  const bgB = Math.round(corners.reduce((s,c) => s+c[2], 0) / 4);
  console.log(`背景色: rgb(${bgR}, ${bgG}, ${bgB})`);

  // 背景色から30以上離れているピクセルをコンテンツとみなす
  const DIFF_THRESHOLD = 30;
  let minX = ww, maxX = 0, minY = wh, maxY = 0;

  workImg.scan(0, 0, ww, wh, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const a = this.bitmap.data[idx + 3];
    const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
    if (a > 10 && diff > DIFF_THRESHOLD) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  });

  console.log(`コンテンツ範囲: x=${minX}-${maxX}, y=${minY}-${maxY}`);

  const contentW = maxX - minX;
  const contentH = maxY - minY;
  console.log(`コンテンツサイズ: ${contentW}x${contentH}`);

  // パディングを追加
  const padX = Math.round(ww * PADDING_RATIO);
  const padY = Math.round(wh * PADDING_RATIO);

  const cropX = Math.max(0, minX - padX);
  const cropY = Math.max(0, minY - padY);
  const cropW = Math.min(ww - cropX, contentW + padX * 2);
  const cropH = Math.min(wh - cropY, contentH + padY * 2);

  console.log(`クロップ: x=${cropX}, y=${cropY}, w=${cropW}, h=${cropH}`);

  // 正方形にするため大きい辺に合わせる
  const cropSize = Math.max(cropW, cropH);
  const offsetX  = cropX - Math.round((cropSize - cropW) / 2);
  const offsetY  = cropY - Math.round((cropSize - cropH) / 2);
  const safeOffX = Math.max(0, offsetX);
  const safeOffY = Math.max(0, offsetY);
  const safeSize = Math.min(cropSize, ww - safeOffX, wh - safeOffY);

  const cropped = workImg.clone().crop({
    x: safeOffX,
    y: safeOffY,
    w: safeSize,
    h: safeSize,
  });

  // 1024x1024にリサイズ
  const TARGET = 1024;
  cropped.resize({ w: TARGET, h: TARGET });

  await cropped.write(DEST);
  console.log(`保存完了: ${DEST} (${TARGET}x${TARGET})`);
}

run().catch(e => { console.error(e); process.exit(1); });
