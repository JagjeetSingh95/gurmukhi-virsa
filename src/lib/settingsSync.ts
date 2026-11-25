"use client";
// N.9.1 Sync reader settings + app prefs to the parent's `settings` row (child_id null, data.reader / data.prefs).
// Signed in: pull once per session (account wins), then push changes (debounced, read-modify-write keeps favourites).
// Guests: device only.
import { useEffect, useRef, useSyncExternalStore } from "react";
import { readSettings, type ReaderSettings } from "@/features/paath/settings";
import { useAuth } from "@/lib/auth";
import { applyPrefs, readPrefs, PREFS_KEY, type Prefs } from "@/lib/prefs";
import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";

type Remote = { reader?: Partial<ReaderSettings>; prefs?: Partial<Prefs>; [k: string]: unknown };
const READER_KEY = "gv.readerSettings";

// Sync status shared with the Settings screen (sync itself runs once, in AppShell).
type Status = "device" | "synced" | "offline";
let status: Status = "device";
const subs = new Set<() => void>();
const setState = (s: Status) => {
  status = s;
  subs.forEach((f) => f());
};
export const useSyncStatus = () =>
  useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => status,
    () => "device" as Status,
  );

async function pushNow(userId: string) {
  const sb = supabase();
  const cur = await sb.from("settings").select("data").is("child_id", null).maybeSingle();
  const data = { ...((cur.data?.data as Remote | null) ?? {}), reader: readSettings(), prefs: readPrefs() } as unknown as Json;
  const now = new Date().toISOString();
  const r = cur.data
    ? await sb.from("settings").update({ data, updated_at: now }).eq("user_id", userId).is("child_id", null)
    : await sb.from("settings").insert({ user_id: userId, child_id: null, data });
  return !r.error;
}

/** Call once (AppShell). */
export function useSettingsSync() {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const pulled = useRef<string | null>(null);
  const last = useRef("");

  // Apply saved theme/lang on mount (boot script covers first paint).
  useEffect(() => applyPrefs(readPrefs()), []);

  // Pull once per signed-in user.
  useEffect(() => {
    if (!userId) return setState("device");
    if (pulled.current === userId) return;
    pulled.current = userId;
    supabase()
      .from("settings")
      .select("data")
      .is("child_id", null)
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (error) return setState("offline");
        const remote = (data?.data as Remote | null) ?? {};
        try {
          if (remote.reader) localStorage.setItem(READER_KEY, JSON.stringify({ ...readSettings(), ...remote.reader }));
          if (remote.prefs) localStorage.setItem(PREFS_KEY, JSON.stringify({ ...readPrefs(), ...remote.prefs }));
          applyPrefs(readPrefs());
          window.dispatchEvent(new Event("gv-local"));
        } catch {}
        last.current = JSON.stringify([readSettings(), readPrefs()]);
        if (!remote.reader || !remote.prefs) setState((await pushNow(userId)) ? "synced" : "offline");
        else setState("synced");
      });
  }, [userId]);

  // Push local changes.
  useEffect(() => {
    if (!userId) return;
    let t: ReturnType<typeof setTimeout> | null = null;
    const onChange = () => {
      const snap = JSON.stringify([readSettings(), readPrefs()]);
      if (snap === last.current || pulled.current !== userId) return;
      if (t) clearTimeout(t);
      t = setTimeout(async () => {
        last.current = snap;
        setState((await pushNow(userId)) ? "synced" : "offline");
      }, 1200);
    };
    window.addEventListener("gv-local", onChange);
    return () => {
      window.removeEventListener("gv-local", onChange);
      if (t) clearTimeout(t);
    };
  }, [userId]);
}
