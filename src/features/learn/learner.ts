"use client";
// Learner state: progress (stars per item), mistakes (for practice), streak + lessons today.
// Device copy always; when a parent is signed in and a child is active, progress also goes to Supabase
// via record_progress (which enforces Free limits and updates the child's streak server-side).
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useIsFamily } from "@/lib/entitlement";
import { local } from "@/lib/local";
import { supabase } from "@/lib/supabase/client";
import { useLocal } from "@/lib/useLocal";
import { FREE_LETTERS } from "./content";

type Store = {
  progress: Record<string, number>; // "letter:ltr-01" → stars 0–3
  mistakes: Record<string, { wrong: number; right: number }>; // letter id → counters
  days: string[]; // ISO dates with activity (newest last)
};
const empty: Store = { progress: {}, mistakes: {}, days: [] };
const today = () => new Date().toISOString().slice(0, 10);
const keyFor = (id: string | null) => `gv.learn.${id ?? "guest"}`;

function read(id: string | null): Store {
  try {
    return { ...empty, ...(JSON.parse(localStorage.getItem(keyFor(id)) ?? "null") ?? {}) };
  } catch {
    return empty;
  }
}
function write(id: string | null, s: Store) {
  try {
    localStorage.setItem(keyFor(id), JSON.stringify(s));
    window.dispatchEvent(new Event("gv-local"));
  } catch {}
}

export function streakFrom(days: string[]) {
  const set = new Set(days);
  let n = 0;
  const d = new Date();
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1); // today not done yet → count from yesterday
  while (set.has(d.toISOString().slice(0, 10))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function useLearner() {
  const { session, kids, refresh } = useAuth();
  const mode = useLocal(local.mode, null);
  const activeId = useLocal(local.activeChild, null);
  const child = session && mode === "family" ? (kids.find((k) => k.id === activeId) ?? null) : null;
  const storeId = child?.id ?? null;
  const store = useLocal(() => read(storeId), empty);
  const [remoteLoaded, setRemoteLoaded] = useState(false);

  const isFamily = useIsFamily();
  const synced = !!child;

  // Pull server progress for this child into the device copy.
  useEffect(() => {
    if (!child) return;
    let alive = true;
    supabase()
      .from("progress")
      .select("kind,item_id,stars")
      .eq("child_id", child.id)
      .then(({ data }) => {
        if (!alive || !data) return;
        const s = read(child.id);
        for (const r of data) {
          const k = `${r.kind}:${r.item_id}`;
          s.progress[k] = Math.max(s.progress[k] ?? 0, r.stars);
        }
        write(child.id, s);
        setRemoteLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, [child]);

  const isLocked = useCallback(
    (free: boolean) => !free && !isFamily,
    [isFamily],
  );

  /** Save a completed item. Returns "locked" when the server refuses (Free plan). */
  const record = useCallback(
    async (key: string, stars: number): Promise<"ok" | "locked" | "offline"> => {
      const s = read(storeId);
      s.progress[key] = Math.max(s.progress[key] ?? 0, stars);
      if (s.days[s.days.length - 1] !== today()) s.days = [...s.days, today()].slice(-60);
      write(storeId, s);
      if (!child) return "ok";
      const [kind, item] = key.split(":");
      const { error } = await supabase().rpc("record_progress", { p_child: child.id, p_kind: kind, p_item: item, p_stars: stars, p_today: today() });
      if (error) return /LOCKED/.test(error.message) ? "locked" : "offline";
      void refresh(); // pick up the server streak
      return "ok";
    },
    [storeId, child, refresh],
  );

  /** Track right/wrong per letter. Wrong twice → practice list; 3 right in a row → leaves it (U11). */
  const mark = useCallback(
    (letterId: string, correct: boolean) => {
      const s = read(storeId);
      const m = s.mistakes[letterId] ?? { wrong: 0, right: 0 };
      if (correct) m.right += 1;
      else {
        m.wrong += 1;
        m.right = 0;
      }
      if (m.wrong >= 2 && m.right >= 3) delete s.mistakes[letterId];
      else s.mistakes[letterId] = m;
      write(storeId, s);
    },
    [storeId],
  );

  const weak = Object.entries(store.mistakes)
    .filter(([, m]) => m.wrong >= 2)
    .map(([id]) => id);
  const streak = child ? Math.max(child.streak_days, streakFrom(store.days)) : streakFrom(store.days);
  const doneToday = store.days[store.days.length - 1] === today();
  const lettersDone = Object.keys(store.progress).filter((k) => k.startsWith("letter:")).length;

  return { child, synced, remoteLoaded, isFamily, isLocked, progress: store.progress, record, mark, weak, streak, doneToday, lettersDone, freeLetters: FREE_LETTERS };
}
