"use client";

/**
 * NativeAuthScreen — full-screen login/signup for the installed native app.
 *
 * Shown by AppShell when Capacitor.isNativePlatform() === true AND the user
 * has no active session.  No navigation bars or chrome — just auth.
 *
 * Google Sign-In flow:
 *   1. GoogleAuth is initialized ONCE on mount (not per-button-press).
 *      Re-initializing the Google Sign-In SDK on every tap was the root
 *      cause of "google sign-in failed" errors.
 *   2. handleGoogle() calls GoogleAuth.signIn() — shows native account picker.
 *   3. idToken is verified server-side via the "google-native" NextAuth provider.
 */

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import {
  Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, ArrowRight, Loader2,
  type LucideIcon,
} from "lucide-react";

type Mode = "signin" | "signup";

// Web OAuth 2.0 client ID — must match GOOGLE_CLIENT_ID env var on the server
// so the idToken audience passes validation in lib/auth.ts.
const WEB_CLIENT_ID =
  "497304910795-t0303p4hi560nfjiomuvelao2qv1abrp.apps.googleusercontent.com";

/* ── tiny Google SVG logo ──────────────────────────────────────────────── */
function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

/* ── field wrapper ─────────────────────────────────────────────────────── */
function Field({
  icon: Icon, type, placeholder, value, onChange, right,
}: {
  icon: LucideIcon; type: string; placeholder: string;
  value: string; onChange: (v: string) => void; right?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <Icon size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoCapitalize="none"
        autoCorrect="off"
        className="w-full bg-white/8 dark:bg-white/5 border border-white/12 dark:border-white/10 rounded-2xl pl-11 pr-12 py-4 text-[15px] text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/70 focus:bg-white/10 transition-all"
      />
      {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
    </div>
  );
}

/* ── helpers ───────────────────────────────────────────────────────────── */

/** Map Google Sign-In error codes to user-friendly messages. */
function googleErrorMessage(raw: string): string | null {
  // User cancelled — not an error at all
  if (raw.includes("12501") || raw.toLowerCase().includes("cancel")) return null;

  // Extract a numeric code from the error string for precise matching.
  // Google Sign-In errors surface as "statusCode: 10" or just the number.
  const codeMatch = raw.match(/\b(12500|12502|10|16|7|8)\b/);
  const code = codeMatch ? codeMatch[1] : null;

  if (code === "12501")  return null; // cancelled — caught above, safety net
  if (code === "10")     return "Google Sign-In is not configured correctly (error 10). Please use email sign-in.";
  if (code === "12500")  return "Google Sign-In failed. Please try again or use email sign-in.";
  if (code === "12502")  return "Another sign-in is already in progress. Please wait and try again.";
  if (code === "7")      return "No internet connection. Please check your network and try again.";
  if (code === "8")      return "A client error occurred. Please restart the app and try again.";
  if (code === "16")     return "An internal error occurred. Please try again.";

  return "Google Sign-In failed. Please try again or use email sign-in.";
}

/* ── main component ────────────────────────────────────────────────────── */
export default function NativeAuthScreen() {
  const { update }                      = useSession();
  const [mode, setMode]                 = useState<Mode>("signin");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [name, setName]                 = useState("");
  const [phone, setPhone]               = useState("");
  const [showPass, setShowPass]         = useState(false);
  const [loading, setLoading]           = useState(false);
  const [googleLoading, setGoogleLoad]  = useState(false);
  const [error, setError]               = useState("");

  // Track whether GoogleAuth has been initialised so we never call it twice
  const googleInitialized = useRef(false);

  /* ── Initialise GoogleAuth once on mount (not per button press) ──────── */
  useEffect(() => {
    if (googleInitialized.current) return;

    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        const { GoogleAuth } = await import("@codetrix-studio/capacitor-google-auth");
        await GoogleAuth.initialize({
          // Must be the WEB client ID — this becomes the idToken audience so
          // the server's GOOGLE_CLIENT_ID validation in lib/auth.ts passes.
          clientId: WEB_CLIENT_ID,
          scopes: ["profile", "email"],
          grantOfflineAccess: false,
        });
        googleInitialized.current = true;
      } catch (e) {
        console.error("[NativeAuthScreen] GoogleAuth.initialize failed:", e);
      }
    })();
  }, []);

  const clear = () => {
    setError(""); setEmail(""); setPassword(""); setName(""); setPhone("");
  };

  const switchMode = (m: Mode) => { clear(); setMode(m); };

  /* ── sign in ─────────────────────────────────────────────────────────── */
  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError("Email and password are required."); return;
    }
    setLoading(true); setError("");

    const res = await signIn("credentials", {
      email: email.trim(), password, redirect: false,
    });

    if (res?.error) {
      setError("Incorrect email or password. Please try again.");
      setLoading(false); return;
    }
    await update();
    setLoading(false);
  };

  /* ── sign up ─────────────────────────────────────────────────────────── */
  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError("Name, email and password are required."); return;
    }
    if (!phone.trim()) {
      setError("Recovery phone number is required."); return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    setLoading(true); setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(), email: email.trim(),
          password, secretPhone: phone.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Sign up failed. Please try again.");
        setLoading(false); return;
      }

      const signInRes = await signIn("credentials", {
        email: email.trim(), password, redirect: false,
      });

      if (signInRes?.error) {
        setError("Account created but sign-in failed. Please sign in manually.");
        setLoading(false); return;
      }

      await update();
    } catch {
      setError("Network error. Check your connection and try again.");
    }
    setLoading(false);
  };

  /* ── Native Google Sign-In ───────────────────────────────────────────── */
  const handleGoogle = async () => {
    setGoogleLoad(true); setError("");

    try {
      const { GoogleAuth } = await import("@codetrix-studio/capacitor-google-auth");

      // If initialization failed at mount (e.g. app was cold-started with no
      // internet), attempt it once more now before signing in.
      if (!googleInitialized.current) {
        await GoogleAuth.initialize({
          clientId: WEB_CLIENT_ID,
          scopes: ["profile", "email"],
          grantOfflineAccess: false,
        });
        googleInitialized.current = true;
      }

      // Shows the native Android account picker — no browser, no redirect.
      const googleUser = await GoogleAuth.signIn();
      const idToken = googleUser?.authentication?.idToken;

      if (!idToken) {
        setError("Google Sign-In did not return a token. Please try again.");
        return;
      }

      // Exchange idToken for a NextAuth session via the google-native provider.
      const res = await signIn("google-native", { idToken, redirect: false });

      if (res?.error) {
        // NextAuth server-side verification failed
        setError("Google Sign-In was rejected by the server. Please try again.");
        return;
      }

      await update();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : String(err);
      const msg = googleErrorMessage(raw);
      if (msg === null) {
        // User cancelled — silent exit
        return;
      }
      console.error("[NativeAuthScreen] Google Sign-In error (raw):", raw);
      setError(msg);
    } finally {
      setGoogleLoad(false);
    }
  };

  const isSignUp = mode === "signup";

  return (
    <div
      className="fixed inset-0 flex flex-col bg-[#080812] overflow-y-auto"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* Gradient backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-700/15 rounded-full blur-[80px]" />
      </div>

      {/* Logo / hero */}
      <div className="relative flex flex-col items-center pt-14 pb-8 px-6">
        <div className="relative mb-4">
          <Image
            src="/icon-512.png" alt="SmartLink Pilot" width={72} height={72}
            className="rounded-[22px] shadow-2xl shadow-indigo-500/40" priority
          />
          <div className="absolute inset-0 rounded-[22px] ring-2 ring-white/10" />
        </div>
        <h1 className="text-[26px] font-extrabold tracking-tight text-white">
          Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Link</span> Pilot
        </h1>
        <p className="text-[13px] text-gray-400 mt-1 tracking-wide">Shorten. Track. Grow.</p>
      </div>

      {/* Tab switcher */}
      <div className="relative px-6 mb-6">
        <div className="flex bg-white/6 rounded-2xl p-1">
          {(["signin", "signup"] as Mode[]).map((m) => (
            <button
              key={m} onClick={() => switchMode(m)}
              className={`flex-1 py-2.5 text-[14px] font-bold rounded-xl transition-all duration-200 ${
                mode === m
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {m === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="relative flex-1 px-6 space-y-3">
        {isSignUp && (
          <Field icon={User} type="text" placeholder="Full name" value={name} onChange={setName} />
        )}
        {isSignUp && (
          <Field icon={Phone} type="tel" placeholder="Recovery phone (+1 234 567 8900)" value={phone} onChange={setPhone} />
        )}

        <Field icon={Mail} type="email" placeholder="Email address" value={email} onChange={setEmail} />

        <Field
          icon={Lock}
          type={showPass ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={setPassword}
          right={
            <button
              onClick={() => setShowPass((v) => !v)}
              className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors"
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          }
        />

        {error && (
          <div className="flex items-start gap-2.5 bg-red-500/12 border border-red-500/30 rounded-xl px-4 py-3">
            <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-[13px] text-red-300 leading-snug">{error}</p>
          </div>
        )}

        {!isSignUp && (
          <div className="text-right">
            <a href="/forgot-password" className="text-[13px] text-indigo-400 hover:text-indigo-300 transition-colors">
              Forgot password?
            </a>
          </div>
        )}

        <button
          onClick={isSignUp ? handleSignUp : handleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[15px] font-bold rounded-2xl shadow-lg shadow-indigo-500/35 active:scale-[0.98] transition-all disabled:opacity-60 mt-1"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : (
            <>{isSignUp ? "Create Account" : "Sign In"}<ArrowRight size={17} /></>
          )}
        </button>

        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[12px] text-gray-500 font-medium">or continue with</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 bg-white text-gray-800 text-[14px] font-semibold rounded-2xl active:scale-[0.98] transition-all disabled:opacity-60 shadow-lg shadow-black/20"
        >
          {googleLoading ? <Loader2 size={18} className="animate-spin text-gray-500" /> : <GoogleLogo />}
          {googleLoading ? "Signing in…" : "Continue with Google"}
        </button>
      </div>

      {/* Legal footer */}
      <div
        className="relative px-6 pt-6 pb-8 text-center"
        style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <p className="text-[11px] text-gray-600 leading-relaxed">
          By continuing you agree to our{" "}
          <a href="/terms" className="text-gray-400 underline underline-offset-2">Terms</a>
          {" "}and{" "}
          <a href="/privacy" className="text-gray-400 underline underline-offset-2">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
