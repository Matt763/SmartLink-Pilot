"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Link2, Copy, Check, X, Scissors, Loader2, ExternalLink, QrCode as QrCodeIcon } from "lucide-react";
import { AdvancedQRCode } from "@/components/AdvancedQRCode";

// URL validation regex
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?(\?[^#]*)?(#.*)?$/i;

function isValidUrl(str: string): boolean {
  if (!str || str.length < 4 || str.length > 2000) return false;
  return URL_REGEX.test(str.trim());
}

/**
 * ClipboardShortener — A floating mini-widget that detects URLs in clipboard.
 *
 * Behavior:
 * - On window focus / visibility change: reads clipboard
 * - If a URL is found: shows a non-intrusive bottom floating card
 * - User can shorten & copy the result without leaving the page
 * - Auto-dismisses after 10 seconds
 * - Works on web (desktop + mobile browser)
 */
export default function ClipboardShortener() {
  const [detectedUrl, setDetectedUrl] = useState<string | null>(null);
  const [shortened, setShortened] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout>>();

  const checkClipboard = useCallback(async () => {
    // Only proceed if Clipboard API is available and page is visible
    if (!navigator?.clipboard?.readText) return;
    if (document.hidden) return;

    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text?.trim();

      if (!trimmed || trimmed === lastChecked) return;
      setLastChecked(trimmed);

      if (isValidUrl(trimmed)) {
        setDetectedUrl(trimmed);
        setShortened(null);
        setDismissed(false);
        setCopied(false);
        setShowQr(false);

        // Auto-dismiss after 10 seconds
        clearTimeout(dismissTimer.current);
        dismissTimer.current = setTimeout(() => setDismissed(true), 10000);
      }
    } catch {
      // Clipboard permission denied — silent fail
    }
  }, [lastChecked]);

  useEffect(() => {
    const onFocus = () => checkClipboard();
    const onVisibilityChange = () => {
      if (!document.hidden) checkClipboard();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Tauri native global clipboard listener
    let unlistenTauri: (() => void) | undefined;
    if (typeof window !== "undefined" && (window as any).__TAURI__) {
      (window as any).__TAURI__.event.listen("new-url-copied", (event: any) => {
        const url = event.payload;
        if (url && isValidUrl(url)) {
          setDetectedUrl(url);
          setShortened(null);
          setDismissed(false);
          setCopied(false);
          setShowQr(false);
          setLastChecked(url);
          // Keep it open longer since they didn't explicitly focus the exact window
          clearTimeout(dismissTimer.current);
          dismissTimer.current = setTimeout(() => setDismissed(true), 30000);
        }
      }).then((unlisten: () => void) => {
        unlistenTauri = unlisten;
      }).catch(console.error);
    }

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearTimeout(dismissTimer.current);
      if (unlistenTauri) unlistenTauri();
    };
  }, [checkClipboard]);

  const handleShorten = async () => {
    if (!detectedUrl || loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl: detectedUrl }),
      });
      const data = await res.json();
      if (res.ok && data.shortUrl) {
        setShortened(data.shortUrl);
        // Reset auto-dismiss timer
        clearTimeout(dismissTimer.current);
        dismissTimer.current = setTimeout(() => setDismissed(true), 15000);
      } else if (data.code === "LIMIT_REACHED") {
        // Soft dismiss — point to login
        setDismissed(true);
      }
    } catch {
      // Network error — silent
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortened) return;
    await navigator.clipboard.writeText(shortened);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setDismissed(true); // dismiss after copy — user is done
    }, 2000);
  };

  const handleDismiss = () => {
    clearTimeout(dismissTimer.current);
    setDismissed(true);
    setDetectedUrl(null);
    setShortened(null);
  };

  // Don't render if no URL detected or dismissed
  if (!detectedUrl || dismissed) return null;

  const shortDisplay = detectedUrl.length > 40 ? detectedUrl.slice(0, 37) + "…" : detectedUrl;

  return (
    <div
      id="clipboard-shortener-widget"
      role="dialog"
      aria-label="URL shortener suggestion"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4"
      style={{ animation: "slideUpFade 0.3s ease-out" }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/60 border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Scissors size={13} className="text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">URL detected</span>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X size={14} />
          </button>
        </div>

        {/* URL Preview */}
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 font-mono" title={detectedUrl}>
            {shortDisplay}
          </p>
        </div>

        {/* Action Area */}
        <div className="px-4 pb-4">
          {!shortened ? (
            <button
              onClick={handleShorten}
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
            >
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Shortening…</>
              ) : (
                <><Link2 size={14} /> Shorten & Copy</>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              {/* Shortened URL display */}
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-3 py-2">
                <ExternalLink size={13} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-sm font-bold text-green-700 dark:text-green-300 truncate flex-1">{shortened}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowQr(!showQr)}
                  className={`p-2.5 rounded-xl transition flex text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 bg-gray-50 dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 items-center justify-center border ${showQr ? "border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400" : "border-gray-200 dark:border-gray-700"} flex-shrink-0`}
                >
                   <QrCodeIcon size={18} />
                </button>
                <button
                  onClick={handleCopy}
                  className={`flex-1 py-2.5 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 ${
                    copied
                      ? "bg-green-500 text-white"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md shadow-blue-500/20"
                  }`}
                >
                  {copied ? (
                    <><Check size={14} /> Copied! Continue sharing…</>
                  ) : (
                    <><Copy size={14} /> Copy Short Link</>
                  )}
                </button>
              </div>
              {showQr && (
                 <div className="pt-2 flex justify-center animate-in slide-in-from-top-2">
                   <AdvancedQRCode url={shortened} size={150} showActions={true} />
                 </div>
              )}
            </div>
          )}
        </div>

        {/* Progress bar — auto-dismiss indicator */}
        <div className="h-0.5 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-500"
            style={{ width: "100%", animation: "shrinkWidth 10s linear forwards" }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
