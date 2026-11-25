"use client";
// Lesson complete (D10): stars, XP, accuracy, time, streak week, badge.
import { useEffect } from "react";
import { Icon } from "@/components/icons";
import { Sheru } from "@/components/sheru/Sheru";
import { Badge } from "@/components/ui/display";
import { ButtonLink } from "@/components/ui/controls";
import { cn } from "@/lib/cn";
import { tone } from "./sound";

export const starsFor = (correct: number, total: number) => (total === 0 ? 3 : correct / total >= 0.9 ? 3 : correct / total >= 0.6 ? 2 : 1);

export function Complete({
  correct,
  total,
  ms,
  streak,
  badge,
  note,
  next,
}: {
  correct: number;
  total: number;
  ms: number;
  streak: number;
  badge?: string | null;
  note?: string | null;
  next: { href: string; label: string };
}) {
  const stars = starsFor(correct, total);
  const acc = total ? Math.round((correct / total) * 100) : 100;
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const todayIdx = (new Date().getDay() + 6) % 7;
  useEffect(() => tone("done"), []);
  return (
    <div className="flex flex-1 flex-col items-center gap-5 pt-4 text-center animate-pop">
      <Sheru mood="proud" size={160} />
      <h1 className="text-h1">Lesson complete!</h1>
      <div className="flex gap-2" aria-label={`${stars} of 3 stars`}>
        {[1, 2, 3].map((s) => (
          <Icon key={s} name="star" size={40} className={s <= stars ? "fill-[var(--gold-500)] text-[var(--gold-500)]" : "text-line-strong"} />
        ))}
      </div>
      <div className="grid w-full grid-cols-3 gap-3">
        {[
          ["XP", `+${10 + stars * 5}`],
          ["Accuracy", `${acc}%`],
          ["Time", `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-line bg-surface p-3">
            <p className="text-caption uppercase tracking-wide text-ink-3">{k}</p>
            <p className="text-h3">{v}</p>
          </div>
        ))}
      </div>
      <div className="w-full rounded-xl bg-reward-bg p-4">
        <p className="text-h3 text-reward">{streak} day streak!</p>
        <div className="mt-2 flex justify-center gap-2">
          {days.map((d, k) => (
            <span key={k} className={cn("grid size-8 place-items-center rounded-full text-[12px] font-extrabold", k <= todayIdx && k > todayIdx - Math.min(streak, 7) ? "bg-gold text-white" : "bg-surface text-ink-3")}>
              {d}
            </span>
          ))}
        </div>
      </div>
      {badge && (
        <Badge tone="brand" icon="star" className="!px-4 !py-2 !text-[14px]">
          New badge: {badge}
        </Badge>
      )}
      {note && <p className="text-caption text-ink-2">{note}</p>}
      <div className="mt-auto w-full">
        <ButtonLink href={next.href} block>
          {next.label}
        </ButtonLink>
      </div>
    </div>
  );
}
