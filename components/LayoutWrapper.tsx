"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import ChatWidget from "./ChatWidget";
import ClipboardShortener from "./ClipboardShortener";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdminPath && <Navbar />}
      <main className={!isAdminPath ? "min-h-screen" : ""}>
        {children}
      </main>
      {!isAdminPath && <Footer />}
      {!isAdminPath && <ChatWidget />}
      {!isAdminPath && <ClipboardShortener />}
    </>
  );
}
