"use client";

/**
 * MobileNavBar — persistent bottom tab bar for mobile & Capacitor native app.
 *
 * - Visible only on screens narrower than the `md` breakpoint (< 768 px)
 * - Five tabs: Home · Features · [Shorten] · Dashboard · Account
 * - Centre tab is a floating action button styled to match the brand gradient
 * - Active tab shows a filled icon + gradient label + indicator dot
 * - Adds a spacer element so page content is never hidden behind the bar
 * - Safe-area-inset-bottom aware (iPhone X+ notch / Android gesture bar)
 */

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  House,
  Sparkles,
  Link2,
  LayoutDashboard,
  UserCircle2,
  type LucideIcon,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────── */
/* Tab configuration                                                            */
/* ──────────────────────────────────────────────────────────────────────────── */

interface Tab {
  id: string;
  label: string;
  href: string;
  /** icon component from lucide-react */
  Icon: LucideIcon;
  /** returns true when this tab should be considered active */
  isActive: (pathname: string) => boolean;
  /** if true, requires auth — redirects to /login if unauthenticated */
  requiresAuth?: boolean;
}

const TABS: Tab[] = [
  {
    id: "home",
    label: "Home",
    href: "/",
    Icon: House,
    isActive: (p) => p === "/",
  },
  {
    id: "features",
    label: "Explore",
    href: "/features",
    Icon: Sparkles,
    isActive: (p) =>
      ["/features", "/pricing", "/about", "/blog", "/contact"].some((r) =>
        p.startsWith(r)
      ),
  },
  // Centre slot — rendered separately as the FAB
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    Icon: LayoutDashboard,
    isActive: (p) => p.startsWith("/dashboard"),
    requiresAuth: true,
  },
  {
    id: "account",
    label: "Account",
    href: "/login",
    Icon: UserCircle2,
    isActive: (p) => p.startsWith("/login"),
  },
];

/* ──────────────────────────────────────────────────────────────────────────── */
/* Component                                                                    */
/* ──────────────────────────────────────────────────────────────────────────── */

