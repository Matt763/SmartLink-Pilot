import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { shortCode, password } = await req.json();

    const urlRecord = await prisma.url.findUnique({
      where: { shortCode },
    });

    if (!urlRecord) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (urlRecord.password !== password) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    const userAgent = req.headers.get("user-agent") || "Unknown";
    const referrer = req.headers.get("referer") || "Direct";
    const country = req.headers.get("x-vercel-ip-country") || "Unknown";
    
    await prisma.click.create({
      data: {
        urlId: urlRecord.id,
        country,
        device: userAgent.includes("Mobile") ? "Mobile" : "Desktop",
        browser: userAgent,
        referrer,
      },
    });

    let destination = urlRecord.originalUrl;
    if (!destination.startsWith("http://") && !destination.startsWith("https://")) {
      destination = `https://${destination}`;
    }

    return NextResponse.json({ url: destination });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
