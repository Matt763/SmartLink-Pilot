import Link from "next/link";
import type { Metadata } from "next";
import { Cookie, Settings, BarChart2, Shield, Info, CheckCircle } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Cookies Policy — What Cookies We Use & Why",
  description: "SmartLink Pilot's Cookies Policy. We use only essential and functional cookies. No advertising trackers. GDPR compliant with full transparency on every cookie we use.",
};

const cookieTypes = [
  { icon: Shield, title: "Essential Cookies", desc: "Required for core authentication, security, and service functionality. These cannot be disabled without breaking the Service.", color: "blue", required: true },
  { icon: Settings, title: "Functional Cookies", desc: "Remember your preferences such as theme mode (dark/light) and language settings. Disabling these will reset preferences on each visit.", color: "purple", required: false },
  { icon: BarChart2, title: "Analytics Cookies", desc: "A random visitor session ID (slp_vsid) stored in sessionStorage to track anonymous page views, time on site, device type, country, and traffic source for our internal platform analytics. No personal data is stored.", color: "green", required: false },
  { icon: Cookie, title: "Device Identifier", desc: "An anonymous UUID stored in an HTTP-only cookie to enforce free trial limits for unauthenticated users. Contains no personal information.", color: "amber", required: false },
];

const cookieTable = [
  { name: "next-auth.session-token", purpose: "Maintains your authenticated login session across browser sessions", duration: "30 days", type: "Essential", typeColor: "blue" },
  { name: "next-auth.csrf-token", purpose: "Security token that prevents cross-site request forgery attacks", duration: "Session", type: "Essential", typeColor: "blue" },
  { name: "next-auth.callback-url", purpose: "Stores the page to redirect to after successful login", duration: "Session", type: "Essential", typeColor: "blue" },
  { name: "device_id", purpose: "Anonymous random UUID used to track free trial link usage (no PII)", duration: "1 year", type: "Device", typeColor: "amber" },
  { name: "slp_vsid", purpose: "Random visitor session ID stored in sessionStorage for internal analytics (device, country, pages visited, time spent). Cleared when browser tab is closed. Contains no personal data.", duration: "Session", type: "Analytics", typeColor: "green" },
  { name: "smartlink-theme", purpose: "Stores your chosen theme preference (dark/light mode) in localStorage", duration: "Persistent", type: "Functional", typeColor: "purple" },
  { name: "__Secure-next-auth.session-token", purpose: "Secure version of session token used in production HTTPS environments", duration: "30 days", type: "Essential", typeColor: "blue" },
  { name: "Google AdSense cookies", purpose: "Served only to free-tier users. Google may place cookies (e.g., IDE, DSID) for ad personalization and measurement. Paid subscribers are not served ads and these cookies are not set for them.", duration: "Up to 13 months", type: "Advertising", typeColor: "amber" },
];

const typeBg: Record<string, string> = {
  blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  green: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
};

const colorMap: Record<string, string> = {
  blue: "text-blue-600 dark:text-blue-400",
  purple: "text-purple-600 dark:text-purple-400",
  green: "text-green-600 dark:text-green-400",
  amber: "text-amber-600 dark:text-amber-400",
};

const browserInstructions = [
  { browser: "Google Chrome", steps: "Settings → Privacy & Security → Cookies and other site data → Manage cookies" },
  { browser: "Mozilla Firefox", steps: "Settings → Privacy & Security → Cookies and Site Data → Manage Data" },
  { browser: "Apple Safari", steps: "Preferences → Privacy → Manage Website Data" },
  { browser: "Microsoft Edge", steps: "Settings → Cookies and site permissions → Cookies and site data" },
  { browser: "iOS Safari", steps: "Settings → Safari → Advanced → Website Data" },
  { browser: "Android Chrome", steps: "Chrome menu → Settings → Site Settings → Cookies" },
];

