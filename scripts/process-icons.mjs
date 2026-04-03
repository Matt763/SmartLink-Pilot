/**
 * process-icons.mjs
 * Generates all icon sizes needed for web (PWA, favicon), iOS (apple-touch-icon),
 * and Android (mipmap densities) from a single source PNG.
 *
 * Usage: node scripts/process-icons.mjs
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ANDROID_RES = join(ROOT, 'android', 'app', 'src', 'main', 'res');
const SOURCE = 'C:/Users/mattm/Downloads/SmartLink Logo.png';

const input = readFileSync(SOURCE);

// Brand background colour used for the Android launcher icon background layer
const BRAND_BG = '#3730a3'; // indigo-700 — matches ic_launcher_background in colors.xml

async function resize(size, options = {}) {
  return sharp(input)
    .resize(size, size, { fit: 'cover', ...options })
    .png()
    .toBuffer();
}

/**
 * Produces a square icon with the brand background colour and the logo
 * centred at `logoFraction` of the canvas size (default 0.75 = 75%).
 * Used for ic_launcher.png (legacy Android launcher, no adaptive masking).
 */
async function resizeWithBg(canvasSize, logoFraction = 0.75) {
  const logoSize = Math.round(canvasSize * logoFraction);
  const offset   = Math.round((canvasSize - logoSize) / 2);

  const logoBuf = await sharp(input)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r:0, g:0, b:0, alpha:0 } })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width:      canvasSize,
      height:     canvasSize,
      channels:   4,
      background: BRAND_BG,
    },
  })
    .composite([{ input: logoBuf, left: offset, top: offset }])
    .png()
    .toBuffer();
}

/**
 * Produces a circular icon with brand background.
 * Used for ic_launcher_round.png.
 */
async function resizeCircleWithBg(canvasSize, logoFraction = 0.75) {
  const logoSize = Math.round(canvasSize * logoFraction);
  const offset   = Math.round((canvasSize - logoSize) / 2);

  const logoBuf = await sharp(input)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r:0, g:0, b:0, alpha:0 } })
    .png()
    .toBuffer();

  // Circular mask
  const circle = Buffer.from(
    `<svg width="${canvasSize}" height="${canvasSize}">` +
    `<circle cx="${canvasSize/2}" cy="${canvasSize/2}" r="${canvasSize/2}"/>` +
    `</svg>`
  );

  return sharp({
    create: {
      width:      canvasSize,
      height:     canvasSize,
      channels:   4,
      background: BRAND_BG,
    },
  })
    .composite([
      { input: logoBuf, left: offset, top: offset },
      { input: circle, blend: 'dest-in' },
    ])
    .png()
    .toBuffer();
}

/**
 * Adaptive icon foreground layer.
 *
 * Android adaptive icon spec:
 *   - Full canvas:   108 dp × 108 dp
 *   - Safe zone:      72 dp × 72 dp  (66.7 % of canvas — content here is NEVER clipped)
 *   - Bleed zone:     18 dp on each side  (may be clipped by OEM mask)
 *
 * We scale the logo to 60 % of the canvas so it sits well within the safe
 * zone on every OEM shape (circle, squircle, rounded-square, etc.).
 * The canvas is transparent so the background colour layer shows through.
 */
async function resizeForeground(canvasSize) {
  const LOGO_FRACTION = 0.60;                              // 60 % of canvas
  const logoSize = Math.round(canvasSize * LOGO_FRACTION);
  const offset   = Math.round((canvasSize - logoSize) / 2);

  const logoBuf = await sharp(input)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r:0, g:0, b:0, alpha:0 } })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width:    canvasSize,
      height:   canvasSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }, // transparent canvas
    },
  })
    .composite([{ input: logoBuf, left: offset, top: offset }])
    .png()
    .toBuffer();
}

