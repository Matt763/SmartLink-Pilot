import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.smartlinkpilot.com";
const PER_PAGE = 200;
const IMAGE_EXTS = new Set([".webp", ".jpg", ".jpeg", ".png", ".gif", ".avif"]);
const VIDEO_EXTS = new Set([".mp4", ".webm"]);

// ── helpers ──────────────────────────────────────────────────────────────────

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string, extra = "") {
  return `\n  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>${extra}\n  </url>`;
}

function xmlDoc(urlset: string) {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<?xml-stylesheet type="text/xsl" href="/main-sitemap.xsl"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
    `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n` +
    `        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n` +
    urlset +
    `\n</urlset>`
  );
}

async function scanUploads() {
  const dir = path.join(process.cwd(), "public", "uploads");
  try {
    const names = await fs.readdir(dir);
    const files: { name: string; mtime: Date; isImage: boolean; isVideo: boolean }[] = [];
    for (const name of names) {
      const ext = path.extname(name).toLowerCase();
      const isImage = IMAGE_EXTS.has(ext);
      const isVideo = VIDEO_EXTS.has(ext);
      if (!isImage && !isVideo) continue;
      const stat = await fs.stat(path.join(dir, name));
      files.push({ name, mtime: stat.mtime, isImage, isVideo });
    }
    return files;
  } catch {
    return [];
  }
}

// ── main route ───────────────────────────────────────────────────────────────

