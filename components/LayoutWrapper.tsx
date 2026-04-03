"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import ChatWidget from "./ChatWidget";
import ClipboardShortener from "./ClipboardShortener";
import AnalyticsTracker from "./AnalyticsTracker";
import AdBanner from "./AdBanner";
import MobileNavBar from "./MobileNavBar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdminPath = pathname?.startsWith("/admin");
  const isFreeUser = !session?.user || session.user.role === "free_user";

  return (
    <>
      <AnalyticsTracker />
      {!isAdminPath && <Navbar />}
      <main className={!isAdminPath ? "min-h-screen" : ""}>
        {children}
      </main>
      {/* Ads for free / unauthenticated users only */}
      {!isAdminPath && isFreeUser && <AdBanner slot="footer" />}
      {!isAdminPath && <Footer />}
      {!isAdminPath && <ChatWidget />}
      {!isAdminPath && <ClipboardShortener />}
      {/* Persistent bottom navigation — mobile & Capacitor app only */}
      {!isAdminPath && <MobileNavBar />}
    </>
  );
}
