"use client";
// N.7.2 Child progress detail (D14, U05): letters, streak, today vs goal, current unit, letter grid,
// needs practice (from this device's practice list), recent activity. Free plan: letters + streak only.
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/controls";
import { Badge, LockTag, Progress } from "@/components/ui/display";
import { Skeleton } from "@/components/ui/feedback";
import { sakhiById } from "@/features/culture/content";
import { allNodes, letterById, letters, units } from "@/features/learn/content";
import { useAuth } from "@/lib/auth";
import { avatarEmoji } from "@/lib/avatars";
import { cn } from "@/lib/cn";
import { useIsFamily } from "@/lib/entitlement";
import { supabase } from "@/lib/supabase/client";
import type { Activity, Progress as Row } from "@/lib/supabase/types";
import { dayKey } from "./stats";

const AVATAR_BG = ["#FFE7CC", "#E6E9F6", "#DDF3E6", "#FFF1C7", "#E0EEFA", "#FBE3E3"];

/** Letters this child got wrong twice on this device (Learn practice list, U11). */
function weakOnDevice(childId: string): string[] {
  try {
    const s = JSON.parse(localStorage.getItem(`gv.learn.${childId}`) ?? "null");
    return Object.entries((s?.mistakes ?? {}) as Record<string, { wrong: number }>)
      .filter(([, m]) => m.wrong >= 2)
      .map(([id]) => id);
  } catch {
    return [];
  }
}

function label(r: Row) {
  if (r.kind === "letter") {
    const l = letterById(r.item_id);
    return l ? `Letter ${l.letter} ${l.name} — ${r.stars} star${r.stars === 1 ? "" : "s"}` : "Letter";
  }
  if (r.kind === "sakhi") return `Sakhi: ${sakhiById(r.item_id)?.roman ?? r.item_id}`;
  if (r.kind === "quiz") return r.item_id === "etiquette" ? "Gurdwara etiquette quiz" : "Quiz";
  if (r.kind === "lesson") {
    const n = allNodes.find((x) => x.id === r.item_id);
    return n?.kind === "review" ? `Unit ${n.unit} review` : n?.kind === "topic" ? n.title : n?.kind === "practice" ? "Practice" : "Lesson";
  }
  return "Paath";
}

