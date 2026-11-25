"use client";
// Family stats for the parent dashboard (N.7.1): progress + daily activity for every child, read under RLS.
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Activity, Child, Progress } from "@/lib/supabase/types";

export const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** The last `n` days, oldest first, ending today. */
export function lastDays(n: number, today = new Date()) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (n - 1 - i));
    return d;
  });
}

export type ChildStats = {
  child: Child;
  letters: number; // distinct letters completed (all time)
  newLetters: number; // letters first completed in the last 7 days
  sakhisWeek: number;
  minutesWeek: number;
  byDay: Record<string, number>; // day → minutes
};

export function useFamilyStats(kids: Child[]) {
  const [rows, setRows] = useState<{ progress: Progress[]; activity: Activity[] } | null>(null);
  const [error, setError] = useState(false);
  const ids = kids.map((k) => k.id).join(",");

  useEffect(() => {
    if (!ids) return;
    let alive = true;
    const since = dayKey(lastDays(35)[0]);
    const sb = supabase();
    Promise.all([
      sb.from("progress").select("child_id,kind,item_id,stars,completed_at").in("child_id", ids.split(",")),
      sb.from("activity").select("child_id,day,seconds").in("child_id", ids.split(",")).gte("day", since),
    ]).then(([p, a]) => {
      if (!alive) return;
      if (p.error || a.error) setError(true);
      setRows({ progress: (p.data as Progress[]) ?? [], activity: (a.data as Activity[]) ?? [] });
    });
    return () => {
      alive = false;
    };
  }, [ids]);

  const week = new Set(lastDays(7).map(dayKey));
  const stats: ChildStats[] = kids.map((child) => {
    const prog = rows?.progress.filter((r) => r.child_id === child.id) ?? [];
    const act = rows?.activity.filter((r) => r.child_id === child.id) ?? [];
    const letters = prog.filter((r) => r.kind === "letter");
    const inWeek = (iso: string) => week.has(dayKey(new Date(iso)));
    const byDay: Record<string, number> = {};
    for (const r of act) byDay[r.day] = (byDay[r.day] ?? 0) + r.seconds / 60;
    return {
      child,
      letters: new Set(letters.map((r) => r.item_id)).size,
      newLetters: letters.filter((r) => inWeek(r.completed_at)).length,
      sakhisWeek: prog.filter((r) => r.kind === "sakhi" && inWeek(r.completed_at)).length,
      minutesWeek: Math.round(act.filter((r) => week.has(r.day)).reduce((s, r) => s + r.seconds, 0) / 60),
      byDay,
    };
  });
  const totals = {
    minutes: stats.reduce((s, c) => s + c.minutesWeek, 0),
    newLetters: stats.reduce((s, c) => s + c.newLetters, 0),
    sakhis: stats.reduce((s, c) => s + c.sakhisWeek, 0),
    learning: stats.filter((c) => c.minutesWeek > 0 || c.newLetters > 0).length,
  };
  /** Family minutes per day for the chart (unrounded). */
  const familyDays = (n: number) => lastDays(n).map((d) => ({ date: d, minutes: stats.reduce((s, c) => s + (c.byDay[dayKey(d)] ?? 0), 0) }));

  return { loading: !!ids && !rows, error, stats, totals, familyDays };
}
