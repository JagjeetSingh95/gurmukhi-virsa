"use client";
// N.6.2 Sakhis list + story player (D12): scene art without people, English + Punjabi line, page dots,
// narration when a real recording exists. 2 sakhis free; the rest need the Family plan.
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { Sheru } from "@/components/sheru/Sheru";
import { Button, ButtonLink } from "@/components/ui/controls";
import { useLearner } from "@/features/learn/learner";
import { useIsFamily } from "@/lib/entitlement";
import { cn } from "@/lib/cn";
import { guruById, sakhiById, sakhiHeading, sakhis } from "./content";
import { BackBar, CultureUnlock, LockedPanel, SakhiRow } from "./ui";

export function SakhiList() {
  const isFamily = useIsFamily();
  return (
    <>
      <BackBar title="Sakhis" />
      <div className="flex flex-col gap-5 px-5 py-6 web:px-8">
        <p className="text-body-l text-ink-2">Short true stories from Sikh history, told simply.</p>
        <ul className="grid gap-1 web:grid-cols-2 web:gap-x-6">
          {sakhis.map((s) => (
            <li key={s.id}>
              <SakhiRow sakhi={s} locked={!s.free && !isFamily} />
            </li>
          ))}
        </ul>
        {!isFamily && <CultureUnlock />}
      </div>
    </>
  );
}

const SCENE_BG = ["#FFE7CC", "#E0EEFA", "#DDF3E6", "#FFF1C7", "#E6E9F6", "#FBE3E3"];
const PA_KEY = "gv.sakhi.pa";

export function SakhiPlayer({ id }: { id: string }) {
  const s = sakhiById(id)!;
  const isFamily = useIsFamily();
  const L = useLearner();
  const [page, setPage] = useState(0);
  const [done, setDone] = useState(false);
  const [showPa, setShowPa] = useState(() => {
    try {
      return localStorage.getItem(PA_KEY) !== "0";
    } catch {
      return true;
    }
  });
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const total = s.pages.length;
  const locked = !s.free && !isFamily;

  const go = useCallback(
    (d: number) => {
      if (d > 0 && page === total - 1) {
        setDone(true);
        void L.record(`sakhi:${s.id}`, 3);
        return;
      }
      setPage((p) => Math.max(0, Math.min(total - 1, p + d)));
    },
    [page, total, L, s.id],
  );

  useEffect(() => {
    if (locked || done) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input,textarea")) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, locked, done]);

  const togglePa = () => {
    setShowPa((v) => {
      try {
        localStorage.setItem(PA_KEY, v ? "0" : "1");
      } catch {}
      return !v;
    });
  };
  const toggleAudio = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) void a.play();
    else a.pause();
  };

  if (locked) return <LockedPanel title={sakhiHeading(s)} back="/culture/sakhis" />;

  const guru = guruById(s.guru);

  if (done)
    return (
      <div className="mx-auto flex min-h-dvh max-w-[560px] flex-col items-center justify-center gap-5 px-5 py-10 text-center">
        <Sheru mood="proud" size={160} decorative />
        <h1 className="text-h1">Story complete!</h1>
        <div className="w-full rounded-2xl bg-brand-soft p-5 text-left">
          <p className="text-label uppercase tracking-wider text-brand-text">What we learn</p>
          <p className="mt-1 text-body-l font-bold text-ink">{s.lesson}</p>
        </div>
        <div className="flex w-full flex-col gap-3 tab:flex-row">
          <Button variant="secondary" block onClick={() => { setDone(false); setPage(0); }}>Read again</Button>
          <ButtonLink href="/culture/sakhis" block>More sakhis</ButtonLink>
        </div>
        {guru && (
          <Link href={`/culture/gurus/${guru.id}`} className="text-[15px] font-bold text-brand-text underline">
            About {guru.name}
          </Link>
        )}
      </div>
    );

  const p = s.pages[page];
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[720px] flex-col px-5 pb-6 pt-3">
      <header className="flex items-center gap-3 py-2">
        <Link href="/culture/sakhis" aria-label="Close story" className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-sunken">
          <Icon name="close" />
        </Link>
        <h1 className="flex-1 truncate text-h3">{s.roman}</h1>
        <span className="text-label text-ink-2" aria-live="polite">
          {page + 1} / {total}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-5 py-3">
        <div
          aria-hidden
          className="grid aspect-[4/3] max-h-[44dvh] w-full place-items-center rounded-2xl text-[96px] tab:text-[128px]"
          style={{ background: SCENE_BG[page % SCENE_BG.length] }}
        >
          <span key={page} className="motion-safe:animate-[gv-pop_.4s_ease-out]">{p.scene}</span>
        </div>
        <p className="text-[22px] font-bold leading-snug text-ink tab:text-[26px]">{p.en}</p>
        {showPa && (
          <p lang="pa" className="font-[family-name:var(--font-gurmukhi)] text-[22px] leading-relaxed text-ink-2 tab:text-[24px]">
            {p.pa}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={togglePa}
            aria-pressed={showPa}
            className={cn("flex h-10 items-center gap-2 rounded-full border-2 px-4 text-[14px] font-extrabold", showPa ? "border-navy-600 bg-navy-50 text-navy-800 dark:bg-navy-900 dark:text-navy-50" : "border-line-strong text-ink-2")}
          >
            <span lang="pa" className="font-[family-name:var(--font-gurmukhi)]">ੳ</span> Punjabi
          </button>
          {s.audio ? (
            <>
              <button type="button" onClick={toggleAudio} className="flex h-10 items-center gap-2 rounded-full bg-brand px-4 text-[14px] font-extrabold text-white">
                <Icon name={playing ? "pause" : "volume"} size={18} /> Narration
              </button>
              <audio ref={audio} src={s.audio} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
            </>
          ) : (
            <span className="flex h-10 items-center gap-2 rounded-full bg-sunken px-4 text-[14px] font-bold text-ink-3">
              <Icon name="volume" size={18} /> Narration coming soon
            </span>
          )}
        </div>

        <ol className="flex justify-center gap-2" aria-label="Pages">
          {s.pages.map((_, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => setPage(i)}
                aria-label={`Page ${i + 1}`}
                aria-current={i === page ? "step" : undefined}
                className={cn("block h-2.5 rounded-full transition-all", i === page ? "w-7 bg-brand" : i < page ? "w-2.5 bg-brand/50" : "w-2.5 bg-line-strong")}
              />
            </li>
          ))}
        </ol>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => go(-1)} disabled={page === 0} icon={<Icon name="arrow-left" size={18} />}>
            Back
          </Button>
          <Button onClick={() => go(1)}>{page === total - 1 ? "Finish" : "Next"}</Button>
        </div>
      </div>
    </div>
  );
}
