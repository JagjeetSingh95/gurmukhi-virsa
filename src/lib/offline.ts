"use client";
// N.9.3 Saved-offline banis (U11 downloads manager). Uses the Cache API directly from the page;
// the service worker (public/sw.js) serves these caches when the network is down.
//   gv-banis  — reader pages (HTML) for downloaded banis   (kept across app updates)
//   gv-static — hashed JS/CSS/font files (incl. the bani text chunk) (kept across app updates)
//   gv-audio  — recordings for downloaded banis (when real audio exists)
import { libraryItem, loadBani, pagedBanis } from "@/features/paath/library";
import { useLocal } from "@/lib/useLocal";

export const CACHES = { banis: "gv-banis", static: "gv-static", audio: "gv-audio" } as const;
export type Download = { slug: string; bytes: number; at: string; audio: boolean };
const KEY = "gv.downloads";

export const offlineSupported = () => typeof window !== "undefined" && "caches" in window && "serviceWorker" in navigator;

export function readDownloads(): Download[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Download[];
  } catch {
    return [];
  }
}
function writeDownloads(d: Download[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
    window.dispatchEvent(new Event("gv-local"));
  } catch {}
}
export const useDownloads = () => useLocal(readDownloads, [] as Download[]);

export function pagesFor(slug: string) {
  const n = pagedBanis[slug];
  return n ? [`/paath/${slug}`, ...Array.from({ length: n - 1 }, (_, i) => `/paath/${slug}/${i + 2}`)] : [`/paath/${slug}`];
}

/** Hashed assets referenced by a page's HTML (scripts, styles, preloads). */
function assetsIn(html: string) {
  const out = new Set<string>();
  for (const m of html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)) out.add(m[1]);
  return [...out];
}

const sizeOf = async (r: Response) => {
  const len = Number(r.headers.get("content-length"));
  return len > 0 ? len : (await r.clone().blob()).size;
};

/** Download a bani for offline reading. onProgress gets 0–1. */
export async function saveBani(slug: string, onProgress?: (p: number) => void) {
  if (!offlineSupported()) throw new Error("UNSUPPORTED");
  const [pages, statics, audio] = await Promise.all([caches.open(CACHES.banis), caches.open(CACHES.static), caches.open(CACHES.audio)]);
  const urls = pagesFor(slug);
  let bytes = 0;
  const assets = new Set<string>();
  for (let i = 0; i < urls.length; i++) {
    const res = await fetch(urls[i], { cache: "reload", credentials: "same-origin" });
    if (!res.ok) throw new Error("FETCH");
    const html = await res.clone().text();
    assetsIn(html).forEach((a) => assets.add(a));
    bytes += await sizeOf(res);
    await pages.put(urls[i], res);
    onProgress?.(((i + 1) / (urls.length + 1)) * 0.9);
  }
  for (const a of assets) {
    if (await statics.match(a)) continue;
    const r = await fetch(a).catch(() => null);
    if (r?.ok) {
      bytes += await sizeOf(r);
      await statics.put(a, r);
    }
  }
  // Bani text is a lazy chunk: load it now so the service worker stores it in gv-static.
  await loadBani(slug);
  const item = libraryItem(slug) as { audioUrl?: string | null } | undefined;
  let hasAudio = false;
  if (item?.audioUrl) {
    const r = await fetch(item.audioUrl, { mode: "cors" }).catch(() => null);
    if (r?.ok) {
      bytes += await sizeOf(r);
      await audio.put(item.audioUrl, r);
      hasAudio = true;
    }
  }
  onProgress?.(1);
  writeDownloads([{ slug, bytes, at: new Date().toISOString(), audio: hasAudio }, ...readDownloads().filter((d) => d.slug !== slug)]);
}

export async function removeBani(slug: string) {
  if (offlineSupported()) {
    const pages = await caches.open(CACHES.banis);
    await Promise.all(pagesFor(slug).map((u) => pages.delete(u)));
    const item = libraryItem(slug) as { audioUrl?: string | null } | undefined;
    if (item?.audioUrl) await (await caches.open(CACHES.audio)).delete(item.audioUrl);
  }
  writeDownloads(readDownloads().filter((d) => d.slug !== slug));
}

export async function removeAll() {
  for (const d of readDownloads()) await removeBani(d.slug);
}

/** Drop list entries whose pages were evicted by the browser. */
export async function verifyDownloads() {
  if (!offlineSupported()) return;
  const pages = await caches.open(CACHES.banis);
  const list = readDownloads();
  const ok = await Promise.all(list.map(async (d) => !!(await pages.match(`/paath/${d.slug}`))));
  if (ok.some((x) => !x)) writeDownloads(list.filter((_, i) => ok[i]));
}

export const fmtBytes = (n: number) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);