export async function GET(_req: Request, { params }: { params: { sitemap: string } }) {
  const match = params.sitemap.match(/^([a-z]+)-sitemap(\d+)?\.xml$/i);
  if (!match) return new NextResponse("Not Found", { status: 404 });

  const type = match[1].toLowerCase();
  const page = match[2] ? parseInt(match[2], 10) : 1;
  const skip = (page - 1) * PER_PAGE;
  let urls = "";

  // ── page sitemap ────────────────────────────────────────────────────────────
  if (type === "page") {
    const latest = await prisma.pageContent.findFirst({
      where: { page: { in: ["home", "features", "pricing", "download"] } },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    });
    const lm = (latest?.updatedAt ?? new Date("2024-06-01")).toISOString();
    const staticPages = [
      { p: "/",         cf: "weekly",  pr: "1.0"  },
      { p: "/features", cf: "monthly", pr: "0.9"  },
      { p: "/pricing",  cf: "monthly", pr: "0.9"  },
      { p: "/blog",     cf: "weekly",  pr: "0.85" },
      { p: "/download", cf: "monthly", pr: "0.8"  },
    ];
    for (const { p, cf, pr } of staticPages) {
      urls += urlEntry(`${SITE_URL}${p}`, lm, cf, pr);
    }
  }

  // ── legal sitemap ───────────────────────────────────────────────────────────
  else if (type === "legal") {
    const lm = "2024-06-01T00:00:00.000Z";
    for (const p of ["/privacy", "/terms", "/cookies", "/disclaimer"]) {
      urls += urlEntry(`${SITE_URL}${p}`, lm, "yearly", "0.3");
    }
  }

  // ── company sitemap ─────────────────────────────────────────────────────────
  else if (type === "company") {
    const latest = await prisma.pageContent.findFirst({
      where: { page: { in: ["about", "contact", "team"] } },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    });
    const lm = (latest?.updatedAt ?? new Date("2024-06-01")).toISOString();
    for (const p of ["/about", "/contact", "/team"]) {
      urls += urlEntry(`${SITE_URL}${p}`, lm, "monthly", "0.6");
    }
  }

  // ── post sitemap ────────────────────────────────────────────────────────────
  else if (type === "post") {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true, featuredImage: true, title: true },
      orderBy: { updatedAt: "desc" },
      skip,
      take: PER_PAGE,
    });

    for (const post of posts) {
      let imgXml = "";
      if (post.featuredImage) {
        const imgLoc = post.featuredImage.startsWith("http")
          ? post.featuredImage
          : `${SITE_URL}${post.featuredImage}`;
        imgXml =
          `\n    <image:image>` +
          `\n      <image:loc>${imgLoc}</image:loc>` +
          `\n      <image:title>${esc(post.title)}</image:title>` +
          `\n    </image:image>`;
      }
      urls += urlEntry(
        `${SITE_URL}/blog/${post.slug}`,
        post.updatedAt.toISOString(),
        "monthly",
        "0.75",
        imgXml
      );
    }
  }

  // ── image sitemap — real files from /uploads/ + blog featured images ────────
  else if (type === "image") {
    const uploads = await scanUploads();
    const imageFiles = uploads.filter((f) => f.isImage).slice(skip, skip + PER_PAGE);

    for (const file of imageFiles) {
      const imgUrl = `${SITE_URL}/uploads/${file.name}`;
      const imgXml =
        `\n    <image:image>` +
        `\n      <image:loc>${imgUrl}</image:loc>` +
        `\n      <image:title>${esc(path.basename(file.name, path.extname(file.name)))}</image:title>` +
        `\n    </image:image>`;
      urls += urlEntry(imgUrl, file.mtime.toISOString(), "yearly", "0.4", imgXml);
    }

    // Blog post pages that have a featured image
    const posts = await prisma.blogPost.findMany({
      where: { published: true, featuredImage: { not: null } },
      select: { slug: true, updatedAt: true, featuredImage: true, title: true },
      skip,
      take: PER_PAGE,
    });
    for (const post of posts) {
      if (!post.featuredImage) continue;
      const imgLoc = post.featuredImage.startsWith("http")
        ? post.featuredImage
        : `${SITE_URL}${post.featuredImage}`;
      const imgXml =
        `\n    <image:image>` +
        `\n      <image:loc>${imgLoc}</image:loc>` +
        `\n      <image:title>${esc(post.title)}</image:title>` +
        `\n    </image:image>`;
      urls += urlEntry(
        `${SITE_URL}/blog/${post.slug}`,
        post.updatedAt.toISOString(),
        "monthly",
        "0.6",
        imgXml
      );
    }
  }

  // ── video sitemap — YouTube embeds + uploaded videos ───────────────────────
  else if (type === "video") {
    // Blog posts with YouTube IDs
    const ytPosts = await prisma.blogPost.findMany({
      where: { published: true, youtubeId: { not: null } },
      select: { slug: true, updatedAt: true, title: true, excerpt: true, youtubeId: true, featuredImage: true },
      skip,
      take: PER_PAGE,
    });

    for (const post of ytPosts) {
      const thumb = post.featuredImage
        ? (post.featuredImage.startsWith("http") ? post.featuredImage : `${SITE_URL}${post.featuredImage}`)
        : `https://img.youtube.com/vi/${post.youtubeId}/maxresdefault.jpg`;

      const videoXml =
        `\n    <video:video>` +
        `\n      <video:thumbnail_loc>${thumb}</video:thumbnail_loc>` +
        `\n      <video:title>${esc(post.title)}</video:title>` +
        `\n      <video:description>${esc(post.excerpt ?? "")}</video:description>` +
        `\n      <video:player_loc>https://www.youtube.com/embed/${post.youtubeId}</video:player_loc>` +
        `\n    </video:video>`;

      urls += urlEntry(
        `${SITE_URL}/blog/${post.slug}`,
        post.updatedAt.toISOString(),
        "monthly",
        "0.7",
        videoXml
      );
    }

    // Uploaded video files in /uploads/
    const uploads = await scanUploads();
    const videoFiles = uploads.filter((f) => f.isVideo).slice(skip, skip + PER_PAGE);

    for (const file of videoFiles) {
      const videoUrl = `${SITE_URL}/uploads/${file.name}`;
      const videoXml =
        `\n    <video:video>` +
        `\n      <video:thumbnail_loc>${SITE_URL}/icon-512.png</video:thumbnail_loc>` +
        `\n      <video:title>${esc(path.basename(file.name, path.extname(file.name)))}</video:title>` +
        `\n      <video:description>Media uploaded to SmartLink Pilot</video:description>` +
        `\n      <video:player_loc>${videoUrl}</video:player_loc>` +
        `\n    </video:video>`;
      urls += urlEntry(videoUrl, file.mtime.toISOString(), "yearly", "0.4", videoXml);
    }
  }

  if (!urls) return new NextResponse("Not Found", { status: 404 });

  return new NextResponse(xmlDoc(urls), {
    status: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      // 1 hour cache, but allow stale for up to 24 hours while revalidating
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
