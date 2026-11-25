"use client";
// N.5.1 Lesson path map (D09): done = green · current = saffron ring · next = outline · Family = gold lock (after letter 10).
import Link from "next/link";
import { Fragment } from "react";
import { Icon } from "@/components/icons";
import { Sheru } from "@/components/sheru/Sheru";
import { ButtonLink } from "@/components/ui/controls";
import { Badge, Progress, TopBar } from "@/components/ui/display";
import { useAuth } from "@/lib/auth";
import { avatarEmoji } from "@/lib/avatars";
import { cn } from "@/lib/cn";
import { local } from "@/lib/local";
import { useLocal } from "@/lib/useLocal";
import { allNodes, progressKey, units, type PathNode } from "./content";
import { useLearner } from "./learner";
import { UnlockCard } from "./Locked";

// Zig-zag offsets (in px) for the path.
const OFFSETS = [0, 56, 84, 56, 0, -56, -84, -56];

function NodeGlyph({ n }: { n: PathNode }) {
  if (n.kind === "letter") return <span lang="pa" className="font-[family-name:var(--font-gurmukhi)] text-[34px] font-bold leading-none">{n.letter.letter}</span>;
  if (n.kind === "review") return <Icon name="star" size={28} />;
  if (n.kind === "practice") return <Icon name="sparkle" size={28} />;
  return <span lang="pa" className="font-[family-name:var(--font-gurmukhi)] text-[24px] font-bold leading-none">{n.glyph}</span>;
}

const nodeLabel = (n: PathNode) =>
  n.kind === "letter" ? `${n.letter.letter} ${n.letter.name}` : n.kind === "review" ? `Unit ${n.unit} review` : n.kind === "practice" ? "Practice" : n.title;

