import { prisma } from '@/lib/prisma'
import { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://smartlink-pilot.com'
  
  const routes = [
    '',
    '/features',
    '/pricing',
    '/about',
    '/team',
    '/contact',
    '/trust',
    '/download',
    '/privacy',
    '/terms',
    '/cookies',
    '/disclaimer',
    '/blog',
  ];

  // Fetch all published articles for SEO Indexing
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true }
  });

  const staticRoutes = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' as const : 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const blogRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogRoutes];
}
