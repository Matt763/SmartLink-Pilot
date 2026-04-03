"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const isPro = session?.user?.role === "premium_user" || session?.user?.role === "admin";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(!!(window as any).Capacitor?.isNativePlatform?.());
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <nav className="bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2.5 group">
                <Image
                  src="/icon-192.png"
                  alt="SmartLink Pilot"
                  width={36}
                  height={36}
                  className="rounded-xl shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all duration-200"
                  priority
                />
                <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Link</span> <span className="text-sm font-bold text-gray-400 dark:text-gray-500">Pilot</span>
                </span>
              </Link>
              {isPro && (
                <span className="ml-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-[10px] font-black px-2.5 py-1 rounded-md tracking-[0.15em] shadow-sm border border-amber-300/50 uppercase">Pro</span>
              )}
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { label: "Features", href: "/features" },
                { label: "Pricing", href: "/pricing" },
                { label: "About", href: "/about" },
                { label: "Blog", href: "/blog" },
                { label: "Contact", href: "/contact" },
              ].map(link => (
                <Link key={link.href} href={link.href} className="px-3.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Download App button - desktop */}
            <Link href="/download" className="hidden md:flex ml-1 items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 18.5l-8-8m8 8l8-8M12 18.5V3" /></svg>
              App
            </Link>

            <div className="flex items-center gap-3">
              <ThemeToggle />

              {session ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                    Dashboard
                  </Link>
                  {session?.user?.role === "admin" && (
                    <Link href="/admin" className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all">
                      Admin
                    </Link>
                  )}
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                    Sign In
                  </Link>
                  <Link href="/login" className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:scale-105">
                    Get Started Free
                  </Link>
                </div>
              )}

              {/* Mobile hamburger — shown on browsers (including mobile); hidden only on native installed app */}
              {!isNative && (
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay — hidden on native (bottom nav used instead) */}
      {mobileOpen && !isNative && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar Drawer — hidden on native Capacitor app */}
      <div
        className={`fixed top-0 right-0 h-[100dvh] w-[85vw] max-w-[300px] bg-white dark:bg-gray-950 shadow-2xl border-l border-gray-100 dark:border-gray-800 z-[70] transform transition-transform duration-300 ease-in-out md:hidden flex flex-col overflow-y-auto ${
          mobileOpen && !isNative ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Image
              src="/icon-192.png"
              alt="SmartLink Pilot"
              width={32}
              height={32}
              className="rounded-lg shadow-md"
            />
            <span className="font-bold text-gray-900 dark:text-white">SmartLink Pilot</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 ml-2">Menu</p>
          {[
            { label: "Features", href: "/features" },
            { label: "Pricing", href: "/pricing" },
            { label: "About", href: "/about" },
            { label: "Blog", href: "/blog" },
            { label: "Contact Us", href: "/contact" },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition"
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-4" />
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 ml-2">More</p>

          <Link href="/download" onClick={() => setMobileOpen(false)} className="flex items-center px-4 py-3 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-xl transition">
            Download App
          </Link>

          <Link href="/sitemap" onClick={() => setMobileOpen(false)} className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition mt-1">
            Visual Sitemap
          </Link>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-4" />

          {session ? (
            <div className="space-y-2">
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl transition shadow-md">
                Dashboard
              </Link>
              {session?.user?.role === "admin" && (
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-xl transition">
                  Admin Panel
                </Link>
              )}
              <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full mt-2 text-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition">
                Sign In
              </Link>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg shadow-blue-500/25 transition">
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
