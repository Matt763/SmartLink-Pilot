import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/Providers";
import LayoutWrapper from "@/components/LayoutWrapper";
import CapacitorBridge from "@/components/CapacitorBridge";
import CookieConsent from "@/components/CookieConsent";

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

const BASE_URL = process.env.NEXTAUTH_URL || "https://www.smartlinkpilot.com";

export const viewport: Viewport = {
  themeColor:        "#4f46e5",
  colorScheme:       "dark light",
  width:             "device-width",
  initialScale:      1,
  minimumScale:      1,
  viewportFit:       "cover",
};

export const metadata: Metadata = {
  title: {
    default: "SmartLink Pilot — Free URL Shortener with Analytics & QR Codes",
    template: "%s | SmartLink Pilot",
  },
  description:
    "SmartLink Pilot is a free URL shortener with real-time click analytics, custom branded links, QR code generation, and password-protected links. Trusted by marketers, developers and creators worldwide.",
  keywords: [
    "url shortener", "link shortener", "free url shortener", "link analytics",
    "branded links", "custom short links", "qr code generator", "link management",
    "smartlink pilot", "short url", "bitly alternative", "link tracker",
    "utm parameters", "click tracking", "custom domain shortener",
  ],
  authors: [{ name: "SmartLink Pilot", url: BASE_URL }],
  creator: "SmartLink Pilot",
  publisher: "SmartLink Pilot",
  metadataBase: new URL(BASE_URL),
  alternates: { canonical: BASE_URL },
  category: "technology",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png",      sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png",      sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
    other: [
      // Tells browsers / search engines the canonical logo
      { rel: "logo", url: "/icon-512.png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    siteName: "SmartLink Pilot",
    url: BASE_URL,
    title: "SmartLink Pilot — Free URL Shortener with Analytics & QR Codes",
    description: "Shorten, track, and manage your links with real-time analytics, custom aliases, QR codes, and enterprise-grade security. Start free — no credit card required.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "SmartLink Pilot — Free URL Shortener" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@smartlinkpilot",
    creator: "@smartlinkpilot",
    title: "SmartLink Pilot — Free URL Shortener with Analytics",
    description: "Shorten links, track clicks, generate QR codes and manage all your URLs in one place.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: {
    google: "",   // Add your Google Search Console verification code here
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        "name": "SmartLink Pilot",
        "url": BASE_URL,
        "logo": {
          "@type": "ImageObject",
          "@id": `${BASE_URL}/#logo`,
          "url": `${BASE_URL}/icon-512.png`,
          "width": 512,
          "height": 512,
          "caption": "SmartLink Pilot",
        },
        "image": {
          "@id": `${BASE_URL}/#logo`,
        },
        "sameAs": [
          "https://twitter.com/smartlinkpilot",
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer support",
          "url": `${BASE_URL}/contact`,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        "url": BASE_URL,
        "name": "SmartLink Pilot",
        "description": "Free URL shortener with real-time analytics, custom branded links, QR codes, and more.",
        "publisher": { "@id": `${BASE_URL}/#organization` },
        "potentialAction": {
          "@type": "SearchAction",
          "target": { "@type": "EntryPoint", "urlTemplate": `${BASE_URL}/blog?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
        "inLanguage": "en-US",
      },
      {
        "@type": "SoftwareApplication",
        "name": "SmartLink Pilot",
        "operatingSystem": "Web, iOS, Android",
        "applicationCategory": "UtilitiesApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "245",
        },
        "url": BASE_URL,
        "description": "SmartLink Pilot is a free URL shortener with click analytics, custom aliases, QR code generation, and link management tools.",
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="msapplication-TileColor" content="#4f46e5" />
        {/* Explicit logo hints for search engines (Google, Bing) */}
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        {/* Preconnect to AdSense CDN so the lazy script loads faster */}
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100`}
      >
        <Providers>
          <CapacitorBridge />
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <CookieConsent />
        </Providers>

        {/* ── Google AdSense — loaded after page is interactive ────────── */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7857493359758179"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}

