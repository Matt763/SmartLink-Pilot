import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pingSearchEngines } from "@/lib/sitemap-ping";

const SITE_URL = "https://www.smartlinkpilot.com";
// Map page keys → public URLs so IndexNow knows exactly which page changed
const PAGE_URL_MAP: Record<string, string> = {
  home: SITE_URL + "/",
  features: SITE_URL + "/features",
  pricing: SITE_URL + "/pricing",
  about: SITE_URL + "/about",
  team: SITE_URL + "/team",
  contact: SITE_URL + "/contact",
  download: SITE_URL + "/download",
};

/** GET /api/admin/content?page=about */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page");
  const where = page ? { page } : {};
  const entries = await prisma.pageContent.findMany({ where, orderBy: { page: "asc" } });
  return NextResponse.json({ entries });
}

/** POST /api/admin/content  { page, section, content } */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { page, section, content } = await req.json();
  if (!page || !section || content === undefined) {
    return NextResponse.json({ error: "page, section, and content are required" }, { status: 400 });
  }
  const entry = await prisma.pageContent.upsert({
    where: { page_section: { page, section } },
    update: { content },
    create: { page, section, content },
  });

  // Notify search engines of the specific page that changed
  const pageUrl = PAGE_URL_MAP[page];
  pingSearchEngines(pageUrl ? [pageUrl] : undefined);

  return NextResponse.json({ success: true, entry });
}

/** DELETE /api/admin/content  { page, section } */
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { page, section } = await req.json();
  await prisma.pageContent.deleteMany({ where: { page, section } });
  return NextResponse.json({ success: true });
}
