import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BlogPostClient from "@/components/BlogPostClient";

export const dynamic = "force-dynamic";

const DEFAULT_OG = "/og-image.png";
const BASE_URL = process.env.NEXTAUTH_URL || "https://www.smartlinkpilot.com";

function extractFirstImage(content: string): string | null {
  const mdMatch = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/.exec(content || "");
  if (mdMatch) return mdMatch[1];
  const htmlMatch = /<img[^>]+src=["'](https?:\/\/[^"']+)["']/.exec(content || "");
  if (htmlMatch) return htmlMatch[1];
  return null;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  if (!post) return { title: "Not Found" };

  const ogImage = (post as any).featuredImage || extractFirstImage(post.content || "") || DEFAULT_OG;
  const absoluteOg = ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`;
  const url = `${BASE_URL}/blog/${post.slug}`;

  return {
    title: `${post.title} — SmartLink Pilot`,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt,
      siteName: "SmartLink Pilot",
      images: [{ url: absoluteOg, width: 1200, height: 630, alt: post.title }],
      publishedTime: post.createdAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [absoluteOg],
      site: "@smartlinkpilot",
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug, published: true }
  });

  if (!post) notFound();

  const featuredImage = (post as any).featuredImage || extractFirstImage(post.content || "");

  // Read time approx (~200 WPM)
  const wordCount = post.content?.split(' ').length || 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <BlogPostClient 
        post={post} 
        featuredImage={featuredImage} 
        readTime={readTime} 
    />
  );
}
