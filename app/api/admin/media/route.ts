import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import { compressImage, isImageMime, isVideoMime } from "@/lib/compress";
import { uploadVideoToCloudinary } from "@/lib/cloudinary";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB raw — sharp will shrink it
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file specified." }, { status: 400 });
    }

    const mimeType = file.type;

    // Server-side MIME type validation
    if (!isImageMime(mimeType) && !isVideoMime(mimeType)) {
      return NextResponse.json(
        { error: "Unsupported file type. Only images and videos are allowed." },
        { status: 415 }
      );
    }

    const isImage = isImageMime(mimeType);
    const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;

    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxBytes / 1024 / 1024} MB.` },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const originalBytes = buffer.length;

    // ── Images: compress with sharp → WebP, store locally ──────────────────
    if (isImage) {
      const result = await compressImage(buffer);
      const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${result.ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");

      try { await fs.mkdir(uploadDir, { recursive: true }); } catch {}

      await fs.writeFile(path.join(uploadDir, uniqueFilename), result.buffer);

      const savedKB = Math.round((originalBytes - result.buffer.length) / 1024);
      console.log(
        `[MEDIA_UPLOAD] Image: ${(originalBytes / 1024).toFixed(1)} KB → ${(result.buffer.length / 1024).toFixed(1)} KB`
      );

      return NextResponse.json({ url: `/uploads/${uniqueFilename}`, savedKB, type: "image" });
    }

    // ── Videos: upload to Cloudinary for cloud transcoding ─────────────────
    const cloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (!cloudinaryConfigured) {
      // Fallback: store locally if Cloudinary is not configured
      const ext = path.extname(file.name);
      const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");

      try { await fs.mkdir(uploadDir, { recursive: true }); } catch {}

      await fs.writeFile(path.join(uploadDir, uniqueFilename), buffer);
      console.warn("[MEDIA_UPLOAD] Cloudinary not configured — video stored locally.");

      return NextResponse.json({ url: `/uploads/${uniqueFilename}`, savedKB: 0, type: "video" });
    }

    console.log(`[MEDIA_UPLOAD] Uploading video (${(originalBytes / 1024 / 1024).toFixed(1)} MB) to Cloudinary…`);
    const videoUrl = await uploadVideoToCloudinary(buffer, file.name);
    console.log(`[MEDIA_UPLOAD] Video ready: ${videoUrl}`);

    return NextResponse.json({ url: videoUrl, savedKB: 0, type: "video" });
  } catch (error: any) {
    console.error("[MEDIA_UPLOAD_API]", error);
    return new NextResponse("Internal failure processing media", { status: 500 });
  }
}
