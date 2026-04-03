/**
 * Serves the IndexNow key file at /{INDEXNOW_KEY}.txt
 * Required by the IndexNow protocol for domain ownership verification.
 * Requests are rewritten here via next.config.mjs.
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.INDEXNOW_KEY;

  if (!key) {
    return new NextResponse("IndexNow key not configured", { status: 404 });
  }

  // The key file must contain exactly the key string
  return new NextResponse(key, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
