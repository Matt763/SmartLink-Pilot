import Link from "next/link";
import { Globe, Zap, Smartphone, ArrowRight, Mail, MapPin, Instagram } from "lucide-react";
import { APP_CONFIG } from "@/lib/app-config";

const footerLinks = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Analytics", href: "/dashboard/analytics" },
    { label: "Download App", href: "/download" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Team", href: "/team" },
    { label: "Trust & E-E-A-T", href: "/trust" },
    { label: "Sitemap", href: "/sitemap_index.xml" },
    { label: "Blog", href: "/blog" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookies Policy", href: "/cookies" },
    { label: "Disclaimer", href: "/disclaimer" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-950 dark:bg-black text-white border-t border-gray-800">
      {/* Download App Banner */}
      <div className="relative overflow-hidden border-y border-white/10 dark:border-white/5 bg-gray-900/50 dark:bg-white/5 backdrop-blur-3xl">
        {/* Glow elements behind the glass */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-blue-500/30 dark:bg-blue-600/20 blur-[100px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-purple-500/30 dark:bg-purple-600/20 blur-[100px] pointer-events-none mix-blend-screen"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20 shadow-xl">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">SmartLink Pilot is now on mobile</h3>
                <p className="text-sm text-gray-300 dark:text-gray-400">Shorten links on the go. Available for Android & iOS.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/download"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm rounded-xl backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 transform transition-all duration-300"
              >
                <Smartphone size={16} />
                Download Free App
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Block */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:shadow-blue-500/40 transition-shadow shadow-lg">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Link</span>{" "}
                <span className="text-sm font-bold text-gray-500">Pilot</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-6">
              The most trusted URL shortener for marketers, developers, and content creators worldwide. Built by Mayobe Bros, headquartered in Arusha, Tanzania.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <MapPin size={14} />
              <span>Arusha, Tanzania — East Africa</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Mail size={14} />
              <a href={`mailto:${APP_CONFIG.supportEmail}`} className="hover:text-gray-300 transition">{APP_CONFIG.supportEmail}</a>
            </div>

            {/* Social Links - Luxury Premium Branded Icons */}
            <div className="flex gap-4">
              {[
                { 
                  label: "Instagram", 
                  href: (APP_CONFIG as any).instagramUrl, 
                  icon: <Instagram size={18} />,
                  hoverClass: "hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:shadow-[0_0_15px_rgba(220,39,67,0.4)]",
                  title: "Follow on Instagram"
                },
                { 
                  label: "WhatsApp", 
                  href: (APP_CONFIG as any).whatsappUrl, 
                  icon: (
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.541 4.191 1.57 6.017L0 24l6.135-1.61a11.75 11.75 0 005.912 1.586h.005c6.634 0 12.032-5.396 12.035-12.032a11.762 11.762 0 00-3.441-8.518" />
                    </svg>
                  ),
                  hoverClass: "hover:bg-gradient-to-br hover:from-[#25D366] hover:to-[#128C7E] hover:shadow-[0_0_15px_rgba(37,211,102,0.5)] dark:hover:from-[#25D366] dark:hover:to-[#128C7E]",
                  title: "Chat on WhatsApp"
                },
                { 
                  label: "Telegram", 
                  href: (APP_CONFIG as any).telegramUrl, 
                  icon: (
                    <svg className="w-[18px] h-[18px] mr-0.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.891 8.146l-2.003 9.464c-.149.659-.514.822-1.041.488l-3.053-2.247-1.473 1.417c-.163.163-.299.299-.614.299l.219-3.107 5.651-5.105c.247-.219-.054-.341-.385-.121l-6.987 4.4-3.011-.941c-.654-.204-.667-.654.137-.967l11.771-4.536c.545-.198 1.022.128.821 1.006z" />
                    </svg>
                  ),
                  hoverClass: "hover:bg-gradient-to-br hover:from-[#0088cc] hover:to-[#24A1DE] hover:shadow-[0_0_15px_rgba(0,136,204,0.5)] dark:hover:from-[#0088cc] dark:hover:to-[#24A1DE]",
                  title: "Join us on Telegram"
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  title={s.title}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-11 h-11 bg-white/5 dark:bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 active:scale-95 ${s.hoverClass}`}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-sm text-gray-200 uppercase tracking-wider mb-5">{category}</h4>
              <ul className="space-y-3">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-gray-400 hover:text-white text-sm transition hover:translate-x-0.5 inline-block duration-150">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col items-center justify-center text-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} SmartLink Pilot. All rights reserved.
            </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-400 text-xs">All systems operational</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <Globe className="w-3.5 h-3.5" />
              <span>Global CDN</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <Zap className="w-3.5 h-3.5" />
              <span>&lt;100ms</span>
            </div>
          </div>
          </div>
          <p className="text-gray-400 text-sm font-medium mt-2">
            Made with ❤️ by Mayobe Bros
          </p>
        </div>
      </div>
    </footer>
  );
}
