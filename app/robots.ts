import { MetadataRoute } from "next";

const BASE = process.env.NEXTAUTH_URL || "https://www.smartlinkpilot.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/admin/", "/api/", "/protected/", "/preview/"],
      },
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
    ],
    // Both the sitemap index (typed sub-sitemaps) and the default Next.js sitemap
    sitemap: [
      `${BASE}/sitemap_index.xml`,
      `${BASE}/sitemap.xml`,
    ],
    host: BASE,
  };
}
