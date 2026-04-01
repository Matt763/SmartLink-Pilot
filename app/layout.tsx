import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/Providers";
import ChatWidget from "@/components/ChatWidget";
import ClipboardShortener from "@/components/ClipboardShortener";
import LayoutWrapper from "@/components/LayoutWrapper";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "SmartLink Pilot — URL Shortener & Link Analytics SaaS",
    template: "%s | SmartLink Pilot",
  },
  description:
    "SmartLink Pilot is the most powerful URL shortener for marketers, developers & creators. Custom aliases, real-time analytics, QR codes, and enterprise security. Start free.",
  keywords: [
    "url shortener", "link shortener", "link analytics", "branded links",
    "custom short links", "qr code generator", "link management", "smartlink pilot",
  ],
  authors: [{ name: "Mayobe Bros", url: "https://smartlinkpilot.com" }],
  creator: "Mayobe Bros",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://smartlinkpilot.com"),
  openGraph: {
    type: "website",
    siteName: "SmartLink Pilot",
    title: "SmartLink Pilot — URL Shortener & Link Analytics",
    description: "Shorten, brand, and analyze your links with enterprise-grade tools. Trusted by 12,000+ marketers worldwide.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@smartlinkpilot",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300`}
      >
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}

