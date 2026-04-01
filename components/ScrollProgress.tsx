"use client";

import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const amountToScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (amountToScroll === 0) return;
      const percent = (scrolled / amountToScroll) * 100;
      setPercentage(percent > 100 ? 100 : percent);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1.5 bg-gray-200 dark:bg-gray-800 z-[100] transform origin-left transition-transform duration-150 ease-out" style={{ transform: `scaleX(${percentage / 100})` }}>
      <div className="absolute top-0 right-0 h-full w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-amber-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
    </div>
  );
}
