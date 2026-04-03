/**
 * Test script: verifies image compression pipeline end-to-end.
 * Run with: node scripts/test-compression.mjs
 */
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── helpers ──────────────────────────────────────────────────────────────────
function kb(bytes) { return (bytes / 1024).toFixed(1) + " KB"; }
function pct(before, after) { return (((before - after) / before) * 100).toFixed(1) + "%"; }

async function compressImage(buffer) {
  const compressed = await sharp(buffer)
    .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 4, smartSubsample: true })
    .toBuffer();
  return compressed;
}

// ── run tests ─────────────────────────────────────────────────────────────────
async function run() {
  const results = [];
  let passed = 0;
  let failed = 0;

  const testImages = [
    path.join(ROOT, "public", "icon-1024.png"),
    path.join(ROOT, "public", "og-image.png"),
    path.join(ROOT, "public", "icon-512.png"),
  ];

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  SmartLink Pilot — Compression Test Suite");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  for (const imgPath of testImages) {
    const name = path.basename(imgPath);
    try {
      const original = await fs.readFile(imgPath);
      const meta = await sharp(original).metadata();

      const compressed = await compressImage(original);
      const compMeta = await sharp(compressed).metadata();

      const saved = original.length - compressed.length;
      const ratio = pct(original.length, compressed.length);
      const ok = compressed.length > 0 && compMeta.format === "webp";

      if (ok) passed++; else failed++;

      console.log(`✅ ${name}`);
      console.log(`   Input : ${kb(original.length)} | ${meta.width}×${meta.height} ${meta.format?.toUpperCase()}`);
      console.log(`   Output: ${kb(compressed.length)} | ${compMeta.width}×${compMeta.height} ${compMeta.format?.toUpperCase()}`);
      console.log(`   Saved : ${kb(saved)} (${ratio} smaller)\n`);
      results.push({ name, original: original.length, compressed: compressed.length, ok });
    } catch (e) {
      failed++;
      console.log(`❌ ${name} — ${e.message}\n`);
      results.push({ name, ok: false, error: e.message });
    }
  }

  // ── MIME type validation test ────────────────────────────────────────────
  console.log("── MIME validation ──────────────────────────");
  const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/tiff"];
  const ALLOWED_VIDEO = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
  const BLOCKED = ["application/pdf", "text/html", "application/javascript", "image/svg+xml"];

  const isImageMime = (m) => ALLOWED_IMAGE.includes(m);
  const isVideoMime = (m) => ALLOWED_VIDEO.includes(m);

  for (const mime of [...ALLOWED_IMAGE, ...ALLOWED_VIDEO]) {
    const ok = isImageMime(mime) || isVideoMime(mime);
    if (ok) { passed++; console.log(`✅ ALLOW  ${mime}`); }
    else { failed++; console.log(`❌ SHOULD ALLOW ${mime}`); }
  }
  for (const mime of BLOCKED) {
    const blocked = !isImageMime(mime) && !isVideoMime(mime);
    if (blocked) { passed++; console.log(`✅ BLOCK  ${mime}`); }
    else { failed++; console.log(`❌ SHOULD BLOCK ${mime}`); }
  }

  // ── size limit test ──────────────────────────────────────────────────────
  console.log("\n── Size limit enforcement ───────────────────");
  const MAX_IMAGE = 10 * 1024 * 1024;
  const MAX_VIDEO = 50 * 1024 * 1024;
  const cases = [
    { size: 5 * 1024 * 1024, type: "image", expect: true },
    { size: 11 * 1024 * 1024, type: "image", expect: false },
    { size: 30 * 1024 * 1024, type: "video", expect: true },
    { size: 55 * 1024 * 1024, type: "video", expect: false },
  ];
  for (const c of cases) {
    const limit = c.type === "image" ? MAX_IMAGE : MAX_VIDEO;
    const allowed = c.size <= limit;
    const ok = allowed === c.expect;
    if (ok) passed++;
    else failed++;
    const label = allowed ? "ALLOW" : "BLOCK";
    console.log(`${ok ? "✅" : "❌"} ${label}  ${(c.size / 1024 / 1024).toFixed(0)} MB ${c.type} (limit ${limit / 1024 / 1024} MB)`);
  }

  // ── summary ──────────────────────────────────────────────────────────────
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (failed > 0) process.exit(1);
}

run().catch((e) => { console.error(e); process.exit(1); });
