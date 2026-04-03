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

async function resize(size, options = {}) {
  return sharp(input)
    .resize(size, size, { fit: 'cover', ...options })
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
    const square = await resize(size);
    const circle = await resizeCircle(size);

    // Foreground: fill the full adaptive canvas so the logo gradient covers the
    // shape mask edge-to-edge — no dark background bleed-through at corners.
    const fg = await sharp(input)
      .resize(fgSize, fgSize, { fit: 'cover' })
      .png()
      .toBuffer();

    await save(square, ANDROID_RES, dir, 'ic_launcher.png');
    await save(circle, ANDROID_RES, dir, 'ic_launcher_round.png');
    await save(fg,     ANDROID_RES, dir, 'ic_launcher_foreground.png');
  }

  console.log('\nAll icons generated successfully.');
}

main().catch(err => { console.error(err); process.exit(1); });
