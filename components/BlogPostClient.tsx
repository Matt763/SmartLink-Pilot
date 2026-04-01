"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import ScrollProgress from "@/components/ScrollProgress";
import { ScrollReveal } from "@/components/ScrollReveal";
import { format } from "date-fns";
import { Calendar, User, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import "plyr-react/plyr.css";
import InfinityMesh from "@/components/InfinityMesh";

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
  const [isMounted, setIsMounted] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [tocItems, setTocItems] = useState<{id: string, text: string, level: number}[]>([]);

  // 1. Markdown-Normalizer: Ensure structural elements have dual-newlines
  const preprocessedContent = useMemo(() => {
    if (!post.content) return "";
    
    return post.content
      // Normalize existing line breaks
      .replace(/\r\n/g, "\n")
      // STRIP HTML WRAPPERS: Remove <p>, <div>, etc. if they contain a Markdown marker
      .replace(/<(p|div|span|strong)[^>]*>(#{1,4}\s+.*?)<\/\1>/gi, '$2\n\n')
      .replace(/<(p|div|span|strong)[^>]*>([-*]\s+.*?)<\/\1>/gi, '$2\n\n')
      // Ensure headers (##, ###) ALWAYS have dual newlines before them
      .replace(/([^\n])\s*(#{2,4})/g, '$1\n\n$2')
      // Ensure list items ALWAYS have dual newlines before them if they follow text
      .replace(/([^\n])\s*([-*]\s)/g, '$1\n\n$2')
      // Ensure code blocks are isolated
      .replace(/([^\n])\s*(```)/g, '$1\n\n$2')
      // Deduplicate excessive newlines
      .replace(/\n{3,}/g, '\n\n');
  }, [post.content]);

  useEffect(() => { setIsMounted(true); }, []);

  // 1. Definitively Sync Table of Contents
  useEffect(() => {
    if (!isMounted) return;
    const timer = setTimeout(() => {
        // Filter out headings that belong to the video player or other UI elements
        const headings = Array.from(document.querySelectorAll('.blog-content h2, .blog-content h3'))
            .filter(h => !h.closest('.plyr') && !h.closest('.video-container'));

        setTocItems(headings.map((h, i) => {
            const id = h.id || `section-intelligence-${i}`;
            if (!h.id) h.id = id;
            return { 
                id, 
                text: h.textContent || "", 
                level: Number(h.tagName.charAt(1)) 
            };
        }));
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        setActiveId(e.target.id);
                    }
                });
            },
            { rootMargin: "-10% 0px -70% 0px", threshold: 0.1 }
        );
        headings.forEach(h => observer.observe(h));
        return () => observer.disconnect();
    }, 1500); // Wait slightly longer for ReactMarkdown + Plyr initialization
    return () => clearTimeout(timer);
  }, [isMounted, post.content]);

  // 2. Media Player Integration
  useEffect(() => {
    if (!isMounted) return;
    import("plyr").then(({ default: Plyr }) => {
        document.querySelectorAll('.blog-content video, .blog-content iframe, .plyr__video-embed').forEach(p => {
            if (!p.hasAttribute('data-plyr-initialized')) {
                new Plyr(p as HTMLMediaElement, {
                    ratio: '16:9',
                    fullscreen: { enabled: true, fallback: true, iosNative: false },
                    youtube: { noCookie: true, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 }
                });
                p.setAttribute('data-plyr-initialized', 'true');
            }
        });
    });
  }, [isMounted, post.content]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] font-sans selection:bg-indigo-500/30 overflow-x-hidden transition-colors duration-500">
      <ScrollProgress />
      <main className="relative">
        {/* Cinema Hero */}
        <div className="relative w-full min-h-[85vh] flex flex-col items-center justify-center text-white py-32 overflow-hidden border-b border-gray-200 dark:border-white/5 bg-gray-900 dark:bg-transparent">
            <div className="absolute top-0 right-0 w-[80vw] h-[80vw] glow-indigo rounded-full -translate-y-1/2 translate-x-1/4 opacity-30 blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] glow-purple rounded-full translate-y-1/3 -translate-x-1/4 opacity-20 blur-[100px]"></div>
            {featuredImage && (
                <div className="absolute inset-0 z-0">
                    <img src={featuredImage} alt="" className="w-full h-full object-cover opacity-20 dark:opacity-10 blur-sm scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/40 to-white dark:to-[#050505]"></div>
                </div>
            )}
            <div className="w-full max-w-7xl mx-auto px-12 relative z-10 text-center flex flex-col items-center">
                <ScrollReveal>
                    <Link href="/blog" className="inline-flex items-center gap-3 text-indigo-400 hover:text-indigo-300 transition-all text-[10px] font-black uppercase tracking-[0.4em] mb-16 group">
                        <div className="w-12 h-px bg-indigo-500/30 group-hover:w-16 transition-all"></div> Intelligence Archive
                    </Link>
                </ScrollReveal>
                <ScrollReveal delay={0.1}>
                    <h1 className="w-full text-5xl md:text-7xl lg:text-[7.5rem] font-black tracking-tighter leading-[0.85] mb-20 dark:text-white text-white drop-shadow-2xl">{post.title}</h1>
                </ScrollReveal>
                <ScrollReveal delay={0.2}>
                    <div className="flex flex-wrap items-center justify-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                        <span className="flex items-center gap-3"><Calendar size={14} className="text-indigo-500"/> {format(new Date(post.createdAt), "MMMM d, yyyy")}</span>
                        <span className="flex items-center gap-3"><Clock size={14} className="text-indigo-500"/> {readTime} min sync</span>
                        <span className="flex items-center gap-3"><User size={14} className="text-indigo-500"/> Engineering Core</span>
                    </div>
                </ScrollReveal>
            </div>
        </div>

        {/* Infinity Mesh Transition */}
        <InfinityMesh />

        {/* Reading Dossier (Full-Width Expansion) */}
        <div className="max-w-[1920px] mx-auto px-12 py-32 relative">
            <div className="flex flex-col xl:flex-row items-start justify-start gap-16 relative min-h-screen">
                
                {/* 1. Intelligence Index (TOC) */}
                <aside className="hidden xl:block w-[400px] sticky top-32">
                    {tocItems.length > 0 && (
                        <div className="relative group p-10 bg-white/50 dark:bg-black/20 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 rounded-[3rem] shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-indigo-500/10">
                            <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div> Intelligence Index
                            </h4>
                            <nav className="space-y-6 relative z-10">
                                {tocItems.map((item) => (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className={`group/link flex items-start gap-4 text-sm transition-all duration-300 relative ${
                                            activeId === item.id
                                            ? "text-gray-950 dark:text-white font-bold opacity-100"
                                            : "text-gray-500 opacity-60 hover:text-gray-900"
                                        }`}
                                        style={{ paddingLeft: `${(item.level - 2) * 1.5}rem` }}
                                    >
                                        {activeId === item.id && (
                                            <div className="absolute left-[-1.5rem] top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.6)] animate-in fade-in zoom-in duration-500"></div>
                                        )}
                                        <span className="leading-relaxed">{item.text}</span>
                                    </a>
                                ))}
                            </nav>
                        </div>
                    )}
                </aside>

                {/* 2. Core Article (Full-Width Protocol) */}
                <article className="flex-1 max-w-none relative">
                    
                    <div className="relative z-10 bg-white/40 dark:bg-black/30 backdrop-blur-3xl rounded-[3rem] md:rounded-[5rem] p-12 md:p-24 shadow-[0_100px_150px_-50px_rgba(0,0,0,0.12)] dark:shadow-[0_100px_150px_-50px_rgba(0,0,0,0.5)] border border-gray-200/50 dark:border-white/5 overflow-hidden ring-1 ring-white/5">
                        <ScrollReveal>
                            <p className="text-2xl md:text-3xl leading-relaxed text-gray-800 dark:text-gray-400 font-semibold mb-32 italic border-l-[10px] border-indigo-600 pl-16 bg-indigo-600/5 py-14 rounded-r-[4rem] shadow-xl border border-indigo-500/5 antialiased">
                                {post.excerpt}
                            </p>
                        </ScrollReveal>

                        {post.youtubeId && (
                            <div 
                                className="my-32 plyr__video-embed rounded-[2.5rem] overflow-hidden shadow-[0_80px_160px_-40px_rgba(99,102,241,0.5)] border border-white/5"
                                data-plyr-provider="youtube" 
                                data-plyr-embed-id={post.youtubeId}
                            ></div>
                        )}

                        <div className="blog-content w-full prose dark:prose-invert prose-lg md:prose-xl max-w-none 
                            prose-headings:text-gray-950 dark:prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight
                            prose-h2:text-4xl md:prose-h2:text-5xl prose-h2:mt-24 prose-h2:mb-10
                            prose-h3:text-2xl md:prose-h3:text-3xl prose-h3:mt-16 prose-h3:mb-8
                            prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-[2.1] prose-p:mb-12 prose-p:text-[1.2rem] md:prose-p:text-[1.35rem] prose-p:font-medium
                            prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:mb-4 prose-li:text-[1.2rem]
                            prose-strong:text-gray-950 dark:prose-strong:text-white prose-strong:font-black">
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm]} 
                                rehypePlugins={[rehypeRaw, rehypeSlug]}
                            >
                                {preprocessedContent}
                            </ReactMarkdown>
                        </div>
                    </div>
                </article>

            </div>
        </div>
      </main>
      <style jsx global>{`
        @keyframes plasma { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }
        .animate-plasma { animation: plasma 15s ease infinite; }
        .blog-content h2, .blog-content h3 { scroll-margin-top: 150px; }
        
        /* Optical Video Calibration */
        .plyr { border-radius: 2.5rem !important; overflow: hidden !important; shadow: 0 80px 160px -40px rgba(99,102,241,0.5) !important; }
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
        .plyr__poster { background-size: cover !important; }
        .plyr__controls { 
            background: linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.8)) !important; 
            padding: 30px 20px 20px !important;
            position: absolute !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 10 !important;
        }
        .plyr--full-ui.plyr--video .plyr__control--overlaid { display: block !important; }
        
        /* Broken Asset Neutralizer */
        img[alt="Logo"] { display: none !important; } /* Silencing the broken logo placeholder */
        img:not([src]), img[src=""] { display: none !important; }
      `}</style>
    </div>
  );
}
