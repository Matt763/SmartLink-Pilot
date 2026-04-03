import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import { compressImage, isImageMime, isVideoMime } from "@/lib/compress";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB raw — sharp will shrink it down
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
    let buffer = Buffer.from(bytes);

    let ext = path.extname(file.name);
    const originalBytes = buffer.length;

    // Compress images server-side with sharp → WebP
    if (isImage) {
      const result = await compressImage(buffer);
      buffer = result.buffer;
      ext = result.ext;
      console.log(
        `[MEDIA_UPLOAD] Image compressed: ${(originalBytes / 1024).toFixed(1)} KB → ${(buffer.length / 1024).toFixed(1)} KB`
      );
    }

    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (e) {
      console.warn("Upload dir creation skipped or failed", e);
    }

    const filePath = path.join(uploadDir, uniqueFilename);
    await fs.writeFile(filePath, buffer);

    const url = `/uploads/${uniqueFilename}`;
    const savedKB = isImage
      ? Math.round((originalBytes - buffer.length) / 1024)
      : 0;

    return NextResponse.json({ url, savedKB });
  } catch (error: any) {
    console.error("[MEDIA_UPLOAD_API]", error);
    return new NextResponse("Internal failure processing media", { status: 500 });
  }
}
