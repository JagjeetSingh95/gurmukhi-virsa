// N.9.3 Gurmukhi Virsa service worker — offline Paath.
// Same-origin GET only. Supabase / API calls are never cached (they go straight to the network).
//  • Hashed static files (/_next/static, fonts): cache-first → gv-static (kept across versions).
//  • Pages: network-first (4 s) → gv-pages-<v>; offline → same page cached / gv-banis (downloads) → /offline.html.
//  • Audio for downloaded banis: served from gv-audio when present.
const VERSION = "v3";
const PAGES = `gv-pages-${VERSION}`;
const STATIC = "gv-static";
const BANIS = "gv-banis";
const AUDIO = "gv-audio";
const PRECACHE = ["/offline.html", "/paath", "/paath/saved", "/paath/search", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((c) => Promise.all(PRECACHE.map((u) => c.add(new Request(u, { cache: "reload" })).catch(() => {}))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("gv-pages-") && k !== PAGES).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms));

async function networkFirstPage(req) {
  const cache = await caches.open(PAGES);
  try {
    const res = await Promise.race([fetch(req), timeout(4000)]);
    if (res.ok && res.type === "basic") cache.put(req, res.clone());
    return res;
  } catch {
    const url = new URL(req.url);
    // Exact page only (a different route's HTML would hydrate wrongly) → downloads → static offline page.
    const hit = (await cache.match(req, { ignoreSearch: true })) || (await caches.match(url.pathname, { cacheName: BANIS }));
    return hit || (await cache.match("/offline.html")) || new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}

async function cacheFirst(req) {
  const hit = await caches.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) (await caches.open(STATIC)).put(req, res.clone());
  return res;
}

async function rsc(req) {
  try {
    return await fetch(req);
  } catch {
    // Offline soft navigation: tell the router to do a full load, which the page cache can serve.
    return new Response(null, { status: 503 });
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) {
    // Downloaded audio (R2): serve the saved copy if we have one, else network.
    if (req.destination === "audio" || /\.(mp3|m4a|aac|ogg|opus)$/i.test(url.pathname)) {
      event.respondWith(caches.match(req.url, { cacheName: AUDIO }).then((hit) => hit || fetch(req)));
    }
    return;
  }
  if (url.pathname.startsWith("/_next/static/") || /\.(woff2?|svg|png|ico)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(req));
    return;
  }
  if (req.mode === "navigate") {
    event.respondWith(networkFirstPage(req));
    return;
  }
  if (req.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) {
    event.respondWith(rsc(req));
  }
});
