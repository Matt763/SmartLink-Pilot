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
    
    // Log the click
    await prisma.click.create({
      data: {
        urlId: urlRecord.id,
        country,
        device: userAgent.includes("Mobile") ? "Mobile" : "Desktop",
        browser: userAgent,
        referrer,
      },
    });

    // Fire push notification to the link owner (non-blocking)
    if (urlRecord.userId) {
      const clickCount = await prisma.click.count({ where: { urlId: urlRecord.id } });
      const device = userAgent.includes("Mobile") ? "Mobile" : "Desktop";
      const flag = country && country !== "Unknown" ? ` 🌍 ${country}` : "";
      fetch(`${process.env.NEXTAUTH_URL}/api/notifications/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-key": process.env.INTERNAL_API_KEY || "",
        },
        body: JSON.stringify({
          userId: urlRecord.userId,
          title: "🔗 Link Clicked!",
          body: `Your link /${shortCode} was clicked from ${device}${flag}. Total: ${clickCount} click${clickCount !== 1 ? "s" : ""}.`,
          data: { shortCode, clickCount: String(clickCount), country, device },
        }),
      }).catch(() => {}); // silently ignore if push fails
    }

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
