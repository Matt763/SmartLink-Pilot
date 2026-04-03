import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** POST /api/user/avatar  — save chosen avatar URL to user.image */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { avatarUrl } = await req.json();
  if (!avatarUrl || typeof avatarUrl !== "string") {
    return NextResponse.json({ error: "avatarUrl is required" }, { status: 400 });
  }

  // Only allow our own hosted avatars or valid https URLs
  const isOwn = avatarUrl.startsWith("/avatars/");
  const isHttps = avatarUrl.startsWith("https://");
  if (!isOwn && !isHttps) {
    return NextResponse.json({ error: "Invalid avatar URL" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: avatarUrl },
  });

  return NextResponse.json({ ok: true, image: avatarUrl });
}
