"use client";

/**
 * /auth/native-success
 *
 * Loaded inside @capacitor/browser (Android Custom Tab / iOS SFSafariViewController)
 * after Google OAuth completes. Immediately redirects to the app's custom URL scheme
 * which:
 *   1. Closes the in-app browser automatically (Android handles the intent)
 *   2. Fires the appUrlOpen event in the Capacitor WebView so NativeAuthScreen
 *      can call session.update() and transition to the authenticated app.
 */

import { useEffect } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function NativeSuccessPage() {
  useEffect(() => {
    // Give the OAuth session cookie a moment to persist, then signal the app.
    const t = setTimeout(() => {
      // Redirect to the custom scheme registered in AndroidManifest.xml.
      // On Android this causes the Custom Tab to close and fires appUrlOpen
      // with url = "smartlinkpilot://auth-success" in the Capacitor WebView.
      // On iOS the SFSafariViewController is dismissed in the same way when
      // it encounters a universal link or custom scheme handled by the app.
      window.location.href = "smartlinkpilot://auth-success";
    }, 600);

    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#080812] gap-5">
      {/* Gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-600/15 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative flex flex-col items-center gap-4">
        <Image
          src="/icon-192.png"
          alt="SmartLink Pilot"
          width={64}
          height={64}
          className="rounded-[18px] shadow-2xl shadow-indigo-500/40"
          priority
        />

        <div className="flex flex-col items-center gap-1.5 text-center">
          <p className="text-white text-[16px] font-bold">Signed in successfully</p>
          <p className="text-gray-400 text-[13px]">Returning you to the app…</p>
        </div>

        <Loader2 size={22} className="animate-spin text-indigo-400 mt-1" />
      </div>
    </div>
  );
}