async function resizeCircle(size) {
  const circle = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`
  );
  return sharp(input)
    .resize(size, size, { fit: 'cover' })
    .composite([{ input: circle, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

function createIco(pngBuffer) {
  // Single-image ICO container wrapping a PNG (supported by all modern browsers)
  const HEADER_SIZE = 6;
  const ENTRY_SIZE = 16;
  const dataOffset = HEADER_SIZE + ENTRY_SIZE;

  const header = Buffer.alloc(HEADER_SIZE);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = ICO
  header.writeUInt16LE(1, 4); // count: 1 image

  const entry = Buffer.alloc(ENTRY_SIZE);
  entry.writeUInt8(32, 0);                          // width
  entry.writeUInt8(32, 1);                          // height
  entry.writeUInt8(0, 2);                           // colorCount
  entry.writeUInt8(0, 3);                           // reserved
  entry.writeUInt16LE(1, 4);                        // planes
  entry.writeUInt16LE(32, 6);                       // bitCount
  entry.writeUInt32LE(pngBuffer.length, 8);         // bytesInRes
  entry.writeUInt32LE(dataOffset, 12);              // imageOffset

  return Buffer.concat([header, entry, pngBuffer]);
}

async function save(buffer, ...pathSegments) {
  const outputPath = join(...pathSegments);
  writeFileSync(outputPath, buffer);
  console.log(`✓  ${outputPath.replace(ROOT, '').replace(/\\/g, '/')}`);
}

async function main() {
  console.log('Processing SmartLink Pilot icons...\n');

  // ── Web / PWA icons ───────────────────────────────────────────────────────
  await save(await resize(16),  ROOT, 'public', 'favicon-16x16.png');
  await save(await resize(32),  ROOT, 'public', 'favicon-32x32.png');
  await save(await resize(180), ROOT, 'public', 'apple-touch-icon.png');
  await save(await resize(192), ROOT, 'public', 'icon-192.png');
  await save(await resize(512), ROOT, 'public', 'icon-512.png');

  // ── Next.js App Router icons (/app) ──────────────────────────────────────
  await save(await resize(512), ROOT, 'app', 'icon.png');
  await save(await resize(180), ROOT, 'app', 'apple-icon.png');

  // favicon.ico — ICO container with 32×32 PNG inside
  const png32 = await resize(32);
  await save(createIco(png32),  ROOT, 'app', 'favicon.ico');

  // ── Android mipmap icons ──────────────────────────────────────────────────
  // ic_launcher / ic_launcher_round: standard launcher sizes per density
  // ic_launcher_foreground: adaptive-icon foreground canvas (108dp base × density multiplier)
  //   mdpi=108, hdpi=162, xhdpi=216, xxhdpi=324, xxxhdpi=432
  const densities = [
    { dir: 'mipmap-mdpi',    size: 48,  fgSize: 108 },
    { dir: 'mipmap-hdpi',    size: 72,  fgSize: 162 },
    { dir: 'mipmap-xhdpi',   size: 96,  fgSize: 216 },
    { dir: 'mipmap-xxhdpi',  size: 144, fgSize: 324 },
    { dir: 'mipmap-xxxhdpi', size: 192, fgSize: 432 },
  ];

  for (const { dir, size, fgSize } of densities) {
    // ic_launcher.png — legacy launcher (Android < 8):
    //   brand-colour background + logo centred at 75 % of canvas
    const square = await resizeWithBg(size, 0.75);

    // ic_launcher_round.png — round launcher variant:
    //   same content clipped to a circle
    const circle = await resizeCircleWithBg(size, 0.75);

    // ic_launcher_foreground.png — adaptive icon foreground layer:
    //   transparent canvas, logo at 60 % (safe zone = 72/108 dp ≈ 66.7 %)
    const fg = await resizeForeground(fgSize);

    await save(square, ANDROID_RES, dir, 'ic_launcher.png');
    await save(circle, ANDROID_RES, dir, 'ic_launcher_round.png');
    await save(fg,     ANDROID_RES, dir, 'ic_launcher_foreground.png');
  }

  console.log('\nAll icons generated successfully.');
}

main().catch(err => { console.error(err); process.exit(1); });
