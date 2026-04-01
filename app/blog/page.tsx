import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';
import { ArrowRight, Calendar, User, Clock } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { format } from "date-fns";

export const metadata = {
  title: "Blog — SmartLink Pilot Strategy & Tutorials",
  description: "Learn how to master URL shortening, click tracking, and marketing analytics with our comprehensive library of expert tutorials.",
};

export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  // Fetch published posts
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true, excerpt: true, createdAt: true, content: true },
    take: 100 // Scale limit for pagination. In prod -> implement infinite scroll
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans selection:bg-indigo-500/30">
      <main className="flex-grow pt-24 pb-20">
        
        {/* Luxury Hero Section */}
        <section className="relative px-6 py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/20 dark:to-gray-950">
            <div className="max-w-4xl mx-auto text-center relative z-10 selection:text-indigo-600">
                <ScrollReveal>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-semibold mb-6">
                        <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        The SmartLink Pilot Engineering Blog
                    </div>
                </ScrollReveal>
                <ScrollReveal delay={0.1}>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                        Insights. Tutorials. <br className="hidden md:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">Mastery.</span>
                    </h1>
                </ScrollReveal>
                <ScrollReveal delay={0.2}>
                    <p className="mt-6 text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
                        In-depth guides engineered to help you maximize your marketing infrastructure, routing, and click analytics organically.
                    </p>
                </ScrollReveal>
            </div>
            
            {/* Background elements */}
            <div className="absolute top-1/4 -right-64 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-50 mix-blend-multiply dark:mix-blend-lighten pointer-events-none"></div>
            <div className="absolute bottom-0 -left-64 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-50 mix-blend-multiply dark:mix-blend-lighten pointer-events-none"></div>
        </section>

        {/* Content Grid */}
        <section className="max-w-7xl mx-auto px-6 py-12">
            {posts.length === 0 ? (
                <div className="text-center py-24 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No transmissions logged</h3>
                    <p className="text-gray-500">The engineering team is currently transmitting new protocols. Check back soon.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12">
                    {posts.map((post, index) => {
                        // Calculate read time approx (200 words per minute)
                        const readTime = Math.max(1, Math.ceil((post.content?.split(' ').length || 0) / 200));

                        return (
                        <ScrollReveal key={post.id} delay={index * 0.1}>
                            <article className="group flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                                {/* Thumbnail Mockup - Since we didn't specify a thumbnail field, we generate a luxury gradient based on strings */}
                                <Link href={`/blog/${post.slug}`} className="block h-48 w-full bg-gradient-to-tr from-indigo-500 to-purple-600 relative overflow-hidden">
                                   <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
                                   <div className="absolute flex items-center justify-center inset-0 text-white/20 group-hover:scale-110 transition-transform duration-700">
                                        <div className="text-8xl font-black italic mix-blend-overlay break-all px-4 truncate tracking-tighter w-full h-full opacity-50 pointer-events-none whitespace-nowrap overflow-hidden">
                                            {post.title.substring(0, 10).toUpperCase()}
                                        </div>
                                   </div>
                                </Link>

                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-4">
                                        <span className="flex items-center gap-1"><Calendar size={14}/> {format(new Date(post.createdAt), "MMM d, yyyy")}</span>
                                        <span className="flex items-center gap-1"><Clock size={14}/> {readTime} min read</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        <Link href={`/blog/${post.slug}`} className="focus:outline-none">
                                            <span className="absolute inset-0" aria-hidden="true" />
                                            {post.title}
                                        </Link>
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-6 flex-grow">
                                        {post.excerpt}
                                    </p>
                                    <div className="mt-auto flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-300 font-medium">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">SL</div>
                                            SmartLink Team
                                        </div>
                                        <span className="text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                            <ArrowRight size={18}/>
                                        </span>
                                    </div>
                                </div>
                            </article>
                        </ScrollReveal>
                    )})}
                </div>
            )}
        </section>

      </main>
    </div>
  );
}
