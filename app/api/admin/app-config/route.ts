import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { APP_CONFIG } from "@/lib/app-config";

/** GET /api/admin/app-config — returns all config keys with DB-or-default values */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const dbRows = await prisma.appConfig.findMany();
  const dbMap = Object.fromEntries(dbRows.map((r: { key: string; value: string }) => [r.key, r.value]));

  // Merge DB values over static defaults
  const config = {
    appName: dbMap["appName"] ?? APP_CONFIG.appName,
    appTagline: dbMap["appTagline"] ?? APP_CONFIG.appTagline,
    supportEmail: dbMap["supportEmail"] ?? APP_CONFIG.supportEmail,
    officeLocation: dbMap["officeLocation"] ?? APP_CONFIG.officeLocation,
    phone: dbMap["phone"] ?? APP_CONFIG.phone,
    playStoreUrl: dbMap["playStoreUrl"] ?? APP_CONFIG.playStoreUrl,
    appStoreUrl: dbMap["appStoreUrl"] ?? APP_CONFIG.appStoreUrl,
    apkDownloadUrl: dbMap["apkDownloadUrl"] ?? APP_CONFIG.apkDownloadUrl,
    appVersion: dbMap["appVersion"] ?? APP_CONFIG.appVersion,
    apkSize: dbMap["apkSize"] ?? APP_CONFIG.apkSize,
    twitterUrl: dbMap["twitterUrl"] ?? APP_CONFIG.twitterUrl,
    linkedinUrl: dbMap["linkedinUrl"] ?? APP_CONFIG.linkedinUrl,
    githubUrl: dbMap["githubUrl"] ?? APP_CONFIG.githubUrl,
  };
  return NextResponse.json({ config });
}

/** POST /api/admin/app-config  { updates: Record<string, string> } */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { updates } = await req.json() as { updates: Record<string, string> };
  if (!updates || typeof updates !== "object") {
    return NextResponse.json({ error: "updates object required" }, { status: 400 });
  }

  const allowed = [
    "appName", "appTagline", "supportEmail", "officeLocation", "phone",
    "playStoreUrl", "appStoreUrl", "apkDownloadUrl", "appVersion", "apkSize",
    "twitterUrl", "linkedinUrl", "githubUrl",
  ];

  const ops = Object.entries(updates)
    .filter(([key]) => allowed.includes(key))
    .map(([key, value]) =>
      prisma.appConfig.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    );

  await prisma.$transaction(ops);
  return NextResponse.json({ success: true, updated: ops.length });
}
