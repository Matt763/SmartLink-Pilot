/**
 * SmartLink Pilot — Service Worker
 *
 * Strategy per resource type:
 *   /_next/static/**   → Cache-First  (files are content-hash-named, immutable)
 *   images / fonts     → Stale-While-Revalidate (serve cached, update in background)
 *   HTML pages         → Network-First with cache fallback (always try fresh)
 *   /api/**            → Network-Only (never cache API responses)
 *
 * Cache lifecycle:
 *   • On INSTALL  → skipWaiting() so new SW activates immediately
 *   • On ACTIVATE → delete ALL caches whose name ≠ CACHE_NAME (auto-cleanup)
 *   • Stale-While-Revalidate always fetches in the background and updates the
 *     cache, so next visit gets the latest content — no manual refresh needed.
 *
 * To force a full cache refresh on next deploy: increment CACHE_VERSION below.
 */

const CACHE_VERSION = "v3";
const CACHE_NAME    = `slp-${CACHE_VERSION}`;

// ── Install ────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  // Activate immediately — don't wait for old tabs to close
  self.skipWaiting();
});

// ── Activate ───────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch ──────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests from the same origin
  if (request.method !== "GET") return;

  let url;
  try { url = new URL(request.url); } catch { return; }
  if (url.origin !== self.location.origin) return;

  const path = url.pathname;

  // ── 1. API routes — Network-Only, never cache ─────────────────────────
  if (path.startsWith("/api/")) return;

  // ── 2. Next.js static assets — Cache-First (immutable by content hash) ─
  if (path.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // ── 3. Static assets (images, fonts, icons, manifests) ──────────────────
  //    Stale-While-Revalidate: serve cached immediately, refresh in background
  if (/\.(?:png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf|json)$/.test(path)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          const networkFetch = fetch(request)
            .then((response) => {
              if (response.ok) cache.put(request, response.clone());
              return response;
            })
            .catch(() => cached); // offline fallback to cache

          // Return cached immediately; network updates it in the background
          return cached ?? networkFetch;
        })
      )
    );
    return;
  }

  // ── 4. HTML / navigation — Network-First with cache fallback ────────────
  //    Always try the network so users get the freshest page.
  //    Falls back to cache when offline.
  if (request.headers.get("Accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) => cached ?? new Response("You are offline.", {
              status: 503,
              headers: { "Content-Type": "text/plain" },
            })
          )
        )
    );
    return;
  }
});
