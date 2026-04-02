"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import ScrollProgress from "@/components/ScrollProgress";
import { ScrollReveal } from "@/components/ScrollReveal";
import { format } from "date-fns";
import { Calendar, User, Clock, ChevronDown, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import "plyr-react/plyr.css";

interface BlogPostClientProps {
  post: {
    title: string;
    content: string | null;
    excerpt: string | null;
    createdAt: Date;
    youtubeId?: string | null;
  };
  featuredImage: string | null;
  readTime: number;
}

export default function BlogPostClient({ post, featuredImage, readTime }: BlogPostClientProps) {
  const [activeId, setActiveId] = useState("");
  const [tocItems, setTocItems] = useState<{ id: string; text: string; level: number }[]>([]);
  const [tocOpen, setTocOpen] = useState(false);

  // Normalize markdown content
  const preprocessedContent = useMemo(() => {
    if (!post.content) return "";
    return post.content
      .replace(/\r\n/g, "\n")
      .replace(/<(p|div|span|strong)[^>]*>(#{1,4}\s+.*?)<\/\1>/gi, "$2\n\n")
      .replace(/<(p|div|span|strong)[^>]*>([-*]\s+.*?)<\/\1>/gi, "$2\n\n")
      .replace(/([^\n])\s*(#{2,4})/g, "$1\n\n$2")
      .replace(/([^\n])\s*([-*]\s)/g, "$1\n\n$2")
      .replace(/([^\n])\s*(```)/g, "$1\n\n$2")
      .replace(/\n{3,}/g, "\n\n");
  }, [post.content]);

  // Build TOC and observe headings
  useEffect(() => {
    const timer = setTimeout(() => {
      const headings = Array.from(
        document.querySelectorAll(".blog-content h2, .blog-content h3")
      ).filter((h) => !h.closest(".plyr") && !h.closest(".video-container"));

      setTocItems(
        headings.map((h, i) => {
          const id = h.id || `section-${i}`;
          if (!h.id) h.id = id;
          return { id, text: h.textContent || "", level: Number(h.tagName.charAt(1)) };
        })
      );

      const observer = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id); }),
        { rootMargin: "-10% 0px -70% 0px", threshold: 0.1 }
      );
      headings.forEach((h) => observer.observe(h));
      return () => observer.disconnect();
    }, 800);
    return () => clearTimeout(timer);
  }, [post.content]);

  // Initialize Plyr for video embeds
  useEffect(() => {
    import("plyr").then(({ default: Plyr }) => {
      document.querySelectorAll(".blog-content video, .plyr__video-embed").forEach((p) => {
        if (!p.hasAttribute("data-plyr-initialized")) {
          new Plyr(p as HTMLMediaElement, {
            ratio: "16:9",
            fullscreen: { enabled: true, fallback: true, iosNative: false },
            youtube: { noCookie: true, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 },
          });
          p.setAttribute("data-plyr-initialized", "true");
        }
      });
    });
  }, [post.content]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <ScrollProgress />

      {/* Hero */}
      <header className="relative w-full overflow-hidden bg-gray-900 dark:bg-gray-950">
        {/* Background image or gradient */}
        {featuredImage ? (
          <div className="absolute inset-0">
            <img
              src={featuredImage}
              alt=""
              className="w-full h-full object-cover opacity-25 dark:opacity-15 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/60 to-gray-900" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-gray-900 to-purple-950" />
        )}

        {/* Subtle glow accents */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 md:py-28 text-center">
          <ScrollReveal>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition text-xs font-bold uppercase tracking-[0.15em] mb-8 sm:mb-10"
            >
              <ArrowLeft size={14} />
              Back to Blog
            </Link>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6 sm:mb-8">
              {post.title}
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold uppercase tracking-widest text-gray-400">
              <span className="flex items-center gap-2">
                <Calendar size={13} className="text-indigo-400" />
                {format(new Date(post.createdAt), "MMMM d, yyyy")}
              </span>
              <span className="flex items-center gap-2">
                <Clock size={13} className="text-indigo-400" />
                {readTime} min read
              </span>
              <span className="flex items-center gap-2">
                <User size={13} className="text-indigo-400" />
                SmartLink Team
              </span>
            </div>
          </ScrollReveal>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

          {/* TOC sidebar — desktop only */}
          {tocItems.length > 0 && (
            <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0 sticky top-24">
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
                <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                  In this article
                </h4>
                <nav className="space-y-0.5">
                  {tocItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block text-sm py-1.5 px-2 rounded-lg transition-colors ${
                        activeId === item.id
                          ? "text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-900/30"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                      }`}
                      style={{ paddingLeft: `${(item.level - 2) * 0.75 + 0.5}rem` }}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* Article */}
          <article className="flex-1 min-w-0">

            {/* Mobile TOC — collapsible */}
            {tocItems.length > 0 && (
              <div className="lg:hidden mb-6 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setTocOpen(!tocOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <span>Table of Contents</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${tocOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {tocOpen && (
                  <nav className="px-4 py-3 space-y-1 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
                    {tocItems.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={() => setTocOpen(false)}
                        className={`block text-sm py-1.5 transition-colors ${
                          activeId === item.id
                            ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                        style={{ paddingLeft: `${(item.level - 2) * 0.75}rem` }}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                )}
              </div>
            )}

            {/* Excerpt / pull quote */}
            {post.excerpt && (
              <p className="text-base sm:text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-300 font-medium mb-8 sm:mb-10 pl-4 sm:pl-5 border-l-4 border-indigo-500 italic bg-indigo-50/50 dark:bg-indigo-900/10 py-4 pr-4 rounded-r-xl">
                {post.excerpt}
              </p>
            )}

            {/* YouTube embed */}
            {post.youtubeId && (
              <div
                className="my-8 sm:my-10 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800 plyr__video-embed"
                data-plyr-provider="youtube"
                data-plyr-embed-id={post.youtubeId}
              />
            )}

            {/* Article body */}
            <div
              className="blog-content prose dark:prose-invert prose-base sm:prose-lg max-w-none
                prose-headings:font-bold prose-headings:tracking-tight
                prose-headings:text-gray-900 dark:prose-headings:text-white
                prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed sm:prose-p:leading-[1.85]
                prose-li:text-gray-700 dark:prose-li:text-gray-300
                prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
                prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-indigo-500 prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
                prose-code:text-indigo-600 dark:prose-code:text-indigo-300 prose-code:bg-indigo-50 dark:prose-code:bg-indigo-900/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                prose-img:rounded-xl prose-img:shadow-lg prose-img:mx-auto"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSlug]}
              >
                {preprocessedContent}
              </ReactMarkdown>
            </div>

            {/* Footer */}
            <div className="mt-10 sm:mt-14 pt-8 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between flex-wrap gap-4">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition text-sm"
              >
                <ArrowLeft size={16} />
                Back to all articles
              </Link>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {format(new Date(post.createdAt), "MMMM d, yyyy")} · {readTime} min read
              </span>
            </div>
          </article>
        </div>
      </main>

      <style jsx global>{`
        .blog-content h2,
        .blog-content h3 {
          scroll-margin-top: 90px;
        }
        .plyr {
          border-radius: 12px !important;
          overflow: hidden !important;
        }
        .plyr__video-wrapper {
          aspect-ratio: 16/9 !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .plyr__video-embed {
          padding-bottom: 0 !important;
          aspect-ratio: 16/9 !important;
          width: 100% !important;
        }
        .plyr__video-embed iframe {
          height: 100% !important;
          width: 100% !important;
          top: 0 !important;
          left: 0 !important;
          position: absolute !important;
        }
        .plyr__controls {
          background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.7)) !important;
          padding: 24px 16px 16px !important;
        }
        img:not([src]),
        img[src=""] {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
