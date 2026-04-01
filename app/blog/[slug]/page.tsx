import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BlogPostClient from "@/components/BlogPostClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  if (!post) return { title: "Not Found" };
  
  return {
    title: `${post.title} — SmartLink Pilot Strategy`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug, published: true }
  });

  if (!post) notFound();

  // Extract first image for Hero Feature (skipping branding elements)
  const extractFirstImage = (content: string) => {
    const mdRegex = /!\[.*?\]\((.*?)\)/g;
    const htmlRegex = /<img.*?src=["'](.*?)["']/g;
    
    let match;
    const images: string[] = [];

    while ((match = mdRegex.exec(content || "")) !== null) {
      if (!match[1].toLowerCase().includes('logo') && !match[1].toLowerCase().includes('icon')) {
        images.push(match[1]);
      }
    }
    
    while ((match = htmlRegex.exec(content || "")) !== null) {
       if (!match[1].toLowerCase().includes('logo') && !match[1].toLowerCase().includes('icon')) {
        images.push(match[1]);
      }
    }

    return images[0] || null;
  };

  const featuredImage = extractFirstImage(post.content || "");

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
