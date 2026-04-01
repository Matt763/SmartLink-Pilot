import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";



export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // Secure media uploads to admin only
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file specificed." }, { status: 400 });
    }

    // Convert file Blob to Buffer structure
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique secure filename retaining original extension
    const ext = path.extname(file.name);
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    
    // Server-side mapping to /public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    // Ensure the uploads directory exists before writing
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (e) {
      console.warn("Upload dir creation skipped or failed", e);
    }
    
    const filePath = path.join(uploadDir, uniqueFilename);

    // Commit file natively
    await fs.writeFile(filePath, buffer);

    // Return exact URI mapped from public folder
    const url = `/uploads/${uniqueFilename}`;

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("[MEDIA_UPLOAD_API]", error);
    return new NextResponse("Internal Failure processing media", { status: 500 });
  }
}
