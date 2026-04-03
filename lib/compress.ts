import sharp from "sharp";

const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/tiff"]);
const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm", "video/ogg", "video/quicktime"]);

export function isImageMime(mimeType: string) {
  return IMAGE_MIME_TYPES.has(mimeType);
}

export function isVideoMime(mimeType: string) {
  return VIDEO_MIME_TYPES.has(mimeType);
}

/**
 * Compresses an image buffer using sharp.
 * - Converts to WebP for maximum compression at maintained perceptual quality.
 * - Resizes to max 1920px on longest edge (no upscaling).
 * Returns the compressed buffer and new file extension.
 */
export async function compressImage(
  buffer: Buffer
): Promise<{ buffer: Buffer; ext: string; mimeType: string }> {
  const pipeline = sharp(buffer).resize(1920, 1920, {
    fit: "inside",
    withoutEnlargement: true,
  });

  const compressed = await pipeline
    .webp({ quality: 82, effort: 4, smartSubsample: true })
    .toBuffer();

  return { buffer: compressed, ext: ".webp", mimeType: "image/webp" };
}
