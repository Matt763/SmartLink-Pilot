"use client";

import { useEffect, useRef, useState } from "react";

/**
 * useScrollAnimation — triggers animation when element enters viewport.
 * Returns [ref, isVisible]. Apply ref to the container element.
 * Add CSS transition classes based on isVisible state.
 */
export function useScrollAnimation(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el); // animate once
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px", ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

/**
 * useStaggeredAnimation — triggers staggered animations for a list.
 * Returns [containerRef, visibleCount].
 */
export function useStaggeredAnimation(count: number, staggerMs = 100) {
  const ref = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          for (let i = 0; i <= count; i++) {
            setTimeout(() => setVisibleCount(i), i * staggerMs);
          }
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [count, staggerMs]);

  return { ref, visibleCount };
}
