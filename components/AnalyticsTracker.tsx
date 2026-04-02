"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const pageStartRef = useRef<number>(Date.now());
  const sessionIdRef = useRef<string>("");
  const currentPathRef = useRef<string>("");

  useEffect(() => {
    try {
      let sid = sessionStorage.getItem("slp_vsid");
      if (!sid) {
        sid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
        sessionStorage.setItem("slp_vsid", sid);
      }
      sessionIdRef.current = sid;
    } catch {}
  }, []);

  useEffect(() => {
    if (!sessionIdRef.current) return;

    // Send duration for the previous page before navigating
    if (currentPathRef.current && currentPathRef.current !== pathname) {
      const duration = Math.round((Date.now() - pageStartRef.current) / 1000);
      if (duration > 0) {
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionIdRef.current, path: currentPathRef.current, duration, type: "duration" }),
          keepalive: true,
        }).catch(() => {});
      }
    }

    pageStartRef.current = Date.now();
    currentPathRef.current = pathname;

    const referrer = typeof document !== "undefined" ? document.referrer : "";
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sessionIdRef.current, path: pathname, referrer, userAgent: ua }),
      keepalive: true,
    }).catch(() => {});

    const handleUnload = () => {
      const dur = Math.round((Date.now() - pageStartRef.current) / 1000);
      if (dur < 1) return;
      try {
        navigator.sendBeacon(
          "/api/analytics/track",
          new Blob([JSON.stringify({ sessionId: sessionIdRef.current, path: pathname, duration: dur, type: "duration" })], { type: "application/json" })
        );
      } catch {}
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      handleUnload();
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [pathname]);

  return null;
}
