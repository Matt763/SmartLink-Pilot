"use client";

import { useEffect, useRef } from "react";

interface Props {
  slot: "header" | "footer" | "sidebar" | "infeed";
  className?: string;
}

/**
 * AdBanner — renders Google AdSense ads for free / unauthenticated users.
 * Replace the data-ad-client and data-ad-slot values with your real
 * AdSense publisher ID and slot IDs from admin → Monetization.
 */
export default function AdBanner({ slot, className }: Props) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {}
  }, []);

  return (
    <div
      className={`w-full overflow-hidden text-center ${
        slot === "footer" ? "py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50" : ""
      } ${className || ""}`}
      aria-label="Advertisement"
    >
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"   // ← replace with your Publisher ID
        data-ad-slot="XXXXXXXXXX"                   // ← replace with your Ad Slot ID
        data-ad-format={slot === "sidebar" ? "vertical" : "auto"}
        data-full-width-responsive="true"
      />
    </div>
  );
}
