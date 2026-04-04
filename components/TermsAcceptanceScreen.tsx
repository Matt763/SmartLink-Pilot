"use client";

/**
 * TermsAcceptanceScreen — shown once on the native app after first login.
 *
 * Users must tick both checkboxes (Privacy Policy + Terms of Use) before
 * they can proceed.  Acceptance is stored in localStorage under
 * 'slp_terms_v1' so this screen never appears again on the same device.
 * Bump TERMS_VERSION to force re-acceptance after a policy change.
 */

import { useState } from "react";
import Image from "next/image";
import { CheckSquare, Square, ArrowRight, Shield, FileText, ExternalLink } from "lucide-react";

export const TERMS_KEY     = "slp_terms_v1";
export const TERMS_VERSION = "1"; // bump to re-show after policy updates

/** Returns true if the user has already accepted on this device. */
export function hasAcceptedTerms(): boolean {
  try {
    const raw = localStorage.getItem(TERMS_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed.v === TERMS_VERSION && parsed.accepted === true;
  } catch {
    return false;
  }
}

/** Persists acceptance to localStorage. */
export function saveTermsAcceptance(): void {
  try {
    localStorage.setItem(
      TERMS_KEY,
      JSON.stringify({ v: TERMS_VERSION, accepted: true, ts: Date.now() })
    );
  } catch {}
}

/* ── component ─────────────────────────────────────────────────────────── */

interface Props {
  onAccept: () => void;
}

export default function TermsAcceptanceScreen({ onAccept }: Props) {
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [termsChecked,   setTermsChecked]   = useState(false);

  const bothChecked = privacyChecked && termsChecked;

  const handleContinue = () => {
    if (!bothChecked) return;
    saveTermsAcceptance();
    onAccept();
  };

  return (
    <div
      className="fixed inset-0 flex flex-col bg-[#080812] overflow-y-auto"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* Gradient backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-700/10 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <div className="relative flex flex-col items-center pt-14 pb-6 px-6">
        <div className="relative mb-5">
          <Image
            src="/icon-512.png"
            alt="SmartLink Pilot"
            width={64}
            height={64}
            className="rounded-[20px] shadow-2xl shadow-indigo-500/40"
            priority
          />
          <div className="absolute inset-0 rounded-[20px] ring-2 ring-white/10" />
        </div>
        <h1 className="text-[22px] font-extrabold tracking-tight text-white text-center">
          Before you get started
        </h1>
        <p className="text-[13px] text-gray-400 mt-2 text-center leading-relaxed max-w-xs">
          Please review and accept our policies to continue using SmartLink Pilot.
        </p>
      </div>

      {/* Policy cards */}
      <div className="relative px-5 space-y-3 flex-1">

        {/* Privacy Policy */}
        <button
          onClick={() => setPrivacyChecked((v) => !v)}
          className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] text-left ${
            privacyChecked
              ? "border-indigo-500 bg-indigo-500/10"
              : "border-white/10 bg-white/5"
          }`}
        >
          {/* Checkbox icon */}
          <div className="flex-shrink-0 mt-0.5">
            {privacyChecked
              ? <CheckSquare size={22} className="text-indigo-400" strokeWidth={2} />
              : <Square      size={22} className="text-gray-600"   strokeWidth={1.5} />
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={14} className="text-indigo-400" strokeWidth={2} />
              <span className="text-[14px] font-bold text-white">Privacy Policy</span>
            </div>
            <p className="text-[12px] text-gray-400 leading-relaxed">
              We collect only what&apos;s needed to run the service. We never sell your data.
              You can request deletion at any time.
            </p>
          </div>

          <a
            href="/privacy"
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 p-1.5 text-gray-500 hover:text-indigo-400 transition-colors"
            aria-label="Read full Privacy Policy"
          >
            <ExternalLink size={14} />
          </a>
        </button>

        {/* Terms of Use */}
        <button
          onClick={() => setTermsChecked((v) => !v)}
          className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] text-left ${
            termsChecked
              ? "border-indigo-500 bg-indigo-500/10"
              : "border-white/10 bg-white/5"
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {termsChecked
              ? <CheckSquare size={22} className="text-indigo-400" strokeWidth={2} />
              : <Square      size={22} className="text-gray-600"   strokeWidth={1.5} />
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={14} className="text-indigo-400" strokeWidth={2} />
              <span className="text-[14px] font-bold text-white">Terms of Use</span>
            </div>
            <p className="text-[12px] text-gray-400 leading-relaxed">
              Use SmartLink Pilot responsibly. No spam, phishing, or malicious links.
              Free and Pro plans available with clear usage limits.
            </p>
          </div>

          <a
            href="/terms"
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 p-1.5 text-gray-500 hover:text-indigo-400 transition-colors"
            aria-label="Read full Terms of Use"
          >
            <ExternalLink size={14} />
          </a>
        </button>

        {/* Helper text */}
        <p className="text-[11px] text-gray-600 text-center px-4 leading-relaxed">
          Tap a card to accept it. Tap{" "}
          <ExternalLink size={10} className="inline-block align-middle" />{" "}
          to read the full document.
        </p>
      </div>

      {/* Continue button */}
      <div
        className="relative px-5 pt-6 pb-8"
        style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <button
          onClick={handleContinue}
          disabled={!bothChecked}
          className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-[15px] font-bold transition-all duration-200 active:scale-[0.98] ${
            bothChecked
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/35"
              : "bg-white/8 text-gray-600 cursor-not-allowed"
          }`}
        >
          {bothChecked ? (
            <>I Agree — Continue <ArrowRight size={17} /></>
          ) : (
            "Please accept both policies above"
          )}
        </button>

        <p className="text-[10px] text-gray-700 text-center mt-4 leading-relaxed">
          By continuing you confirm you are at least 16 years old and agree
          to our Privacy Policy and Terms of Use.
        </p>
      </div>
    </div>
  );
}
