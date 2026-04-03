import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a video buffer to Cloudinary with automatic quality + format optimisation.
 * Returns the secure HTTPS URL of the processed video.
 */
export async function uploadVideoToCloudinary(
  buffer: Buffer,
  originalFilename: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const publicId = `smartlink-pilot/videos/${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        public_id: publicId,
        // Auto-select best quality/format (H.264/H.265, VP9, AV1) per device
        eager: [{ quality: "auto", fetch_format: "auto" }],
        eager_async: false,
        // Strip metadata, normalise audio levels
        transformation: [{ quality: "auto:good", audio_codec: "aac" }],
        tags: ["smartlink-pilot"],
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Cloudinary upload failed"));
        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
}
