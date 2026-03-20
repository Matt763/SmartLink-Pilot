import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import crypto from "crypto";

// Fallback base62 generator inline since we might not have the full code handy
const characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
function generateShortCodeBase() {
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { originalUrl, customAlias, password, expiresAt } = body;

    if (!originalUrl) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    try {
      new URL(originalUrl.startsWith("http") ? originalUrl : `https://${originalUrl}`);
    } catch (_) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const spamDomains = ["malware.com", "phishing.net", "cheap-pills.biz"];
    if (spamDomains.some(domain => originalUrl.toLowerCase().includes(domain))) {
      return NextResponse.json({ error: "URL flagged as potentially malicious" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Cookie-based Device Tracking limits for unauthenticated users
    const cookieStore = cookies();
    let deviceId = cookieStore.get("device_id")?.value;
    
    if (!deviceId) {
      deviceId = crypto.randomUUID();
    }

    if (!userId) {
      const linksCount = await prisma.url.count({
        where: { deviceId }
      });
      
      if (linksCount >= 3) {
        return NextResponse.json({ 
          error: "Free trial limit reached. Sign up to continue generating trackable links.", 
          code: "LIMIT_REACHED" 
        }, { status: 429 });
      }
    }

    let shortCode = customAlias;

    if (customAlias) {
      if (!userId) {
        return NextResponse.json({ error: "Custom aliases require a premium account." }, { status: 403 });
      }
      const existing = await prisma.url.findUnique({ where: { shortCode: customAlias } });
      if (existing) {
        return NextResponse.json({ error: "Custom alias already in use" }, { status: 400 });
      }
    } else {
      shortCode = generateShortCodeBase();
      let isUnique = false;
      while (!isUnique) {
        const existing = await prisma.url.findUnique({ where: { shortCode } });
        if (!existing) isUnique = true;
        else shortCode = generateShortCodeBase();
      }
    }

    const newUrl = await prisma.url.create({
      data: {
        originalUrl: originalUrl.startsWith("http") ? originalUrl : `https://${originalUrl}`,
        shortCode,
        userId: userId || null,
        deviceId: userId ? null : deviceId,
        password: password || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    const response = NextResponse.json({ 
      shortUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/${shortCode}`,
      shortCode,
      originalUrl: newUrl.originalUrl
    }, { status: 201 });
    
    if (!userId) {
      response.cookies.set("device_id", deviceId, {
        maxAge: 60 * 60 * 24 * 365, // 1 year expiry
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
