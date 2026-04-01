"use client";

import Link from "next/link";
import { useOsDetect } from "@/hooks/useOsDetect";
import { APP_CONFIG } from "@/lib/app-config";
import { Smartphone, Monitor, Download, Star, Shield, Zap, Copy, Check, QrCode, Share2, Scissors, Bell } from "lucide-react";
import { useState } from "react";
import { SpiderWeb } from "@/components/SpiderWeb";
import { AdvancedQRCode } from "@/components/AdvancedQRCode";

const features = [
  { icon: Scissors, title: "Instant Clipboard Shortener", desc: "Copy any URL — SmartLink Pilot detects it automatically and offers to shorten it in a floating overlay. No app switching." },
  { icon: Share2, title: "Native Share Sheet Integration", desc: "Share any link to SmartLink Pilot directly from your browser, social apps, or anywhere the system share menu appears." },
  { icon: QrCode, title: "QR Code on Demand", desc: "Generate a QR code for any short link instantly. Save, share, or print it from your phone." },
  { icon: Bell, title: "Click Notifications", desc: "Get real-time push notifications when your links get clicked. See which campaigns are performing live." },
  { icon: Shield, title: "Password-Protected Links", desc: "Lock your links with a password before sharing sensitive documents or exclusive content." },
  { icon: Zap, title: "One-Tap Shortening", desc: "A minimal, distraction-free shortener widget. Paste URL → tap shorten → copy. Done in 3 taps." },
];

const reviews = [
  { name: "Aisha K.", role: "Marketing Manager", text: "The clipboard detection feature is brilliant. I copy links all day and it just pops up — saved me so much time.", rating: 5 },
  { name: "Dev M.", role: "Growth Lead", text: "Finally a mobile link shortener that doesn't feel like an afterthought. The analytics are excellent.", rating: 5 },
  { name: "Carlos R.", role: "Content Creator", text: "The share sheet integration is seamless. I share links to SmartLink directly from Instagram. 10/10.", rating: 5 },
];

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={13} className="text-amber-400 fill-amber-400" />
      ))}
    </div>
  );
}

