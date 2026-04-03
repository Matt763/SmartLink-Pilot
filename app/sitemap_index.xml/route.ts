import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.smartlinkpilot.com";
const PER_PAGE = 200;

async function latestUploadMtime(): Promise<string> {
  const dir = path.join(process.cwd(), "public", "uploads");
  try {
    const names = await fs.readdir(dir);
    let latest = new Date(0);
    for (const name of names) {
      const stat = await fs.stat(path.join(dir, name));
      if (stat.mtime > latest) latest = stat.mtime;
    }
    return latest.getTime() === 0 ? new Date().toISOString() : latest.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export async function GET() {
  // ── gather real lastmod timestamps per section ──────────────────────────────
  const [
    latestPost,
    latestPageContent,
    publishedPostsCount,
    ytPostCount,
    postsWithImages,
    uploadMtime,
  ] = await Promise.all([
    prisma.blogPost.findFirst({
      where: { published: true },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
    prisma.pageContent.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
    prisma.blogPost.count({ where: { published: true } }),
    prisma.blogPost.count({ where: { published: true, youtubeId: { not: null } } }),
    prisma.blogPost.count({ where: { published: true, featuredImage: { not: null } } }),
    latestUploadMtime(),
  ]);

  const postLm   = (latestPost?.updatedAt        ?? new Date()).toISOString();
  const pageLm   = (latestPageContent?.updatedAt ?? new Date("2024-06-01")).toISOString();
  const legalLm  = "2024-06-01T00:00:00.000Z";
  const postPages = Math.ceil(publishedPostsCount / PER_PAGE) || 1;

  const hasVideos = ytPostCount > 0;
  const hasImages = postsWithImages > 0;

  // ── build sitemap entries ───────────────────────────────────────────────────
  type SitemapEntry = { loc: string; lastmod: string };
  const sitemaps: SitemapEntry[] = [];

  // Post sitemaps (paginated)
  for (let i = 1; i <= postPages; i++) {
    sitemaps.push({ loc: `${SITE_URL}/post-sitemap${i}.xml`, lastmod: postLm });
  }

  // Static page sitemaps
  sitemaps.push({ loc: `${SITE_URL}/page-sitemap1.xml`,    lastmod: pageLm  });
  sitemaps.push({ loc: `${SITE_URL}/company-sitemap1.xml`, lastmod: pageLm  });
  sitemaps.push({ loc: `${SITE_URL}/legal-sitemap1.xml`,   lastmod: legalLm });

  // Media sitemaps — only include if there is real content
  if (hasImages) {
    sitemaps.push({ loc: `${SITE_URL}/image-sitemap1.xml`, lastmod: uploadMtime });
  }
  if (hasVideos) {
    sitemaps.push({ loc: `${SITE_URL}/video-sitemap1.xml`, lastmod: postLm });
  }

  // ── render XML ─────────────────────────────────────────────────────────────
  let inner = "";
  for (const { loc, lastmod } of sitemaps) {
    inner += `\n  <sitemap>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`;
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<?xml-stylesheet type="text/xsl" href="/main-sitemap.xsl"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    inner +
    `\n</sitemapindex>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
