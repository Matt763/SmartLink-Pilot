"use client";

import { useEffect, useState } from "react";

export type OsType = "android" | "ios" | "desktop" | "unknown";

/**
 * Detects the user's operating system from user agent.
 * Returns: android | ios | desktop | unknown
 */
export function useOsDetect(): OsType {
  const [os, setOs] = useState<OsType>("unknown");

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) {
      setOs("android");
    } else if (/iphone|ipad|ipod/.test(ua)) {
      setOs("ios");
    } else if (/windows|mac|linux/.test(ua)) {
      setOs("desktop");
    } else {
      setOs("unknown");
    }
  }, []);

  return os;
}
