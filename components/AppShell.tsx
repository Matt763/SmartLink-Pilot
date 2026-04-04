"use client";

/**
 * AppShell — Complete native app chrome.
 *
 * Rendered by LayoutWrapper ONLY when Capacitor.isNativePlatform() === true.
 * Never shown in any browser (desktop or mobile).
 *
 * Layout:
 *   ┌─────────────────────────┐  ← safe-area-inset-top
 *   │  AppTopBar  (56 px)     │
 *   ├─────────────────────────┤
 *   │  Page content           │
 *   │  (scrollable)           │
 *   ├─────────────────────────┤
 *   │  AppBottomNav (68 px)   │
 *   └─────────────────────────┘  ← safe-area-inset-bottom
 *
 * AppMenuSheet slides up from the bottom when "More" tab is pressed.
 * It replaces the web footer / hamburger for secondary navigation,
 * account actions, theme selection, legal links, etc.
 */

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "./ThemeProvider";
import NativeAuthScreen from "./NativeAuthScreen";
import AvatarPicker from "./AvatarPicker";
import {
  House,
  Link2,
  Compass,
  Menu,
  Bell,
  LogIn,
  LogOut,
  X,
  Sun,
  Moon,
  Monitor,
  ChevronRight,
  Zap,
  BookOpen,
  Users,
  Phone,
  Shield,
  FileText,
  CreditCard,
  Download,
  Sparkles,
  LayoutList,
  Cookie,
  Layers,
  type LucideIcon,
} from "lucide-react";

/* ── AndroidBridge type — injected by MainActivity.java ──────────────────── */
declare global {
  interface Window {
    AndroidBridge?: {
      checkOverlayEnabled(): string;   // "true" | "false"
      canDrawOverlays(): string;       // "true" | "false"
      enableOverlay(): void;
      disableOverlay(): void;
    };
  }
}

/* ─────────────────────────────────────── types ──────────────────────────── */

interface NavTab {
  id: string;
  label: string;
  Icon: LucideIcon;
  href: string | null;
  match: (p: string) => boolean;
}

interface MenuItem {
  label: string;
  href: string;
  Icon: LucideIcon;
}

interface MenuSection {
  title: string;
  items: readonly MenuItem[];
}

/* ─────────────────────────────────────── config ─────────────────────────── */

const NAV_TABS: NavTab[] = [
  {
    id: "home",
    label: "Home",
    Icon: House,
    href: "/",
    match: (p) => p === "/",
  },
  {
    id: "links",
    label: "Links",
    Icon: LayoutList,
    href: "/dashboard",
    match: (p) => p.startsWith("/dashboard"),
  },
  {
    id: "center",
    label: "Shorten",
    Icon: Link2,
    href: null,
    match: () => false,
  },
  {
    id: "explore",
    label: "Explore",
    Icon: Compass,
    href: "/features",
    match: (p) =>
      ["/features", "/pricing", "/blog", "/about"].some((r) =>
        p.startsWith(r)
      ),
  },
  {
    id: "more",
    label: "More",
    Icon: Menu,
    href: null,
    match: () => false,
  },
];

const MENU_SECTIONS: MenuSection[] = [
  {
    title: "Product",
    items: [
      { label: "Features",     href: "/features",  Icon: Sparkles  },
      { label: "Pricing",      href: "/pricing",   Icon: CreditCard },
      { label: "Blog",         href: "/blog",      Icon: BookOpen  },
      { label: "Download App", href: "/download",  Icon: Download  },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About Us",   href: "/about",   Icon: Users  },
      { label: "Contact Us", href: "/contact", Icon: Phone  },
      { label: "Trust",      href: "/trust",   Icon: Shield },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy Policy", href: "/privacy",  Icon: Shield   },
      { label: "Terms of Use",   href: "/terms",    Icon: FileText },
      { label: "Cookie Policy",  href: "/cookies",  Icon: Cookie   },
    ],
  },
];