export default function DownloadPage() {
  const os = useOsDetect();
  const [copied, setCopied] = useState(false);

  const copyLink = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAndroid = os === "android";
  const isIOS = os === "ios";
  const isMobile = isAndroid || isIOS;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 via-blue-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-20 pb-32">
        {/* Spider Web Canvas */}
        <div className="absolute inset-0">
          <SpiderWeb />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-10 left-1/4 w-80 h-80 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 z-10">
          <div className="text-center mb-10">
            {/* OS Detection Badge */}
            {isMobile && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 border ${isAndroid ? "bg-green-500/10 border-green-400/30 text-green-300" : "bg-blue-500/10 border-blue-400/30 text-blue-300"}`}>
                <Smartphone size={15} />
                {isAndroid ? "Android device detected — Google Play recommended" : "iOS device detected — App Store recommended"}
              </div>
            )}
            {os === "desktop" && (
              <div className="flex flex-col items-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 bg-white/50 border border-gray-200 text-gray-700 dark:bg-white/10 dark:border-white/20 dark:text-white/80 backdrop-blur-sm shadow-md">
                  <Monitor size={15} />
                  Scan to download the mobile app
                </div>
                <div className="bg-white p-4 rounded-3xl shadow-2xl border border-gray-200">
                  <AdvancedQRCode url="https://smartlinkpilot.com/download/mobile-router" size={160} />
                </div>
              </div>
            )}

            <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
              SmartLink Pilot<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-yellow-300 dark:to-amber-300">on Your Phone</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
              The only mobile link shortener with automatic clipboard detection. Copy a URL — we&apos;ll pop up instantly so you can shorten and share without ever opening the full app.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Play Store */}
              <a
                href={APP_CONFIG.playStoreUrl}
                className={`flex items-center gap-3 px-6 py-4 bg-white rounded-2xl hover:bg-gray-50 transition shadow-2xl shadow-black/20 hover:scale-105 transform duration-200 ${isIOS ? "opacity-60" : ""} ${isAndroid ? "ring-2 ring-green-400 ring-offset-2 ring-offset-blue-700" : ""}`}
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
                  <path d="M3.18 23.76a2.19 2.19 0 0 1-.66-1.65V1.89c0-.66.22-1.22.66-1.65L13.42 12z" fill="#EA4335"/>
                  <path d="M17.1 16.02l-3.68-3.68L3.18 23.76c.37.35.85.52 1.44.45l12.48-8.2" fill="#FBBC04"/>
                  <path d="M20.97 10.52a2.34 2.34 0 0 1 0 2.96L17.1 16.02l-3.68-3.68 3.68-3.44z" fill="#4285F4"/>
                  <path d="M4.62.24L17.1 8.56 13.42 12 3.18 1.24A1.78 1.78 0 0 1 4.62.24z" fill="#34A853"/>
                </svg>
                <div className="text-left">
                  <p className="text-[10px] font-medium text-gray-500 leading-none">GET IT ON</p>
                  <p className="text-base font-bold text-gray-900 leading-tight">Google Play</p>
                </div>
                {isAndroid && <span className="ml-1 text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Recommended</span>}
              </a>

              {/* App Store */}
              <a
                href={APP_CONFIG.appStoreUrl}
                className={`flex items-center gap-3 px-6 py-4 bg-white rounded-2xl hover:bg-gray-50 transition shadow-2xl shadow-black/20 hover:scale-105 transform duration-200 ${isAndroid ? "opacity-60" : ""} ${isIOS ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-blue-700" : ""}`}
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="#000"/>
                </svg>
                <div className="text-left">
                  <p className="text-[10px] font-medium text-gray-500 leading-none">DOWNLOAD ON THE</p>
                  <p className="text-base font-bold text-gray-900 leading-tight">App Store</p>
                </div>
                {isIOS && <span className="ml-1 text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">Recommended</span>}
              </a>

              {/* Direct APK */}
              <a
                href={APP_CONFIG.apkDownloadUrl}
                download="SmartLinkPilot.apk"
                className="flex items-center gap-3 px-6 py-4 bg-gray-900 border border-gray-800 dark:bg-white/10 dark:border-white/20 rounded-2xl hover:bg-black dark:hover:bg-white/20 transition text-white hover:scale-105 transform duration-200 shadow-xl shadow-black/10 backdrop-blur-sm"
              >
                <Download size={24} className="flex-shrink-0 text-white" />
                <div className="text-left">
                  <p className="text-[10px] font-medium text-gray-400 dark:text-white/60 leading-none">DIRECT DOWNLOAD</p>
                  <p className="text-base font-bold text-white leading-tight">APK File</p>
                  <p className="text-[10px] text-gray-400 dark:text-white/50">{APP_CONFIG.apkSize} · v{APP_CONFIG.appVersion}</p>
                </div>
              </a>
            </div>

            <p className="mt-5 text-sm text-gray-500 dark:text-blue-200/70">Free to download · No credit card required · Works offline</p>
          </div>

          {/* Phone Mockup Visual */}
          <div className="flex justify-center">
            <div className="relative w-64 h-[520px]">
              {/* Phone frame */}
              <div className="absolute inset-0 bg-gray-900 rounded-[3rem] border-4 border-gray-700 shadow-2xl shadow-black/60 overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl z-10" />
                {/* Screen content */}
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 to-purple-900 flex flex-col items-center justify-center p-4">
                  {/* Clipboard widget preview */}
                  <div className="w-full bg-white dark:bg-white rounded-2xl shadow-2xl p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Scissors size={11} className="text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-900">URL detected</span>
                      <span className="ml-auto text-gray-300 text-lg leading-none">×</span>
                    </div>
                    <p className="text-[9px] font-mono text-gray-500 bg-gray-100 rounded-lg px-2 py-1.5 mb-2 truncate">https://example.com/very-long-url...</p>
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl py-2 text-center">
                      <p className="text-[10px] text-white font-bold">✂ Shorten & Copy</p>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                    <p className="text-xs text-center text-white/80 font-medium">SmartLink Pilot</p>
                    <p className="text-[9px] text-center text-white/50 mt-1">Your shortened links appear here</p>
                    <div className="mt-3 space-y-1.5">
                      {["slp.io/promo", "slp.io/launch", "slp.io/docs"].map((link) => (
                        <div key={link} className="bg-white/10 rounded-lg px-3 py-1.5 flex justify-between items-center">
                          <span className="text-[9px] text-blue-300 font-mono">{link}</span>
                          <span className="text-[8px] text-white/40">142 clicks</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Glow */}
              <div className="absolute -inset-6 bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-[4rem] blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* QR Code Section — desktop users */}
      {os === "desktop" && (
        <section className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border-y border-indigo-100 dark:border-indigo-800/30 py-12">
          <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
            <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-lg flex-shrink-0 text-gray-400">
              <QrCode size={60} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Scan to Download on Mobile</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">Open your phone camera and point it at the QR code (above) to go directly to the app store for your device. Or copy this link and send it to your phone:</p>
              <div className="flex items-center gap-2 max-w-xs">
                <code className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-mono text-gray-700 dark:text-gray-300 truncate">
                  smartlinkpilot.com/download
                </code>
                <button onClick={() => copyLink("https://smartlinkpilot.com/download")} className="px-3 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-xs font-bold flex items-center gap-1.5">
                  {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why the App?</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">The mobile app unlocks features that aren&apos;t possible in a browser — including our signature clipboard detection overlay.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <f.icon size={22} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How Clipboard Detection Works */}
      <section className="bg-gray-950 dark:bg-black py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">How Clipboard Detection Works</h2>
          <p className="text-gray-400 mb-12 max-w-xl mx-auto">No more switching apps. SmartLink Pilot monitors your clipboard in the background. The moment you copy a URL, we&apos;re ready.</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { step: "1", title: "Copy any URL", desc: "From your browser, WhatsApp, email, or anywhere else" },
              { step: "2", title: "Overlay appears", desc: "A small, non-intrusive bubble appears at the top of your screen" },
              { step: "3", title: "Tap to shorten", desc: "The bubble shows your long URL — tap once to shorten" },
              { step: "4", title: "Auto-copies & dismisses", desc: "Your short link is copied automatically. Continue sharing!" },
            ].map((s) => (
              <div key={s.step} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-sm mb-3">
                  {s.step}
                </div>
                <p className="font-bold text-white text-sm mb-1">{s.title}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">What Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <div key={r.name} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <Stars n={r.rating} />
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mt-3 mb-4">&ldquo;{r.text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{r.name}</p>
                  <p className="text-gray-400 text-xs">{r.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 py-20 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <Smartphone size={48} className="text-white/60 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Download SmartLink Pilot Free</h2>
          <p className="text-blue-100 mb-8">Available for Android and iOS. Start shortening links in seconds.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href={APP_CONFIG.playStoreUrl} className="px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition shadow-xl hover:scale-105 transform">
              Google Play
            </a>
            <a href={APP_CONFIG.appStoreUrl} className="px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition backdrop-blur-sm hover:scale-105 transform">
              App Store
            </a>
          </div>
          <p className="mt-6 text-sm text-blue-200">
            Prefer the web? <Link href="/dashboard" className="underline font-medium">Use the web app instead →</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
