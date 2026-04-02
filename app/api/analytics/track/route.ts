import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseUA(ua: string) {
  let device = "desktop";
  if (/Mobi|Android/i.test(ua) && !/iPad/i.test(ua)) device = "mobile";
  else if (/iPad|Tablet/i.test(ua)) device = "tablet";

  let browser = "Other";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR|Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome/i.test(ua)) browser = "Chrome";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Safari/i.test(ua)) browser = "Safari";

  let os = "Other";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  return { device, browser, os };
}

function parseSource(referrer: string): string {
  if (!referrer) return "Direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (/google\./i.test(host)) return "Google";
    if (/bing\./i.test(host)) return "Bing";
    if (/yahoo\./i.test(host)) return "Yahoo";
    if (/duckduckgo\./i.test(host)) return "DuckDuckGo";
    if (/facebook\.com|fb\.com/i.test(host)) return "Facebook";
    if (/instagram\.com/i.test(host)) return "Instagram";
    if (/twitter\.com|x\.com/i.test(host)) return "Twitter/X";
    if (/linkedin\.com/i.test(host)) return "LinkedIn";
    if (/youtube\.com/i.test(host)) return "YouTube";
    if (/whatsapp\.com/i.test(host)) return "WhatsApp";
    if (/t\.me|telegram\./i.test(host)) return "Telegram";
    if (/tiktok\.com/i.test(host)) return "TikTok";
    if (/reddit\.com/i.test(host)) return "Reddit";
    return host;
  } catch {
    return "Direct";
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { sessionId, path, referrer, userAgent, duration, type } = body as Record<string, any>;

    if (!sessionId || !path) return NextResponse.json({ ok: true });
    if (path.startsWith("/admin") || path.startsWith("/api")) return NextResponse.json({ ok: true });

    // Duration update only
    if (type === "duration" && duration > 0) {
      await prisma.$transaction([
        prisma.pageView.updateMany({ where: { sessionId, path }, data: { duration: { increment: Math.min(duration, 3600) } } }),
        prisma.visitorSession.updateMany({ where: { sessionId }, data: { duration: { increment: Math.min(duration, 3600) } } }),
      ]).catch(() => {});
      return NextResponse.json({ ok: true });
    }

    const country = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || null;
    const cityRaw = req.headers.get("x-vercel-ip-city") || null;
    const city = cityRaw ? decodeURIComponent(cityRaw).slice(0, 100) : null;
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim().slice(0, 45) || null;
    const ua = (userAgent || req.headers.get("user-agent") || "").slice(0, 512);
    const { device, browser, os } = parseUA(ua);
    const source = parseSource(referrer || "");
    const ref = referrer ? String(referrer).slice(0, 255) : null;

    await prisma.visitorSession.upsert({
      where: { sessionId },
      create: { sessionId, ip, country, city, device, browser, os, referrer: ref, source },
      update: { updatedAt: new Date() },
    });

    await prisma.pageView.create({ data: { sessionId, path: path.slice(0, 255) } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