export default function CookiesPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Cookies Policy</h1>
          <p className="text-blue-100 mb-2">Last updated: April 2, 2026</p>
          <p className="text-blue-200 text-sm max-w-xl mx-auto">We only use cookies that are necessary to provide our service. No advertising trackers. No third-party profiling.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-16">

        {/* Cookie Types Overview Cards */}
        <ScrollReveal delay={100}>
        <section aria-labelledby="cookie-types">
          <h2 id="cookie-types" className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Types of Cookies We Use</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {cookieTypes.map((type) => (
              <div key={type.title} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${type.color === "blue" ? "bg-blue-100 dark:bg-blue-900/30" : type.color === "purple" ? "bg-purple-100 dark:bg-purple-900/30" : type.color === "green" ? "bg-green-100 dark:bg-green-900/30" : "bg-amber-100 dark:bg-amber-900/30"}`}>
                    <type.icon className={`w-5 h-5 ${colorMap[type.color]}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">{type.title}</h3>
                      {type.required && <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">Required</span>}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{type.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        </ScrollReveal>

        {/* What are cookies */}
        <ScrollReveal delay={200}>
        <section aria-labelledby="what-are-cookies">
          <h2 id="what-are-cookies" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What Are Cookies?</h2>
          <div className="prose prose-base dark:prose-invert text-gray-600 dark:text-gray-300 space-y-4 max-w-none">
            <p>Cookies are small text files stored on your device (computer, phone, or tablet) when you visit a website. They are widely used to make websites work efficiently, remember your preferences, and provide information to site owners.</p>
            <p>Cookies are not viruses. They cannot run programs or install software. They contain only text data. Modern browsers give you full control over which cookies to accept, and our site will function (with limited personalization) even if you disable non-essential cookies.</p>
            <p>Some cookies are stored temporarily for the duration of your browser session and deleted when you close the browser (session cookies). Others persist for a set period (persistent cookies) to remember your preferences across visits.</p>
          </div>
        </section>
        </ScrollReveal>

        {/* Cookie Table */}
        <ScrollReveal delay={300}>
        <section aria-labelledby="cookie-table">
          <h2 id="cookie-table" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Complete Cookie List</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">The following table lists every cookie SmartLink Pilot may place on your device, its purpose, and how long it lasts.</p>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {["Cookie Name", "Purpose", "Duration", "Category"].map((h) => (
                    <th key={h} className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {cookieTable.map((row) => (
                  <tr key={row.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="p-4 font-mono text-xs text-gray-700 dark:text-gray-300 max-w-[180px] break-all">{row.name}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400 text-xs max-w-xs">{row.purpose}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">{row.duration}</td>
                    <td className="p-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeBg[row.typeColor]}`}>{row.type}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-start gap-2.5 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4">
            <Info size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-300">We do not use Google Analytics or Facebook Pixel. We use our own internal visitor analytics system. Free-tier users may see Google AdSense ads; Google may use cookies for ad serving. Paid subscribers (Pro &amp; Enterprise) are completely ad-free — no AdSense cookies are set for their sessions.</p>
          </div>
        </section>
        </ScrollReveal>

        {/* How to manage cookies */}
        <ScrollReveal delay={400}>
        <section aria-labelledby="manage-cookies">
          <h2 id="manage-cookies" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Manage & Delete Cookies</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
            You can control and manage cookies in your browser settings. Please note that disabling essential cookies (session-token, csrf-token) will prevent you from logging in to SmartLink Pilot. Disabling functional cookies will reset your theme preference on each visit.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {browserInstructions.map((b) => (
              <div key={b.browser} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">{b.browser}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{b.steps}</p>
              </div>
            ))}
          </div>
        </section>
        </ScrollReveal>

        {/* GDPR Compliance */}
        <ScrollReveal delay={500}>
        <section aria-labelledby="gdpr">
          <h2 id="gdpr" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">GDPR & Legal Basis for Cookies</h2>
          <div className="space-y-4">
            {[
              { title: "Essential Cookies — Legitimate Interest", desc: "Essential cookies are required to provide the service you have requested. We do not require consent for these cookies as they are necessary for the website to function." },
              { title: "Functional Cookies — Legitimate Interest", desc: "Functional cookies improve your experience by remembering your preferences. We use legitimate interest as the legal basis; you can opt out by clearing your browser data." },
              { title: "Device Identifier — Legitimate Interest", desc: "The anonymous device_id cookie is used to enforce our free trial limits, which is a legitimate business interest. It contains no personally identifiable information." },
              { title: "Visitor Analytics (slp_vsid) — Legitimate Interest", desc: "The slp_vsid session identifier is stored in sessionStorage (not a cookie) and is used for our internal visitor analytics. It contains no personally identifiable information and is automatically cleared when you close the browser tab." },
              { title: "Google AdSense (Free Users Only) — Consent / Legitimate Interest", desc: "Google AdSense cookies are placed only for free-tier users to support the free plan through advertising revenue. Paid subscribers are exempt from all advertising cookies. Free users may opt out of personalized ads at g.co/adsettings." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-xl p-4">
                <CheckCircle size={16} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-xs mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        </ScrollReveal>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-400 text-center">
            See also:{" "}
            <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</Link>
            {" · "}
            <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
