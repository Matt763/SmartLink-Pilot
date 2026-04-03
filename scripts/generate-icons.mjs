import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SOURCE = "C:/Users/mattm/Downloads/SmartLink Logo.png";
const RES_DIR = path.join(ROOT, "android/app/src/main/res");

const DENSITIES = [
  { name: "mipmap-mdpi",    launcher: 48,  foreground: 108 },
  { name: "mipmap-hdpi",    launcher: 72,  foreground: 162 },
  { name: "mipmap-xhdpi",   launcher: 96,  foreground: 216 },
  { name: "mipmap-xxhdpi",  launcher: 144, foreground: 324 },
  { name: "mipmap-xxxhdpi", launcher: 192, foreground: 432 },
];

async function generate() {
  // Check source image dimensions
  const meta = await sharp(SOURCE).metadata();
  console.log(`Source: ${meta.width}x${meta.height} (${meta.format})`);

  // Save 1024x1024 master icon in public/
  await sharp(SOURCE)
    .resize(1024, 1024, { kernel: sharp.kernel.lanczos3, fit: "fill" })
    .png()
    .toFile(path.join(ROOT, "public", "icon-1024.png"));
  console.log("Saved public/icon-1024.png (1024x1024)");

  for (const d of DENSITIES) {
    const dir = path.join(RES_DIR, d.name);

    // Regular square launcher icon
    await sharp(SOURCE)
      .resize(d.launcher, d.launcher, { kernel: sharp.kernel.lanczos3 })
      .png()
      .toFile(path.join(dir, "ic_launcher.png"));

    // Round launcher icon (same source — Android clips it to a circle)
    await sharp(SOURCE)
      .resize(d.launcher, d.launcher, { kernel: sharp.kernel.lanczos3 })
      .png()
      .toFile(path.join(dir, "ic_launcher_round.png"));

    // Adaptive icon foreground — logo fills full foreground area
    await sharp(SOURCE)
      .resize(d.foreground, d.foreground, { kernel: sharp.kernel.lanczos3 })
      .png()
      .toFile(path.join(dir, "ic_launcher_foreground.png"));

    // Adaptive icon background — solid indigo (#4338ca) matching the gradient start
    await sharp({
      create: {
        width: d.foreground,
        height: d.foreground,
        channels: 4,
        background: { r: 67, g: 56, b: 202, alpha: 255 },
      },
    })
      .png()
      .toFile(path.join(dir, "ic_launcher_background.png"));

    console.log(`Generated ${d.name} (launcher: ${d.launcher}px, foreground: ${d.foreground}px)`);
  }

  console.log("\nAll icons generated successfully.");
}

generate().catch((e) => { console.error(e); process.exit(1); });
