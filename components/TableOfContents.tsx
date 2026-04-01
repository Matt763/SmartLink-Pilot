"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Wait a brief moment for markdown to render in the DOM
    const timer = setTimeout(() => {
      const elements = Array.from(document.querySelectorAll(".blog-content h2, .blog-content h3"));
      const items = elements.map((el) => {
        // rehype-slug automatically gives IDs, but just in case:
        if (!el.id) {
          el.id = el.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") || "sec";
        }
        return {
          id: el.id,
          text: el.textContent || "",
          level: Number(el.tagName.charAt(1)),
        };
      });
      setHeadings(items);

      // Intersection Observer to track scroll position
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        },
        { rootMargin: "0px 0px -80% 0px", threshold: 1.0 } // Trigger deep within viewport
      );

      elements.forEach((el) => observer.observe(el));

      return () => observer.disconnect();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (headings.length === 0) return null;

  return (
    <div className="sticky top-32">
      <div className="relative group p-8 bg-white/50 dark:bg-black/20 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-indigo-500/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-1000"></div>
        
        <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
            Intelligence Index
        </h4>
        
        <nav className="space-y-4 relative z-10">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveId(heading.id);
                document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`group/link flex items-start gap-4 text-sm transition-all duration-300 relative ${
                activeId === heading.id
                  ? "text-gray-900 dark:text-white font-bold"
                  : "text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
              }`}
              style={{ paddingLeft: `${(heading.level - 2) * 1.5}rem` }}
            >
              {activeId === heading.id && (
                <div className="absolute left-[-1.5rem] top-1/2 -translate-y-1/2 w-1 h-4 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-in slide-in-from-left-2 duration-300"></div>
              )}
              <span className="leading-relaxed">{heading.text}</span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
