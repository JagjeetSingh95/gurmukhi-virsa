"use client";
// N.6.3 (D13): The 5 Ks · Gurdwaras (+ detail) · Gurpurab calendar · Gurdwara etiquette (+ quiz).
// Respectful, text-led screens: no drawings of articles of faith, no mascot near them.
import Link from "next/link";
import { useMemo, useState } from "react";
import { ParentGate } from "@/components/gate/ParentGate";
import { Icon } from "@/components/icons";
import { Sheru } from "@/components/sheru/Sheru";
import { Button, Chip } from "@/components/ui/controls";
import { Badge, LockTag } from "@/components/ui/display";
import { QuizTile } from "@/components/ui/feedback";
import { useLearner } from "@/features/learn/learner";
import { useIsFamily } from "@/lib/entitlement";
import { cn } from "@/lib/cn";
import { etiquette, etiquetteQuiz, fiveKs, gurdwaraById, gurdwaras, guruById, gurpurabs, type GurpurabKind } from "./content";
import { BackBar, GuruNumeral, LockedPanel } from "./ui";

/* ---------- The 5 Ks ---------- */
export function FiveKs() {
  return (
    <>
      <BackBar title="The 5 Ks" />
      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-5 px-5 py-6 web:px-8">
        <p className="text-body-l text-ink-2">Five articles of faith worn by initiated Sikhs. Each one starts with the letter <span lang="pa" className="font-[family-name:var(--font-gurmukhi)] font-bold text-ink">ਕ</span>.</p>
        <ul className="grid gap-3 tab:grid-cols-2">
          {fiveKs.map((k, i) => (
            <li key={k.roman} className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-navy-50 text-[16px] font-extrabold text-navy-800 dark:bg-navy-900 dark:text-navy-50">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-baseline gap-x-3">
                  <span lang="pa" className="text-gurmukhi-h text-brand-text">{k.gurmukhi}</span>
                  <span className="text-[18px] font-extrabold text-ink">{k.roman}</span>
                </p>
                <p className="text-[15px] text-ink-2">{k.meaning}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="flex gap-2 rounded-xl bg-sunken p-4 text-[14px] text-ink-2">
          <Icon name="info" size={18} className="mt-0.5 shrink-0" />
          Shown as words only — articles of faith are treated with respect and never drawn on animals or used as jokes.
        </p>
      </div>
    </>
  );
}

/* ---------- Gurdwaras ---------- */
type GFilter = "historic" | "takht" | "near";

export function GurdwaraList() {
  const isFamily = useIsFamily();
  const [filter, setFilter] = useState<GFilter>("historic");
  const [gate, setGate] = useState(false);
  const list = gurdwaras.filter((g) => (filter === "takht" ? g.tags.includes("takht") : true));

  return (
    <>
      <BackBar title="Gurdwaras" />
      <div className="flex flex-col gap-5 px-5 py-6 web:px-8">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter">
          <Chip selected={filter === "historic"} onClick={() => setFilter("historic")}>Historic</Chip>
          <Chip selected={filter === "takht"} onClick={() => setFilter("takht")}>5 Takhts</Chip>
          <Chip selected={filter === "near"} onClick={() => setFilter("near")}>Near me</Chip>
        </div>

        {filter === "near" ? (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface p-5">
            <Icon name="pin" size={28} className="text-brand-text" />
            <p className="text-h3">Find a Gurdwara near you</p>
            <p className="text-[15px] text-ink-2">Opens a map in a new tab. We don&apos;t collect your location. A grown-up needs to say OK first.</p>
            <Button size="sm" onClick={() => setGate(true)}>Open map</Button>
            <ParentGate
              open={gate}
              reason="This opens another website."
              onClose={() => setGate(false)}
              onPass={() => {
                setGate(false);
                window.open("https://www.google.com/maps/search/gurdwara", "_blank", "noopener,noreferrer");
              }}
            />
          </div>
        ) : (
          <ul className="grid gap-3 tab:grid-cols-2">
            {list.map((g) => {
              const locked = !g.free && !isFamily;
              return (
                <li key={g.id}>
                  <Link href={`/culture/gurdwaras/${g.id}`} className="flex h-full items-center gap-4 rounded-2xl border border-line bg-surface p-4 hover:bg-sunken">
                    <span aria-hidden className={cn("grid size-12 shrink-0 place-items-center rounded-xl", locked ? "bg-reward-bg text-reward" : "bg-brand-soft text-brand-text")}>
                      <Icon name="culture" size={24} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-extrabold text-ink">{g.name}</span>
                      <span className="flex items-center gap-1 text-caption text-ink-2">
                        <Icon name="pin" size={13} /> {g.place}
                      </span>
                    </span>
                    {locked ? <LockTag /> : g.free && !isFamily ? <Badge tone="success">Free</Badge> : <Icon name="chevron-right" size={20} className="text-ink-3" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

export function GurdwaraDetail({ id }: { id: string }) {
  const g = gurdwaraById(id)!;
  const isFamily = useIsFamily();
  if (!g.free && !isFamily) return (<><BackBar title="Gurdwaras" back="/culture/gurdwaras" /><LockedPanel title={g.name} back="/culture/gurdwaras" /></>);
  const guru = g.guru ? guruById(g.guru) : undefined;
  return (
    <>
      <BackBar title={g.name} back="/culture/gurdwaras" />
      <article className="mx-auto flex w-full max-w-[880px] flex-col gap-5 px-5 py-6 web:px-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-h1">{g.name}</h1>
          <p lang="pa" className="text-gurmukhi-h text-ink-2">{g.gurmukhi}</p>
          <p className="flex items-center gap-1 text-label text-ink-2"><Icon name="pin" size={16} /> {g.place}</p>
          {g.tags.includes("takht") && <Badge tone="navy" className="mt-1 w-fit">One of the 5 Takhts</Badge>}
        </header>
        <ul className="flex flex-col gap-2">
          {g.about.map((a) => (
            <li key={a} className="flex gap-3 rounded-xl bg-sunken p-4 text-body">
              <Icon name="star" size={20} className="mt-0.5 shrink-0 text-[var(--gold-500)]" />
              {a}
            </li>
          ))}
        </ul>
        {guru && (
          <Link href={`/culture/gurus/${guru.id}`} className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 hover:bg-sunken">
            <GuruNumeral guru={guru} />
            <span className="flex-1">
              <span className="block text-caption text-ink-2">Linked to</span>
              <span className="block text-[16px] font-extrabold">{guru.name}</span>
            </span>
            <Icon name="chevron-right" size={20} className="text-ink-3" />
          </Link>
        )}
        <Link href="/culture/etiquette" className="text-[15px] font-bold text-brand-text underline">Visiting a Gurdwara? Read the etiquette</Link>
      </article>
    </>
  );
}

/* ---------- Gurpurab calendar ---------- */
const KIND_LABEL: Record<GurpurabKind, string> = { gurpurab: "Gurpurabs", shaheedi: "Shaheedi divas", festival: "Festivals" };
const KIND_DOT: Record<GurpurabKind, string> = { gurpurab: "bg-brand", shaheedi: "bg-navy-600", festival: "bg-green" };
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function GurpurabCalendar() {
  const now = new Date();
  const [month, setMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [kind, setKind] = useState<GurpurabKind | "all">("all");
  const events = gurpurabs.filter((e) => kind === "all" || e.kind === kind);

  // Dates come from the chosen calendar source per year (Nanakshahi / Bikrami) — null until filled.
  const dated = useMemo(() => {
    const m = new Map<string, typeof events>();
    for (const e of events) for (const d of Object.values(e.dates)) m.set(d, [...(m.get(d) ?? []), e]);
    return m;
  }, [events]);

  const y = month.getFullYear();
  const mo = month.getMonth();
  const lead = (new Date(y, mo, 1).getDay() + 6) % 7; // Monday first
  const days = new Date(y, mo + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const todayIso = iso(now);
  const eventDate = (e: (typeof events)[number]) => e.dates[String(y)] ?? Object.values(e.dates)[0];

  return (
    <>
      <BackBar title="Gurpurab calendar" />
      <div className="grid gap-6 px-5 py-6 web:grid-cols-[minmax(0,420px)_1fr] web:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Show">
            <Chip selected={kind === "all"} onClick={() => setKind("all")}>All</Chip>
            {(Object.keys(KIND_LABEL) as GurpurabKind[]).map((k) => (
              <Chip key={k} selected={kind === k} onClick={() => setKind(k)}>{KIND_LABEL[k]}</Chip>
            ))}
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <button type="button" aria-label="Previous month" onClick={() => setMonth(new Date(y, mo - 1, 1))} className="grid size-10 place-items-center rounded-full hover:bg-sunken">
                <Icon name="chevron-left" />
              </button>
              <p className="text-h3" aria-live="polite">{month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
              <button type="button" aria-label="Next month" onClick={() => setMonth(new Date(y, mo + 1, 1))} className="grid size-10 place-items-center rounded-full hover:bg-sunken">
                <Icon name="chevron-right" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center" role="grid" aria-label="Month">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={i} className="py-1 text-caption text-ink-3" aria-hidden>{d}</span>
              ))}
              {cells.map((d, i) => {
                if (!d) return <span key={i} />;
                const key = iso(new Date(y, mo, d));
                const ev = dated.get(key);
                return (
                  <span
                    key={i}
                    role="gridcell"
                    aria-label={ev ? `${d}: ${ev.map((e) => e.title).join(", ")}` : undefined}
                    className={cn("relative grid aspect-square place-items-center rounded-full text-[15px] font-bold", key === todayIso && "bg-brand text-white", ev && key !== todayIso && "bg-brand-soft text-brand-text")}
                  >
                    {d}
                    {ev && <span className={cn("absolute bottom-1 size-1.5 rounded-full", KIND_DOT[ev[0].kind])} />}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-h3">Important days</h2>
          <ul className="flex flex-col gap-2">
            {events.map((e) => {
              const d = eventDate(e);
              const g = e.guru ? guruById(e.guru) : undefined;
              return (
                <li key={e.id} className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4">
                  <span className={cn("h-10 w-1.5 shrink-0 rounded-full", KIND_DOT[e.kind])} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] font-extrabold text-ink">{e.title}</span>
                    <span className="block text-caption text-ink-2">
                      {d ? new Date(`${d}T00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" }) : `${e.when} · date to be confirmed`}
                    </span>
                  </span>
                  {g && (
                    <Link href={`/culture/gurus/${g.id}`} aria-label={`About ${g.name}`} className="rounded-full p-1 hover:bg-sunken">
                      <GuruNumeral guru={g} />
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="flex gap-2 rounded-xl bg-sunken p-4 text-[14px] text-ink-2">
            <Icon name="calendar" size={18} className="mt-0.5 shrink-0" />
            Dates are filled each year from the Sikh calendar. Morning-of reminders will be optional for each family.
          </p>
        </div>
      </div>
    </>
  );
}

/* ---------- Etiquette + quiz ---------- */
function shuffled<T>(a: T[]) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export function Etiquette() {
  const [quiz, setQuiz] = useState(false);
  return (
    <>
      <BackBar title={quiz ? "Etiquette quiz" : "Gurdwara etiquette"} />
      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-5 px-5 py-6 web:px-8">
        {quiz ? (
          <EtiquetteQuiz onExit={() => setQuiz(false)} />
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Sheru mood="think" size={56} decorative />
              <p className="text-body-l font-bold">Visiting the Gurdwara? Here&apos;s how to show respect.</p>
            </div>
            <ul className="grid gap-3 tab:grid-cols-2">
              {etiquette.map((r) => (
                <li key={r.title} className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-text" aria-hidden>
                    <Icon name={r.icon} size={24} />
                  </span>
                  <span>
                    <span className="block text-[17px] font-extrabold text-ink">{r.title}</span>
                    <span className="block text-[14px] text-ink-2">{r.body}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Button className="self-start" onClick={() => setQuiz(true)}>Take the quiz</Button>
          </>
        )}
      </div>
    </>
  );
}

function EtiquetteQuiz({ onExit }: { onExit: () => void }) {
  const L = useLearner();
  const [qs] = useState(() =>
    etiquetteQuiz.map((q) => {
      const opts = shuffled(q.options.map((o, i) => ({ o, right: i === q.answer })));
      return { q: q.q, options: opts.map((x) => x.o), answer: opts.findIndex((x) => x.right) };
    }),
  );
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const done = i >= qs.length;

  const choose = (k: number) => {
    if (pick !== null) return;
    setPick(k);
    if (k === qs[i].answer) setScore((s) => s + 1);
  };
  const next = () => {
    setPick(null);
    const n = i + 1;
    setI(n);
    if (n >= qs.length) {
      const final = score;
      void L.record("quiz:etiquette", final === qs.length ? 3 : final >= qs.length - 1 ? 2 : 1);
    }
  };

  if (done)
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <Sheru mood={score === qs.length ? "proud" : "cheer"} size={120} decorative />
        <h2 className="text-h1">{score} / {qs.length}</h2>
        <p className="text-body-l text-ink-2">{score === qs.length ? "Perfect! You know how to show respect." : "Well done! Read the tips again and try once more."}</p>
        <Button variant="secondary" onClick={onExit}>Back to etiquette</Button>
      </div>
    );

  const q = qs[i];
  return (
    <div className="flex flex-col gap-4">
      <p className="text-label text-ink-2">Question {i + 1} of {qs.length}</p>
      <h2 className="text-h2">{q.q}</h2>
      <div className="grid gap-3">
        {q.options.map((o, k) => (
          <QuizTile key={o} index={k + 1} label={o} onClick={() => choose(k)} state={pick === null ? "idle" : k === q.answer ? "correct" : k === pick ? "wrong" : "idle"} />
        ))}
      </div>
      {pick !== null && (
        <div className={cn("flex items-center gap-3 rounded-xl p-4", pick === q.answer ? "bg-success-bg text-success" : "bg-error-bg text-error")} role="status">
          <Icon name={pick === q.answer ? "check" : "info"} />
          <p className="flex-1 font-bold">{pick === q.answer ? "That's right!" : `It's: ${q.options[q.answer]}`}</p>
          <Button size="sm" onClick={next}>{i === qs.length - 1 ? "Finish" : "Next"}</Button>
        </div>
      )}
    </div>
  );
}
