"use client";

/**
 * LayoutWrapper — top-level layout switcher.
 *
 * • Browser  (any device)  → normal web layout: Navbar · content · Footer
 * • Native installed app   → AppShell: AppTopBar · content · AppBottomNav · MenuSheet
 *
 * The switch is driven exclusively by Capacitor.isNativePlatform(), which is
 * only true inside a compiled Android (.apk / Play Store) or iOS (.ipa / App Store)
 * binary.  It is never true in any browser — including Chrome / Safari on mobile.
 *
 * To avoid a chrome flash on first paint we render the content-only skeleton
 * until the client has mounted and we know which mode to use.
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { Navbar }         from "./Navbar";
import { Footer }         from "./Footer";
import ChatWidget         from "./ChatWidget";
import ClipboardShortener from "./ClipboardShortener";
import AnalyticsTracker   from "./AnalyticsTracker";
import AppShell           from "./AppShell";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted,  setMounted]  = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(!!(window as any).Capacitor?.isNativePlatform?.());
    setMounted(true);
  }, []);

  const isAdminPath = pathname?.startsWith("/admin");

  /* ── Pre-mount: render content only (no chrome) to avoid a flash ──────── */
  if (!mounted) {
    return (
      <>
        <AnalyticsTracker />
        <main className="min-h-screen">{children}</main>
      </>
    );
  }

  /* ── Native installed app ─────────────────────────────────────────────── */
  if (isNative && !isAdminPath) {
    return (
      <>
        <AnalyticsTracker />
        <AppShell>{children}</AppShell>
        {/* Clipboard detection is native-only */}
        <ClipboardShortener />
      </>
    );
  }

  /* ── Web browser layout (desktop + mobile browser) ───────────────────── */
  return (
    <>
      <AnalyticsTracker />
      {!isAdminPath && <Navbar />}
      <main className={!isAdminPath ? "min-h-screen" : ""}>{children}</main>
      {!isAdminPath && <Footer />}
      {!isAdminPath && <ChatWidget />}
    </>
  );
}
