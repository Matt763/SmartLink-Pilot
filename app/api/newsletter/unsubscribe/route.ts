import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/newsletter/unsubscribe?token=xxx
// Linked from every newsletter email footer
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Invalid unsubscribe link." }, { status: 400 });
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { token } });

    if (!subscriber) {
      return NextResponse.json({ error: "Unsubscribe link not found." }, { status: 404 });
    }

    if (!subscriber.subscribed) {
      // Already unsubscribed — return friendly HTML page
      return new Response(unsubscribedPage("You were already unsubscribed."), {
        headers: { "Content-Type": "text/html" },
      });
    }

    await prisma.newsletterSubscriber.update({
      where: { token },
      data: { subscribed: false },
    });

    return new Response(unsubscribedPage("You have been successfully unsubscribed."), {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    console.error("[Newsletter] Unsubscribe error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

function unsubscribedPage(message: string): string {
  const siteUrl = process.env.NEXTAUTH_URL || "https://www.smartlinkpilot.com";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Unsubscribed — SmartLink Pilot</title>
  <style>
    body{margin:0;background:#06091a;font-family:'Segoe UI',Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;}
    .card{background:#0d1230;border:1px solid #1e2d5a;border-radius:24px;padding:48px;max-width:480px;text-align:center;}
    .icon{font-size:48px;margin-bottom:16px;}
    h1{color:#f8fafc;font-size:24px;margin:0 0 12px;}
    p{color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 24px;}
    a{display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">&#x2714;&#xFE0F;</div>
    <h1>${message}</h1>
    <p>You will no longer receive newsletter emails from SmartLink Pilot. You can re-subscribe at any time from our website.</p>
    <a href="${siteUrl}">Go to SmartLink Pilot</a>
  </div>
</body>
</html>`;
}
