"use client";
// Device-local state: mode (adult guest / family), guest bookmarks + settings, active child, parent-gate unlock.
// Wrapped in try/catch: storage can be missing (private mode) — the app still works, just without memory.
export type Mode = "adult" | "family";
export type GuestBookmark = { baniSlug: string; lineId: string; createdAt: string };

const K = { mode: "gv.mode", bookmarks: "gv.guest.bookmarks", settings: "gv.guest.settings", child: "gv.activeChild", gate: "gv.gateUntil", sessions: "gv.sessions", plan: "gv.plan" };

function get<T>(key: string, fallback: T, store: "local" | "session" = "local"): T {
  try {
    const s = (store === "local" ? localStorage : sessionStorage).getItem(key);
    return s ? (JSON.parse(s) as T) : fallback;
  } catch {
    return fallback;
  }
}
function set(key: string, value: unknown, store: "local" | "session" = "local") {
  try {
    const s = store === "local" ? localStorage : sessionStorage;
    if (value === null || value === undefined) s.removeItem(key);
    else s.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("gv-local"));
  } catch {}
}

export const local = {
  mode: () => get<Mode | null>(K.mode, null),
  setMode: (m: Mode | null) => set(K.mode, m),
  activeChild: () => get<string | null>(K.child, null),
  setActiveChild: (id: string | null) => set(K.child, id),
  guestBookmarks: () => get<GuestBookmark[]>(K.bookmarks, []),
  setGuestBookmarks: (b: GuestBookmark[]) => set(K.bookmarks, b),
  guestSettings: () => get<Record<string, unknown> | null>(K.settings, null),
  setGuestSettings: (s: Record<string, unknown> | null) => set(K.settings, s),
  /** Parent gate stays unlocked for 5 minutes (U.4). */
  gateOpen: () => get<number>(K.gate, 0, "session") > Date.now(),
  openGate: () => set(K.gate, Date.now() + 5 * 60_000, "session"),
  closeGate: () => set(K.gate, null, "session"),
  /** Last known parent plan, cached so marketing pages can tailor CTAs without loading Supabase. */
  plan: () => get<{ plan: "free" | "family"; trial_ends_at: string | null } | null>(K.plan, null),
  setPlan: (p: { plan: "free" | "family"; trial_ends_at: string | null } | null) => set(K.plan, p),
  bumpSession: () => {
    const n = get<number>(K.sessions, 0) + 1;
    set(K.sessions, n);
    return n;
  },
  clearGuest: () => {
    set(K.bookmarks, null);
    set(K.settings, null);
  },
};
