/**
 * sitemap-ping.ts
 * Auto-notifies Google, Bing, and IndexNow whenever content changes.
 * All calls are fire-and-forget — they never block the API response.
 */

const SITE_URL = "https://www.smartlinkpilot.com";
const SITEMAP_INDEX = `${SITE_URL}/sitemap_index.xml`;

/**
 * Call this after any content mutation (publish, delete, upload, page edit).
 * Pass `changedUrls` for IndexNow instant-indexing of specific pages.
 */
export function pingSearchEngines(changedUrls?: string[]): void {
  void (async () => {
    const results = await Promise.allSettled([
      pingGoogle(),
      pingBing(),
      changedUrls?.length ? submitIndexNow(changedUrls) : Promise.resolve(),
    ]);

    results.forEach((r, i) => {
      const label = ["Google", "Bing", "IndexNow"][i];
      if (r.status === "rejected") {
        console.error(`[SITEMAP_PING] ${label} failed:`, r.reason?.message ?? r.reason);
      }
    });
  })();
}

async function pingGoogle(): Promise<void> {
  const url = `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_INDEX)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(12_000) });
  console.log(`[SITEMAP_PING] Google → ${res.status}`);
}

async function pingBing(): Promise<void> {
  const url = `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_INDEX)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(12_000) });
  console.log(`[SITEMAP_PING] Bing → ${res.status}`);
}

async function submitIndexNow(urls: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    console.warn("[SITEMAP_PING] INDEXNOW_KEY not set — skipping IndexNow submission.");
    return;
  }

  // IndexNow is used by Bing, Yandex, Seznam, and partially Google
  const body = {
    host: "www.smartlinkpilot.com",
    key,
    keyLocation: `${SITE_URL}/${key}.txt`,
    urlList: urls.slice(0, 10_000), // IndexNow max per request
  };

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  console.log(`[SITEMAP_PING] IndexNow → ${res.status} (${urls.length} URL${urls.length !== 1 ? "s" : ""})`);
}
