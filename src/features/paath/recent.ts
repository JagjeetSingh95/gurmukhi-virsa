"use client";
// "Continue reading" — last place read, kept on this device (synced recents come with N.4.5).
export type Recent = {
  slug: string;
  title: string;
  lineIndex: number;
  lineCount: number;
  section: number;
  preview: string; // Gurmukhi of the line (shown as-is, never edited)
  at: number;
};
const KEY = "gv.recent";

export function readRecent(): Recent | null {
  try {
    const s = localStorage.getItem(KEY);
    return s ? (JSON.parse(s) as Recent) : null;
  } catch {
    return null;
  }
}
const LIST = "gv.recents";
/** Last 10 places read (one per bani), newest first. */
export function readRecents(): Recent[] {
  try {
    return JSON.parse(localStorage.getItem(LIST) ?? "[]") as Recent[];
  } catch {
    return [];
  }
}
export function writeRecent(r: Recent) {
  try {
    localStorage.setItem(KEY, JSON.stringify(r));
    const list = [r, ...readRecents().filter((x) => x.slug !== r.slug)].slice(0, 10);
    localStorage.setItem(LIST, JSON.stringify(list));
    window.dispatchEvent(new Event("gv-local"));
  } catch {}
}
export function clearRecent(slug: string) {
  try {
    localStorage.setItem(LIST, JSON.stringify(readRecents().filter((x) => x.slug !== slug)));
    const cur = readRecent();
    if (cur?.slug === slug) localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("gv-local"));
  } catch {}
}

const MODE = "gv.readerMode";
export type ReaderMode = "adult" | "kids";
export function readReaderMode(): ReaderMode | null {
  try {
    return (localStorage.getItem(MODE) as ReaderMode | null) ?? null;
  } catch {
    return null;
  }
}
export function writeReaderMode(m: ReaderMode) {
  try {
    localStorage.setItem(MODE, m);
    window.dispatchEvent(new Event("gv-local"));
  } catch {}
}