export default function MobileNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Only true inside an installed Capacitor shell (Android APK / iOS .ipa).
    // Returns false in every browser — including Chrome/Safari on mobile.
    setIsNativeApp(!!(window as any).Capacitor?.isNativePlatform?.());
  }, []);

  // Track scroll direction — hide nav on scroll-down, show on scroll-up
  const handleScroll = useCallback(() => {
    const current = window.scrollY;
    if (current > lastScrollY + 6 && current > 80) {
      setHidden(true);
    } else if (current < lastScrollY - 6) {
      setHidden(false);
    }
    setLastScrollY(current);
  }, [lastScrollY]);

  useEffect(() => {
    if (!isNativeApp) return;
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll, isNativeApp]);

  // Only render inside a native installed app — never in a browser
  if (!mounted || !isNativeApp) return null;
  if (pathname?.startsWith("/admin")) return null;

  // ── helpers ───────────────────────────────────────────────────────────────

  const handleTabPress = (tab: Tab) => {
    if (tab.requiresAuth && !session) {
      router.push("/login");
      return;
    }
    router.push(tab.href);
  };

  const handleShortenPress = () => {
    if (pathname === "/") {
      // Already on home — smooth-scroll to the shorten form
      const el =
        document.getElementById("shorten-form") ??
        document.querySelector("form") ??
        document.querySelector("input[type='url'], input[placeholder*='url' i], input[placeholder*='link' i]")
          ?.closest("section, div, form");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Try to focus the first input inside
        const input = el.querySelector("input") as HTMLInputElement | null;
        input?.focus();
        return;
      }
    }
    router.push("/");
  };

  // Split tabs into left (2) and right (2) around the centre FAB
  const leftTabs = TABS.slice(0, 2);
  const rightTabs = TABS.slice(2);

  return (
    <>
      {/* ── Bottom spacer — prevents content from hiding behind the bar ──── */}
      <div
        style={{ height: "calc(68px + env(safe-area-inset-bottom, 0px))" }}
        aria-hidden="true"
      />

      {/* ── Nav bar ──────────────────────────────────────────────────────── */}
      <nav
        role="navigation"
        aria-label="Mobile navigation"
        className={`fixed bottom-0 left-0 right-0 z-[90] transition-transform duration-300 ease-in-out ${
          hidden ? "translate-y-full" : "translate-y-0"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Glass sheet */}
        <div className="relative bg-white/88 dark:bg-gray-950/88 backdrop-blur-2xl border-t border-white/60 dark:border-gray-800/60 shadow-[0_-8px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_40px_rgba(0,0,0,0.4)]">
          <div className="flex items-end justify-around h-[68px] px-1">

            {/* ── Left tabs ─────────────────────────────────────────── */}
            {leftTabs.map((tab) => {
              const active = tab.isActive(pathname ?? "");
              return (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  active={active}
                  onPress={() => handleTabPress(tab)}
                />
              );
            })}

            {/* ── Centre FAB — Shorten ──────────────────────────────── */}
            <div className="flex flex-col items-center pb-2">
              <button
                onClick={handleShortenPress}
                aria-label="Shorten a link"
                className="group relative -mt-7 flex items-center justify-center w-[58px] h-[58px] rounded-[18px] bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-[0_8px_24px_rgba(99,102,241,0.55)] border-[3px] border-white dark:border-gray-950 active:scale-90 transition-all duration-150"
              >
                {/* Glow ring on hover */}
                <span className="absolute inset-0 rounded-[16px] bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 group-hover:opacity-30 blur-md transition-opacity" />
                <Link2 size={22} className="text-white relative z-10" strokeWidth={2.5} />
              </button>
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mt-0.5">
                Shorten
              </span>
            </div>

            {/* ── Right tabs ────────────────────────────────────────── */}
            {rightTabs.map((tab) => {
              const active = tab.isActive(pathname ?? "");
              // Override account tab href/label when logged in
              const resolvedTab =
                tab.id === "account" && session
                  ? {
                      ...tab,
                      label: session.user?.name?.split(" ")[0] ?? "Me",
                      href: "/dashboard",
                      isActive: (p: string) => false,
                    }
                  : tab;
              const resolvedActive =
                tab.id === "account" && session
                  ? pathname?.startsWith("/dashboard") && !pathname.startsWith("/dashboard/analytics")
                  : active;

              return (
                <TabButton
                  key={tab.id}
                  tab={resolvedTab}
                  active={!!resolvedActive}
                  onPress={() => handleTabPress(tab)}
                />
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────────── */
/* TabButton sub-component                                                      */
/* ──────────────────────────────────────────────────────────────────────────── */

function TabButton({
  tab,
  active,
  onPress,
}: {
  tab: Tab;
  active: boolean;
  onPress: () => void;
}) {
  const { Icon } = tab;
  return (
    <button
      onClick={onPress}
      aria-label={tab.label}
      aria-current={active ? "page" : undefined}
      className="relative flex flex-col items-center justify-end gap-0.5 px-3 pb-2.5 min-w-[52px] h-full active:scale-90 transition-transform duration-150 focus:outline-none"
    >
      {/* Active indicator pill at top of bar */}
      <span
        className={`absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-b-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ${
          active ? "w-6 opacity-100" : "w-0 opacity-0"
        }`}
      />

      {/* Icon container */}
      <span
        className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${
          active
            ? "bg-indigo-50 dark:bg-indigo-950/60"
            : "bg-transparent"
        }`}
      >
        <Icon
          size={20}
          strokeWidth={active ? 2.5 : 1.75}
          className={`transition-colors duration-200 ${
            active
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-gray-400 dark:text-gray-500"
          }`}
        />
      </span>

      {/* Label */}
      <span
        className={`text-[10px] font-semibold leading-none transition-colors duration-200 ${
          active
            ? "text-indigo-600 dark:text-indigo-400"
            : "text-gray-400 dark:text-gray-500"
        }`}
      >
        {tab.label}
      </span>
    </button>
  );
}