/* ─────────────────────────────────────── component ─────────────────────── */

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname   = usePathname();
  const router     = useRouter();
  const { data: session, status, update } = useSession();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen]         = useState(false);
  const [overlayEnabled, setOverlayEnabled] = useState(false);
  const [hasAndroidBridge, setHasAndroidBridge] = useState(false);

  // ── Overlay permission state ──────────────────────────────────────────────
  useEffect(() => {
    if (!window.AndroidBridge) return;
    setHasAndroidBridge(true);
    setOverlayEnabled(window.AndroidBridge.checkOverlayEnabled() === "true");

    // Listen for the result when user returns from Android overlay settings
    const onPermissionChanged = (e: Event) => {
      const enabled = (e as CustomEvent<{ enabled: boolean }>).detail.enabled;
      setOverlayEnabled(enabled);
    };
    window.addEventListener("overlay-permission-changed", onPermissionChanged);
    return () => window.removeEventListener("overlay-permission-changed", onPermissionChanged);
  }, []);

  const handleOverlayToggle = useCallback(() => {
    if (!window.AndroidBridge) return;
    if (overlayEnabled) {
      window.AndroidBridge.disableOverlay();
      setOverlayEnabled(false);
    } else {
      // enableOverlay() will open system settings if permission not yet granted;
      // the 'overlay-permission-changed' event will update state on return.
      window.AndroidBridge.enableOverlay();
    }
  }, [overlayEnabled]);

  const isPro =
    session?.user?.role === "premium_user" ||
    session?.user?.role === "enterprise_user" ||
    session?.user?.role === "admin";

  /* ── handlers ──────────────────────────────────────────────────────────── */

  const goTo = useCallback(
    (href: string) => {
      setMenuOpen(false);
      router.push(href);
    },
    [router]
  );

  const handleCenterFab = useCallback(() => {
    if (menuOpen) { setMenuOpen(false); return; }
    if (pathname === "/") {
      // Focus the URL input if visible
      const input = document.querySelector<HTMLInputElement>(
        'input[type="url"], input[placeholder*="http"], input[placeholder*="URL"], input[placeholder*="link" i]'
      );
      if (input) {
        input.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => input.focus(), 250);
        return;
      }
    }
    router.push("/");
  }, [pathname, router, menuOpen]);

  const handleTab = useCallback(
    (tab: NavTab) => {
      if (tab.id === "more")   { setMenuOpen((v) => !v); return; }
      if (tab.id === "center") { handleCenterFab(); return; }
      setMenuOpen(false);
      if (tab.href) router.push(tab.href);
    },
    [handleCenterFab, router]
  );

  /* ── auth gating ────────────────────────────────────────────────────────── */

  // Loading — show a minimal branded splash to avoid layout flash
  if (status === "loading") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#080812] gap-4">
        <Image
          src="/icon-192.png"
          alt="SmartLink Pilot"
          width={72}
          height={72}
          className="rounded-[22px] shadow-2xl shadow-indigo-500/40 animate-pulse"
          priority
        />
        <span className="text-[15px] font-extrabold tracking-tight text-white">
          Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Link</span> Pilot
        </span>
      </div>
    );
  }

  // Not signed in → show native auth screen
  if (status === "unauthenticated") {
    return <NativeAuthScreen />;
  }

  // Signed in but no avatar yet → avatar picker (skip for Google users who already have an image)
  if (session?.user && !session.user.image) {
    return (
      <AvatarPicker
        onComplete={async () => {
          // Re-fetch session so AppShell gets the updated image
          await update();
        }}
      />
    );
  }

  /* ── render ─────────────────────────────────────────────────────────────── */

  return (
    <>
      {/* ══════════════════════════ TOP BAR ══════════════════════════════ */}
      <header
        className="fixed top-0 left-0 right-0 z-[80] bg-white/92 dark:bg-gray-950/92 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-800/50"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex items-center justify-between px-4 h-14">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <Image
              src="/icon-192.png"
              alt="SmartLink Pilot"
              width={34}
              height={34}
              className="rounded-[10px] shadow-md shadow-blue-500/20"
              priority
            />
            <span className="text-[17px] font-extrabold tracking-tight text-gray-900 dark:text-white">
              Smart
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                Link
              </span>
            </span>
            {isPro && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-yellow-500 text-white uppercase tracking-widest shadow-sm">
                Pro
              </span>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              aria-label="Notifications"
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
            >
              <Bell size={20} strokeWidth={1.75} />
            </button>

            {session ? (
              <button
                onClick={() => router.push("/dashboard")}
                aria-label="My profile"
                className="w-9 h-9 rounded-full overflow-hidden shadow-lg shadow-blue-500/30 active:scale-95 transition-transform flex-shrink-0"
              >
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user?.name ?? "Profile"}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                )}
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {/* ══════════════════════════ CONTENT ══════════════════════════════ */}
      <div
        className="min-h-screen"
        style={{
          paddingTop:    "calc(56px + env(safe-area-inset-top, 0px))",
          paddingBottom: "calc(68px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {children}
      </div>

      {/* ══════════════════════ BOTTOM NAV BAR ═══════════════════════════ */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-[85]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="App navigation"
      >
        <div className="bg-white/92 dark:bg-gray-950/92 backdrop-blur-2xl border-t border-gray-200/50 dark:border-gray-800/50 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.3)]">
          <div className="flex items-end justify-around h-[68px] px-1">
            {NAV_TABS.map((tab) => {
              /* ─── Centre FAB ─────────────────────────────────────────── */
              if (tab.id === "center") {
                return (
                  <div key="center" className="flex flex-col items-center pb-2">
                    <button
                      onClick={handleCenterFab}
                      aria-label="Shorten a link"
                      className="-mt-7 w-[58px] h-[58px] rounded-[18px] bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_8px_24px_rgba(99,102,241,0.55)] border-[3px] border-white dark:border-gray-950 active:scale-90 transition-transform duration-150"
                    >
                      <Link2 size={22} className="text-white" strokeWidth={2.5} />
                    </button>
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mt-0.5">
                      Shorten
                    </span>
                  </div>
                );
              }

              /* ─── Regular tabs ───────────────────────────────────────── */
              const isMore   = tab.id === "more";
              const isActive = isMore ? menuOpen : tab.match(pathname ?? "");

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTab(tab)}
                  aria-label={tab.label}
                  aria-current={isActive && !isMore ? "page" : undefined}
                  aria-expanded={isMore ? menuOpen : undefined}
                  className="relative flex flex-col items-center justify-end gap-0.5 px-3 pb-2.5 min-w-[52px] h-full active:scale-90 transition-transform duration-150 focus:outline-none"
                >
                  {/* Active indicator pill */}
                  <span
                    className={`absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-b-full transition-all duration-300 ${
                      isActive
                        ? "w-6 bg-gradient-to-r from-blue-500 to-purple-500 opacity-100"
                        : "w-0 opacity-0"
                    }`}
                  />

                  {/* Icon */}
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${
                      isActive ? "bg-indigo-50 dark:bg-indigo-950/60" : ""
                    }`}
                  >
                    <tab.Icon
                      size={20}
                      strokeWidth={isActive ? 2.5 : 1.75}
                      className={`transition-colors duration-200 ${
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    />
                  </span>

                  {/* Label */}
                  <span
                    className={`text-[10px] font-semibold leading-none transition-colors duration-200 ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ══════════════════════ MENU SHEET ═══════════════════════════════ */}

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[88] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Sheet panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[89] transition-transform duration-300 ease-out will-change-transform ${
          menuOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        role="dialog"
        aria-modal="true"
        aria-label="App menu"
        aria-hidden={!menuOpen}
      >
        <div className="bg-white dark:bg-[#0d0d14] rounded-t-[28px] shadow-[0_-20px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_-20px_60px_rgba(0,0,0,0.7)] max-h-[92dvh] flex flex-col">
          {/* Drag handle row */}
          <div className="relative flex items-center justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-2 p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1 px-4 pb-8 pt-2 space-y-5">

            {/* ── User profile ──────────────────────────────────────── */}
            {session ? (
              <button
                onClick={() => goTo("/dashboard")}
                className="w-full flex items-center gap-3.5 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-2xl border border-blue-100/80 dark:border-blue-900/40 active:scale-[0.98] transition-transform text-left"
              >
                <div className="w-11 h-11 rounded-xl overflow-hidden shadow-lg shadow-blue-500/30 flex-shrink-0">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user?.name ?? "Profile"}
                      width={44}
                      height={44}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-base font-bold">
                      {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[15px] text-gray-900 dark:text-white truncate leading-tight">
                    {session.user?.name ?? "User"}
                  </p>
                  <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {session.user?.email}
                  </p>
                  <span
                    className={`inline-block mt-1.5 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      isPro
                        ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {isPro ? "Pro" : "Free"}
                  </span>
                </div>
                <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
              </button>
            ) : (
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/40 text-center space-y-3">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Sign in to manage your links
                </p>
                <button
                  onClick={() => goTo("/login")}
                  className="w-full py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-md shadow-blue-500/30 active:scale-95 transition-transform"
                >
                  Sign In / Get Started Free
                </button>
              </div>
            )}

            {/* ── Appearance ─────────────────────────────────────────── */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-1">
                Appearance
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {(
                  [
                    { value: "system" as const, Icon: Monitor, label: "System" },
                    { value: "light"  as const, Icon: Sun,     label: "Light"  },
                    { value: "dark"   as const, Icon: Moon,    label: "Dark"   },
                  ] as const
                ).map(({ value, Icon: TIcon, label }) => {
                  const active = theme === value;
                  return (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className={`flex flex-col items-center gap-2 py-3.5 rounded-2xl border-2 transition-all duration-200 active:scale-95 ${
                        active
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50"
                          : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
                      }`}
                    >
                      <TIcon
                        size={19}
                        strokeWidth={active ? 2.5 : 1.75}
                        className={
                          active
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-gray-500 dark:text-gray-400"
                        }
                      />
                      <span
                        className={`text-[11px] font-bold ${
                          active
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Upgrade CTA (free users only) ──────────────────────── */}
            {!isPro && session && (
              <button
                onClick={() => goTo("/pricing")}
                className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform"
              >
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Zap size={18} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[14px] font-bold text-white">Upgrade to Pro</p>
                  <p className="text-[12px] text-blue-100">Custom links · analytics · more</p>
                </div>
                <ChevronRight size={16} className="text-white/60" />
              </button>
            )}

            {/* ── Permissions (Android only) ─────────────────────────── */}
            {hasAndroidBridge && (
              <div>
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5 px-1">
                  Permissions
                </p>
                <div className="bg-gray-50 dark:bg-gray-900/80 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <Layers
                      size={17}
                      className="text-gray-500 dark:text-gray-400 flex-shrink-0"
                      strokeWidth={1.75}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-gray-800 dark:text-gray-200 leading-tight">
                        Appear on top of other apps
                      </p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 leading-snug">
                        {overlayEnabled
                          ? "URL bubble is active — shows over other apps"
                          : "Shows a shortcut bubble when a URL is copied"}
                      </p>
                    </div>
                    {/* Toggle switch */}
                    <button
                      role="switch"
                      aria-checked={overlayEnabled}
                      aria-label="Appear on top of other apps"
                      onClick={handleOverlayToggle}
                      className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                        overlayEnabled
                          ? "bg-indigo-600"
                          : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          overlayEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Navigation sections ────────────────────────────────── */}
            {MENU_SECTIONS.map((section) => (
              <div key={section.title}>
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5 px-1">
                  {section.title}
                </p>
                <div className="bg-gray-50 dark:bg-gray-900/80 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800/60">
                  {section.items.map(({ label, href, Icon: ItemIcon }) => (
                    <button
                      key={href}
                      onClick={() => goTo(href)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
                    >
                      <ItemIcon
                        size={17}
                        className="text-gray-500 dark:text-gray-400 flex-shrink-0"
                        strokeWidth={1.75}
                      />
                      <span className="flex-1 text-[14px] font-medium text-gray-800 dark:text-gray-200">
                        {label}
                      </span>
                      <ChevronRight
                        size={14}
                        className="text-gray-300 dark:text-gray-700 flex-shrink-0"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* ── Account action ─────────────────────────────────────── */}
            {session ? (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  signOut({ redirect: false });
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-2xl text-[14px] font-semibold active:scale-[0.98] transition-transform border border-red-100 dark:border-red-900/50"
              >
                <LogOut size={17} strokeWidth={1.75} />
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => goTo("/login")}
                className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-2xl text-[14px] font-semibold active:scale-[0.98] transition-transform border border-gray-200 dark:border-gray-800"
              >
                <LogIn size={17} strokeWidth={1.75} />
                Sign In
              </button>
            )}

            {/* ── Version ────────────────────────────────────────────── */}
            <p className="text-center text-[11px] text-gray-300 dark:text-gray-700 pt-1">
              SmartLink Pilot · v1.0.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
