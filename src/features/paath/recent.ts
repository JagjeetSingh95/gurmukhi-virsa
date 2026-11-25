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
export function writeRecent(r: Recent) {
  try {
    localStorage.setItem(KEY, JSON.stringify(r));
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
