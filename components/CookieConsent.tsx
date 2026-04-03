'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type ConsentState = 'accepted' | 'necessary' | 'declined' | null;

const STORAGE_KEY = 'slp_cookie_consent';
const STORAGE_VER = '2'; // bump this to re-show banner after policy changes

export default function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.v === STORAGE_VER) {
          setConsent(parsed.choice);
          return;
        }
      }
    } catch {}
    // Show banner after short delay so it doesn't flash on first paint
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  function save(choice: ConsentState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: STORAGE_VER, choice }));
    } catch {}
    setConsent(choice);
    setVisible(false);
  }

  // Inject / remove AdSense based on consent
  useEffect(() => {
    if (consent === 'accepted') {
      enableAds();
    }
  }, [consent]);

  if (!visible || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-modal="true"
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6"
    >
      <div className="max-w-4xl mx-auto bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Main bar */}
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            {/* Cookie icon */}
            <div className="hidden sm:flex w-10 h-10 rounded-full bg-indigo-500/20 items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xl">🍪</span>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-base mb-1">
                We use cookies &amp; similar technologies
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                We use essential cookies to run this site and, with your consent, advertising cookies
                (Google AdSense) to keep our free tier free.{' '}
                <Link href="/cookies" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                  Cookies Policy
                </Link>{' '}
                ·{' '}
                <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                  Privacy Policy
                </Link>
              </p>

              {/* Details toggle */}
              {showDetails && (
                <div className="mt-4 grid sm:grid-cols-3 gap-3">
                  {[
                    {
                      name: 'Essential',
                      always: true,
                      desc: 'Authentication, security, and session cookies. Required for the site to function.',
                      color: 'green',
                    },
                    {
                      name: 'Analytics',
                      always: false,
                      desc: 'Anonymous page-view data to improve the platform. No personal information.',
                      color: 'blue',
                    },
                    {
                      name: 'Advertising',
                      always: false,
                      desc: 'Google AdSense cookies that help us serve relevant ads and keep the free tier available.',
                      color: 'yellow',
                    },
                  ].map((cat) => (
                    <div
                      key={cat.name}
                      className="bg-gray-800 rounded-xl p-4 border border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm font-semibold">{cat.name}</span>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            cat.always
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-600 text-gray-400'
                          }`}
                        >
                          {cat.always ? 'Always on' : 'Optional'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed">{cat.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-5">
            <button
              onClick={() => save('accepted')}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Accept All
            </button>
            <button
              onClick={() => save('necessary')}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Necessary Only
            </button>
            <button
              onClick={() => save('declined')}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white text-sm font-medium rounded-xl border border-gray-700 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={() => setShowDetails((v) => !v)}
              className="ml-auto text-xs text-gray-500 hover:text-gray-300 underline underline-offset-2 transition-colors"
            >
              {showDetails ? 'Hide details ▲' : 'Cookie details ▼'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Dynamically activates Google AdSense personalized ads.
 * Called only when the user has explicitly accepted all cookies.
 */
function enableAds() {
  if (typeof window === 'undefined') return;
  if (document.getElementById('adsense-init')) return;
  const s = document.createElement('script');
  s.id = 'adsense-init';
  s.innerHTML = '(adsbygoogle = window.adsbygoogle || []).push({});';
  document.head.appendChild(s);
}
