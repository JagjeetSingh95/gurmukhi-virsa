"use client";
// Reader settings (D07): text size, scripts shown, audio speed, repeat, bedtime timer, theme. Saved on this device.
import { useLocal } from "@/lib/useLocal";

export type ReaderSettings = {
  size: 0 | 1 | 2 | 3; // S M L XL
  roman: boolean;
  en: boolean;
  pa: boolean;
  speed: 0.75 | 1 | 1.25 | 1.5;
  repeat: "off" | "line" | "section" | "bani";
  timer: "off" | "15" | "30" | "end";
  kidsView: "scroll" | "line";
};
export const defaultSettings: ReaderSettings = { size: 1, roman: true, en: true, pa: false, speed: 1, repeat: "off", timer: "off", kidsView: "scroll" };
const KEY = "gv.readerSettings";

export function readSettings(): ReaderSettings {
  try {
    const s = localStorage.getItem(KEY);
    return s ? { ...defaultSettings, ...(JSON.parse(s) as Partial<ReaderSettings>) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}
export function writeSettings(patch: Partial<ReaderSettings>) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...readSettings(), ...patch }));
    window.dispatchEvent(new Event("gv-local"));
  } catch {}
}
export const useReaderSettings = () => useLocal(readSettings, defaultSettings);

/** Gurbani font sizes per step — adult and kids. */
export const sizes = { adult: [20, 24, 28, 34], kids: [28, 32, 38, 44] } as const;
