"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const isPro = session?.user?.role === "premium_user" || session?.user?.role === "admin";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </div>
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
              { label: "Pricing", href: "/pricing" },
              { label: "About", href: "/about" },
              { label: "Team", href: "/team" },
              { label: "Contact", href: "/contact" },
            ].map(link => (
              <Link key={link.href} href={link.href} className="px-3.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
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

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 px-4 py-4 space-y-1 animate-in slide-in-from-top-2">
          {[
            { label: "Pricing", href: "/pricing" },
            { label: "About", href: "/about" },
            { label: "Team", href: "/team" },
            { label: "Contact", href: "/contact" },
          ].map(link => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition">
              {link.label}
            </Link>
          ))}
          <hr className="border-gray-100 dark:border-gray-800 my-2" />
          {session ? (
            <>
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition">Dashboard</Link>
              {session?.user?.role === "admin" && <Link href="/admin" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition">Admin CMS</Link>}
              <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition">Sign In</Link>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-center mt-2">Get Started Free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