export function LearnHome() {
  const { session } = useAuth();
  const mode = useLocal(local.mode, null);
  const L = useLearner();
  const firstOpen = allNodes.find((n) => !L.progress[progressKey(n)] && !L.isLocked(n.free));
  const needsProfile = session && mode === "family" && !L.child;
  const lettersPct = (L.lettersDone / 35) * 100;

  return (
    <>
      <TopBar
        title="Learn"
        trailing={
          <div className="flex items-center gap-2">
            {L.streak > 0 && <Badge tone="reward" icon="star">{L.streak}-day streak</Badge>}
            {L.child && (
              <Link href="/profile" aria-label={`${L.child.name} — my profile`} className="grid size-10 place-items-center rounded-full bg-brand-soft text-[20px] tab:hidden">
                {avatarEmoji(L.child.avatar)}
              </Link>
            )}
          </div>
        }
      />
      <div className="grid gap-8 px-5 py-6 web:grid-cols-[1fr_320px] web:px-8">
        <div className="flex flex-col gap-6">
          {needsProfile && (
            <div className="flex items-center gap-3 rounded-xl bg-info-bg p-4 text-info">
              <Icon name="users" />
              <p className="flex-1 text-[15px] font-bold">Pick who&apos;s learning so progress is saved to their profile.</p>
              <ButtonLink href="/profiles" size="sm">Choose</ButtonLink>
            </div>
          )}
          {!session && (
            <p className="rounded-xl bg-sunken p-4 text-[14px] text-ink-2">
              Trying it out? Progress is saved on this device. <Link href="/signin" className="font-bold text-brand-text underline">Set up your family</Link> to keep it safe.
            </p>
          )}

          {units.map((u) => {
            const unitLocked = u.nodes.every((n) => L.isLocked(n.free));
            return (
              <section key={u.n} aria-labelledby={`unit-${u.n}`} className="flex flex-col items-center gap-5">
                <div className={cn("flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-white", unitLocked ? "bg-[var(--gold-800)]" : "bg-brand shadow-[0_4px_0_var(--brand-shadow)]")}>
                  <div className="flex-1">
                    <p className="text-caption font-extrabold uppercase tracking-wider opacity-90">{u.title}</p>
                    <h2 id={`unit-${u.n}`} className="text-h3 text-white">
                      <span lang="pa">{u.subtitle}</span>
                    </h2>
                  </div>
                  {unitLocked && <Icon name="lock" />}
                </div>
                <ol className="relative flex flex-col items-center gap-4 py-2">
                  {u.nodes.map((n, k) => {
                    const done = !!L.progress[progressKey(n)];
                    const locked = L.isLocked(n.free);
                    const current = firstOpen?.id === n.id;
                    const stars = L.progress[progressKey(n)] ?? 0;
                    const showLockLine = n.kind === "letter" && n.letter.index === L.freeLetters + 1 && locked;
                    return (
                      <Fragment key={n.id}>
                        {showLockLine && (
                          <li className="flex w-full items-center gap-2 text-caption font-extrabold text-reward" aria-hidden>
                            <span className="h-px flex-1 bg-[var(--gold-500)]" /> Family after 10 letters <span className="h-px flex-1 bg-[var(--gold-500)]" />
                          </li>
                        )}
                        <li style={{ transform: `translateX(${OFFSETS[k % OFFSETS.length]}px)` }} className="relative flex flex-col items-center gap-1">
                          {current && (
                            <span className="absolute -top-9 whitespace-nowrap rounded-lg bg-surface px-3 py-1 text-[13px] font-extrabold text-brand-text shadow-[0_2px_0_var(--border-strong)]">
                              Start
                            </span>
                          )}
                          <Link
                            href={n.href}
                            aria-label={`${nodeLabel(n)}${done ? ", done" : ""}${locked ? ", Family plan" : ""}${current ? ", next lesson" : ""}`}
                            className={cn(
                              "relative grid size-[72px] place-items-center rounded-full transition-transform active:translate-y-1",
                              done && !locked && "bg-green text-white shadow-[0_5px_0_var(--green-800)]",
                              current && "bg-brand text-white shadow-[0_5px_0_var(--brand-shadow)] ring-[6px] ring-brand-soft",
                              !done && !current && !locked && "border-[3px] border-line-strong bg-surface text-ink shadow-[0_5px_0_var(--border-strong)]",
                              locked && "bg-reward-bg text-[var(--gold-800)] shadow-[0_5px_0_var(--gold-500)]",
                            )}
                          >
                            <NodeGlyph n={n} />
                            {locked && (
                              <span className="absolute -right-1 -top-1 grid size-7 place-items-center rounded-full bg-[var(--gold-500)] text-white">
                                <Icon name="lock" size={14} />
                              </span>
                            )}
                          </Link>
                          <span className="text-caption text-ink-2">{n.kind === "letter" ? n.letter.name : nodeLabel(n)}</span>
                          {done && n.kind !== "topic" && (
                            <span className="flex gap-0.5" aria-hidden>
                              {[1, 2, 3].map((s) => (
                                <Icon key={s} name="star" size={12} className={s <= stars ? "fill-[var(--gold-500)] text-[var(--gold-500)]" : "text-line-strong"} />
                              ))}
                            </span>
                          )}
                        </li>
                      </Fragment>
                    );
                  })}
                </ol>
                {u.n === 1 && (
                  <div className="flex items-center gap-3 self-start rounded-xl bg-surface p-3 shadow-[0_2px_0_var(--border-default)] web:hidden">
                    <Sheru mood="happy" size={48} decorative />
                    <p className="text-[14px] font-bold">Tap a circle to start. I&apos;ll help!</p>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Side panel (web) / bottom cards (mobile) */}
        <aside className="flex flex-col gap-4 web:sticky web:top-24 web:self-start">
          <div className="hidden items-center gap-3 rounded-2xl bg-surface p-4 shadow-[0_2px_0_var(--border-default)] web:flex">
            <Sheru mood="cheer" size={64} decorative />
            <p className="text-[15px] font-bold">{L.doneToday ? "You learned today. Wonderful!" : "Ready for today's letter?"}</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-label">Daily goal</p>
            <p className="text-h3">{L.doneToday ? "1 / 1 lesson" : "0 / 1 lesson"}</p>
            <Progress value={L.doneToday ? 100 : 0} label="Daily goal" tone="success" className="mt-2" />
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-h3">{L.streak} day streak</p>
            <p className="text-[14px] text-ink-2">{L.doneToday ? "Come back tomorrow to keep it going." : "Practise today to keep it."}</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-label">Letters learned</p>
            <p className="text-h3">{L.lettersDone} / 35</p>
            <Progress value={lettersPct} label="Letters learned" className="mt-2" />
          </div>
          {!L.isFamily && <UnlockCard />}
        </aside>
      </div>
    </>
  );
}