function when(iso: string) {
  const d = new Date(iso);
  const days = Math.round((new Date(new Date().toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 86_400_000);
  return days === 0 ? "Today" : days === 1 ? "Yesterday" : days < 7 ? d.toLocaleDateString("en-GB", { weekday: "short" }) : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function ChildDetail({ id }: { id: string }) {
  const { kids } = useAuth();
  const isFamily = useIsFamily();
  const child = kids.find((k) => k.id === id);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [today, setToday] = useState(0);
  const [weak] = useState(() => weakOnDevice(id));

  useEffect(() => {
    let alive = true;
    const sb = supabase();
    Promise.all([
      sb.from("progress").select("*").eq("child_id", id).order("completed_at", { ascending: false }),
      sb.from("activity").select("child_id,day,seconds").eq("child_id", id).eq("day", dayKey(new Date())),
    ]).then(([p, a]) => {
      if (!alive) return;
      setRows((p.data as Row[]) ?? []);
      setToday(Math.round(((a.data as Activity[])?.[0]?.seconds ?? 0) / 60));
    });
    return () => {
      alive = false;
    };
  }, [id]);

  if (!child)
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-body-l">We couldn&apos;t find this child.</p>
        <ButtonLink href="/parent" size="sm">Back to dashboard</ButtonLink>
      </div>
    );

  const done = new Set((rows ?? []).filter((r) => r.kind === "letter").map((r) => r.item_id));
  const unit = units.slice(0, 7).find((u) => u.nodes.some((n) => n.kind === "letter" && !done.has(n.id))) ?? units[6];
  const unitLetters = unit.nodes.filter((n) => n.kind === "letter");
  const unitPct = (unitLetters.filter((n) => done.has(n.id)).length / unitLetters.length) * 100;
  const goal = child.daily_goal_min ?? 5;

  return (
    <>
      <header className="flex items-center gap-4">
        <span className="grid size-16 place-items-center rounded-2xl text-[34px]" style={{ background: AVATAR_BG[child.color_index % AVATAR_BG.length] }} aria-hidden>
          {avatarEmoji(child.avatar)}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-h1">{child.name}</h1>
          <p className="text-label text-ink-2">Age {child.age_band.replace("-", "–")}</p>
        </div>
        <ButtonLink href={`/parent/child/edit?id=${id}`} size="sm" variant="secondary">Edit</ButtonLink>
      </header>

      <ul className="grid grid-cols-3 gap-3">
        <Stat value={rows ? `${done.size}/35` : "…"} label="letters" />
        <Stat value={String(child.streak_days)} label="day streak" />
        {isFamily ? <Stat value={`${today}/${goal} min`} label="today's goal" /> : <li className="grid place-items-center rounded-2xl border border-line bg-surface p-3"><LockTag /></li>}
      </ul>

      <section className="rounded-2xl border border-line bg-surface p-5" aria-labelledby="unit-h">
        <div className="flex justify-between">
          <h2 id="unit-h" className="text-h3">{unit.title} · <span lang="pa">{unit.subtitle.replace("Letters ", "")}</span></h2>
          <span className="text-label">{Math.round(unitPct)}%</span>
        </div>
        <Progress value={unitPct} label={`${unit.title} progress`} className="mt-3" />
      </section>

      <section aria-labelledby="letters-h" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="letters-h" className="text-h3">Letters</h2>
          <div className="flex gap-3 text-caption text-ink-2">
            <span className="flex items-center gap-1"><span className="size-3 rounded bg-green" /> Learned</span>
            {isFamily && <span className="flex items-center gap-1"><span className="size-3 rounded bg-[var(--gold-500)]" /> Needs practice</span>}
            <span className="flex items-center gap-1"><span className="size-3 rounded border border-line-strong" /> Not yet</span>
          </div>
        </div>
        {rows ? (
          <ul className="grid grid-cols-7 gap-2 tab:grid-cols-[repeat(12,minmax(0,1fr))]">
            {letters.map((l) => {
              const isWeak = isFamily && weak.includes(l.id);
              const isDone = done.has(l.id);
              return (
                <li
                  key={l.id}
                  lang="pa"
                  aria-label={`${l.name}: ${isWeak ? "needs practice" : isDone ? "learned" : "not yet"}`}
                  className={cn(
                    "grid aspect-square place-items-center rounded-xl font-[family-name:var(--font-gurmukhi)] text-[22px] font-bold",
                    isWeak ? "bg-reward-bg text-reward ring-2 ring-[var(--gold-500)]" : isDone ? "bg-success-bg text-success" : "border border-line text-ink-3",
                  )}
                >
                  {l.letter}
                </li>
              );
            })}
          </ul>
        ) : (
          <Skeleton className="h-40 w-full" />
        )}
      </section>

      {isFamily ? (
        <>
          <section aria-labelledby="weak-h" className="rounded-2xl border border-line bg-surface p-5">
            <h2 id="weak-h" className="text-h3">Needs practice</h2>
            {weak.length ? (
              <>
                <p lang="pa" className="mt-2 font-[family-name:var(--font-gurmukhi)] text-[32px] font-bold text-reward">{weak.map((w) => letterById(w)?.letter).join("  ")}</p>
                <p className="text-[14px] text-ink-2">These appear in Practice on the Learn path. Practise them together.</p>
              </>
            ) : (
              <p className="mt-1 text-[15px] text-ink-2">Nothing to practise right now. (Practice is tracked on the device {child.name} learns on.)</p>
            )}
          </section>
          <section aria-labelledby="recent-h" className="flex flex-col gap-2">
            <h2 id="recent-h" className="text-h3">Recent</h2>
            {rows && rows.length === 0 && <p className="text-[15px] text-ink-2">No activity yet. {child.name}&apos;s first lesson takes 3 minutes.</p>}
            <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface">
              {(rows ?? []).slice(0, 8).map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                  <Icon name={r.kind === "sakhi" ? "book" : r.kind === "letter" ? "letter" : "star"} size={20} className="text-brand-text" />
                  <span className="flex-1 text-[15px] font-bold">{label(r)}</span>
                  <span className="text-caption text-ink-2">{when(r.completed_at)}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <div className="flex flex-col items-start gap-3 rounded-2xl border-2 border-[var(--gold-500)] bg-reward-bg p-5">
          <Badge tone="reward" icon="lock">Family plan</Badge>
          <p className="text-h3">See what {child.name} finds hard</p>
          <p className="text-[15px] text-ink-2">Letters to practise, daily goal and recent activity come with the Family plan.</p>
          <Link href="/pricing" className="text-[15px] font-bold text-brand-text underline">See plans</Link>
        </div>
      )}
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <li className="flex flex-col items-center rounded-2xl border border-line bg-surface p-3 text-center">
      <span className="text-h3">{value}</span>
      <span className="text-caption text-ink-2">{label}</span>
    </li>
  );
}
