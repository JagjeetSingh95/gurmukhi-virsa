"use client";
// N.9.1 App preferences (default theme = light; header toggle switches light/dark) (theme + UI language), saved on this device and synced to the parent's settings row.
import { PREFS_KEY } from "@/lib/prefsBoot";
import { useLocal } from "@/lib/useLocal";

export { PREFS_KEY };

export type Theme = "system" | "light" | "dark";
export type Lang = "en" | "pa";
export type Prefs = { theme: Theme; lang: Lang; sounds: boolean };
export const defaultPrefs: Prefs = { theme: "light", lang: "en", sounds: true };

export function readPrefs(): Prefs {
  try {
    return { ...defaultPrefs, ...(JSON.parse(localStorage.getItem(PREFS_KEY) ?? "null") ?? {}) };
  } catch {
    return defaultPrefs;
  }
}

export function applyPrefs(p: Prefs) {
  const el = document.documentElement;
  if (p.theme === "system") delete el.dataset.theme;
  else el.dataset.theme = p.theme;
  el.lang = p.lang === "pa" ? "pa" : "en";
}

export function writePrefs(patch: Partial<Prefs>) {
  const next = { ...readPrefs(), ...patch };
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("gv-local"));
  } catch {}
  applyPrefs(next);
}

export const usePrefs = () => useLocal(readPrefs, defaultPrefs);
