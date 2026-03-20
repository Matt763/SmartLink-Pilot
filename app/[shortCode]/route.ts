import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { shortCode: string } }
) {
  const { shortCode } = params;

  if (!shortCode) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const urlRecord = await prisma.url.findUnique({
      where: { shortCode },
    });

    if (!urlRecord) {
      return NextResponse.redirect(new URL("/404", req.url));
    }

    if (urlRecord.expiresAt && urlRecord.expiresAt < new Date()) {
      return NextResponse.redirect(new URL("/expired", req.url));
    }

    if (urlRecord.password) {
      // In a real app we redirect to a password form page before allowing redirect
      return NextResponse.redirect(new URL(`/protected/${shortCode}`, req.url));
    }

    const userAgent = req.headers.get("user-agent") || "Unknown";
    const referrer = req.headers.get("referer") || "Direct";
    const country = req.headers.get("x-vercel-ip-country") || "Unknown";
    
    // Asynchronously log the click
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

    return NextResponse.redirect(destination, 302);
  } catch (error) {
    console.error("Redirect Error:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}
