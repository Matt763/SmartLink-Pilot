import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 30;

// CEO email — always has admin access
const CEO_EMAIL = "mclean@smartlinkpilot.com";

export async function middleware(request: NextRequest) {
  const ip = request.ip || request.headers.get("x-forwarded-for") || "127.0.0.1";
  const path = request.nextUrl.pathname;

  // Rate limiting for API routes
  if (path.startsWith("/api/")) {
    const now = Date.now();
    const rlRecord = rateLimitMap.get(ip);

    if (!rlRecord || now - rlRecord.lastReset > RATE_LIMIT_WINDOW) {
      rateLimitMap.set(ip, { count: 1, lastReset: now });
    } else {
      if (rlRecord.count >= MAX_REQUESTS) {
        return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
      }
      rlRecord.count += 1;
    }
  }

  // Auth protection for dashboard
  if (path.startsWith("/dashboard")) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Admin route protection — only admin role or CEO email
  if (path.startsWith("/admin")) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }
    // Only allow admin role or CEO email
    if (token.role !== "admin" && token.email !== CEO_EMAIL) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|team/).*)',
  ],
};
