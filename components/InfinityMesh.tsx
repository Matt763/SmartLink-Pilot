"use client";

import React, { useMemo } from "react";

export default function InfinityMesh() {
  // Create a series of wave paths with different phase offsets
  const paths = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      delay: i * -2,
      opacity: 0.1 + (i * 0.05),
      strokeWidth: 1 + (i * 0.5),
      // Harmonic wave calculation for SVG path
      d: "M-100 50 Q 150 100, 400 50 T 900 50 T 1400 50 T 1900 50 T 2400 50"
    }));
  }, []);

  return (
    <div className="relative w-full h-48 overflow-hidden pointer-events-none z-30 flex items-center justify-center -mt-24 mb-[-2rem]">
      {/* Background Gradient Transition */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-600/5 to-white dark:to-[#050505]"></div>
      
      {/* Infinity Lines Container */}
      <svg
        viewBox="0 0 1920 100"
        preserveAspectRatio="none"
        className="absolute w-[200%] h-full left-0 animate-mesh-slide opacity-60"
      >
        <defs>
          <linearGradient id="meshGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="1" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {paths.map((path) => (
          <path
            key={path.id}
            d={path.d}
            fill="none"
            stroke="url(#meshGradient)"
            strokeWidth={path.strokeWidth}
            className="animate-mesh-wave"
            style={{
              animationDelay: `${path.delay}s`,
              opacity: path.opacity,
            } as React.CSSProperties}
          />
        ))}
      </svg>
      
      {/* Decorative Glows */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

      <style jsx>{`
        @keyframes mesh-slide {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes mesh-wave {
          0%, 100% { d: path("M-100 50 Q 150 120, 400 50 T 900 50 T 1400 50 T 1900 50 T 2400 50"); }
          50% { d: path("M-100 50 Q 150 -20, 400 50 T 900 50 T 1400 50 T 1900 50 T 2400 50"); }
        }
        .animate-mesh-slide {
          animation: mesh-slide 20s linear infinite;
        }
        .animate-mesh-wave {
          animation: mesh-wave 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
