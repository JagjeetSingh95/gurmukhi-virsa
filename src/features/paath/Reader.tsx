"use client";
// N.4.2 Reader Adult (D07) · N.4.3 Audio + line sync + keys · N.4.4 Reader Kids (D08) · N.4.5 bookmarks.
// Calm and plain: no mascot or decoration anywhere near Gurbani (D.4).
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/controls";
import { useToast } from "@/components/ui/feedback";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { local } from "@/lib/local";
import { useLocal } from "@/lib/useLocal";
import { fmtTime, lineAtTime, repeatRange } from "./audio";
import { readReaderMode, writeRecent, type ReaderMode } from "./recent";
import { ReaderSettingsSheet } from "./ReaderSettingsSheet";
import { useSaved } from "./saved";
import { sizes, useReaderSettings, writeSettings } from "./settings";

export type ReaderLine = {
  i: number;
  id: string;
  kind: "heading" | "line";
  section: number;
  gurmukhi: string;
  roman: string;
  en: string | null;
  pa: string | null;
  enKids: string | null;
  audio: { start: number; end: number } | null;
  words: { g: string; r: string }[];
};

type Props = {
  slug: string;
  title: string;
  gurmukhiTitle: string;
  lines: ReaderLine[];
  lineCount: number;
  sectionLabels: Record<number, string>;
  audioUrl: string | null;
  prev: { href: string; label: string } | null;
  next: { href: string; label: string } | null;
};

/** ੴ needs Noto Sans Gurmukhi; everything else uses the Gurbani font. */
function G({ text }: { text: string }) {
  if (!text.startsWith("ੴ")) return <>{text}</>;
  return (
    <>
      <span style={{ fontFamily: '"Noto Sans Gurmukhi", sans-serif' }}>ੴ</span>
      {text.slice(1)}
    </>
  );
}

export function Reader({ slug, title, gurmukhiTitle, lines, lineCount, sectionLabels, audioUrl, prev, next }: Props) {
  const router = useRouter();
  const toast = useToast();
  const settings = useReaderSettings();
  const { session } = useAuth();
  const appMode = useLocal(local.mode, null);
  const activeChild = useLocal(local.activeChild, null);
  const storedMode = useLocal(readReaderMode, null);
  const mode: ReaderMode = storedMode ?? (appMode === "family" && session && activeChild ? "kids" : "adult");
  const kids = mode === "kids";
  const lineView = kids && settings.kidsView === "line";
  const saved = useSaved();

  const readable = useMemo(() => lines.filter((l) => l.kind === "line"), [lines]);
  const [current, setCurrent] = useState<number>(readable[0]?.i ?? 0);
  const [sheet, setSheet] = useState(false);
  const [bedtimeNote, setBedtimeNote] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const hasAudio = !!audioUrl;
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cur = lines.find((l) => l.i === current) ?? readable[0];
  const curReadableIdx = readable.findIndex((l) => l.i === current);

  // Deep link (#l12) and bedtime entry (?bedtime=1).
  useEffect(() => {
    const m = /^#l(\d+)$/.exec(window.location.hash);
    if (m && lines.some((l) => l.i === Number(m[1]))) {
      const n = Number(m[1]);
      setCurrent(n); // eslint-disable-line react-hooks/set-state-in-effect
      requestAnimationFrame(() => document.getElementById(`l${n}`)?.scrollIntoView({ block: "center" }));
    }
    if (new URLSearchParams(window.location.search).has("bedtime")) setBedtimeNote(true);
  }, [lines]);

  // Remember position for "Continue reading".
  useEffect(() => {
    if (!cur) return;
    writeRecent({ slug, title, lineIndex: cur.i, lineCount, section: cur.section, preview: cur.gurmukhi, at: Date.now() });
  }, [cur, slug, title, lineCount]);

  const go = useCallback(
    (delta: number) => {
      const idx = Math.min(readable.length - 1, Math.max(0, curReadableIdx + delta));
      const target = readable[idx];
      if (!target) return;
      setCurrent(target.i);
      if (!lineView) document.getElementById(`l${target.i}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
      if (target.audio && audioRef.current) audioRef.current.currentTime = target.audio.start;
    },
    [readable, curReadableIdx, lineView],
  );

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!hasAudio || !a) return toast("Audio is coming soon — recorded by real voices.", "info");
    if (a.paused) {
      if (cur?.audio && (a.currentTime < cur.audio.start || a.currentTime >= cur.audio.end)) a.currentTime = cur.audio.start;
      void a.play().catch(() => toast("Couldn't play audio.", "error"));
    } else a.pause();
  }, [hasAudio, cur, toast]);

  // Keyboard (U.8): ↑↓ line · Space play · "," settings · "/" search · Esc closes (native dialog).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, dialog, [contenteditable=true]") || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowDown" || e.key === "j" || (lineView && e.key === "ArrowRight")) {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowUp" || e.key === "k" || (lineView && e.key === "ArrowLeft")) {
        e.preventDefault();
        go(-1);
      } else if (e.key === " ") {
        if (t.closest("button, a")) return;
        e.preventDefault();
        togglePlay();
      } else if (e.key === ",") setSheet(true);
      else if (e.key === "/") {
        e.preventDefault();
        router.push("/paath/search");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, togglePlay, router, lineView]);

  // Audio: speed, line sync, repeat, bedtime timer.
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = settings.speed;
  }, [settings.speed]);

  const onTime = () => {
    const a = audioRef.current;
    if (!a) return;
    setTime(a.currentTime);
    if (settings.repeat !== "off") {
      const r = repeatRange(lines, current, settings.repeat);
      if (r && a.currentTime >= r[1]) {
        a.currentTime = r[0];
        return;
      }
    }
    const at = lineAtTime(lines, a.currentTime);
    if (at !== null && at !== current) {
      setCurrent(at);
      if (!lineView) document.getElementById(`l${at}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!playing || (settings.timer !== "15" && settings.timer !== "30")) return;
    const t = setTimeout(() => {
      audioRef.current?.pause();
      toast("Sleep timer finished. Waheguru.", "info");
    }, Number(settings.timer) * 60_000);
    return () => clearTimeout(t);
  }, [playing, settings.timer, toast]);

  // Long-press a line to bookmark it (U.11).
  const startPress = (l: ReaderLine) => {
    pressTimer.current = setTimeout(() => {
      pressTimer.current = null;
      void toggleBookmark(l);
    }, 550);
  };
  const cancelPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };
  const toggleBookmark = async (l: ReaderLine) => {
    const was = saved.isBookmarked(slug, l.id);
    await saved.toggle(slug, l.id);
    toast(was ? "Bookmark removed" : saved.synced ? "Line saved" : "Line saved on this device", was ? "info" : "success");
  };

  const gSize = (kids ? sizes.kids : sizes.adult)[settings.size];
  const meaning = (l: ReaderLine) => (kids ? (l.enKids ?? l.en) : l.en);
  const sectionTitle = cur ? sectionLabels[cur.section] : undefined;
  const fav = saved.favourites.includes(slug);

  return (
    <article className="pb-40">
      <header className="sticky top-0 z-20 flex h-14 items-center gap-1 border-b border-line bg-app/95 px-2 backdrop-blur web:h-16 web:px-6">
        <Link href="/paath" className="grid size-11 place-items-center rounded-full hover:bg-sunken" aria-label="Back to library">
          <Icon name="arrow-right" className="rotate-180" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-h3">{title}</h1>
          <p className="truncate text-caption text-ink-2">
            <span lang="pa" className="font-[family-name:var(--font-gurbani)] text-[13px] text-gurbani">{gurmukhiTitle}</span>
            {sectionTitle && ` · ${sectionTitle}`}
            {kids && " · Kids"}
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await saved.setFavourite(slug, !fav);
            toast(fav ? "Removed from favourites" : "Pinned to the top of Paath", fav ? "info" : "success");
          }}
          className={cn("grid size-11 place-items-center rounded-full hover:bg-sunken", fav ? "text-brand-text" : "text-ink-2")}
          aria-pressed={fav}
          aria-label={fav ? "Remove from favourites" : "Add to favourites"}
        >
          <Icon name={fav ? "heart-on" : "heart"} />
        </button>
        <button type="button" onClick={() => setSheet(true)} className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-sunken" aria-label="Reading settings (,)">
          <Icon name="settings" />
        </button>
      </header>

      {bedtimeNote && (
        <div className="mx-auto mt-4 flex max-w-[760px] items-center gap-3 rounded-xl bg-navy-800 px-4 py-3 text-white dark:bg-navy-900 web:mx-auto">
          <Icon name="moon" className="shrink-0 text-saffron-300" />
          <p className="flex-1 text-[14px] font-bold">Bedtime Paath. Dim your screen and read slowly.</p>
          <button type="button" className="text-[14px] font-extrabold text-saffron-300 underline" onClick={() => { writeSettings({ timer: "end" }); setBedtimeNote(false); setSheet(true); }}>
            Sleep timer
          </button>
        </div>
      )}

      {lineView && cur ? (
        <KidsLineView
          line={cur}
          index={curReadableIdx}
          total={readable.length}
          size={gSize}
          showRoman={settings.roman}
          bookmarked={saved.isBookmarked(slug, cur.id)}
          onBookmark={() => toggleBookmark(cur)}
          onListen={togglePlay}
          onPrev={() => go(-1)}
          onNext={() => go(1)}
          hasAudio={hasAudio}
          G={G}
        />
      ) : (
        <div className="mx-auto flex max-w-[760px] flex-col px-3 py-5 web:px-8">
          {lines.map((l, k) => {
            const showSection = sectionLabels[l.section] && (k === 0 || lines[k - 1].section !== l.section);
            if (l.kind === "heading")
              return (
                <div key={l.id} id={`l${l.i}`} data-line={l.i} data-section={l.section}>
                  {showSection && <h2 className="mb-1 mt-8 px-2 text-label uppercase tracking-wider text-ink-3 first:mt-0">{sectionLabels[l.section].replace(/ of \d+$/, "")}</h2>}
                  <p lang="pa" className="mb-1 mt-5 text-center font-[family-name:var(--font-gurbani)] text-[18px] font-semibold text-ink-2">
                    <G text={l.gurmukhi} />
                  </p>
                </div>
              );
            const on = l.i === current;
            const marked = saved.isBookmarked(slug, l.id);
            return (
              <div key={l.id} id={`l${l.i}`} data-line={l.i} data-section={l.section} className="scroll-mt-24">
                {showSection && <h2 className="mb-1 mt-8 px-2 text-label uppercase tracking-wider text-ink-3 first:mt-0">{sectionLabels[l.section].replace(/ of \d+$/, "")}</h2>}
                <div
                  role="button"
                  tabIndex={0}
                  aria-current={on || undefined}
                  aria-label={`Line ${k + 1}${marked ? ", bookmarked" : ""}`}
                  onClick={() => {
                    setCurrent(l.i);
                    if (l.audio && audioRef.current) audioRef.current.currentTime = l.audio.start;
                  }}
                  onKeyDown={(e) => e.key === "Enter" && setCurrent(l.i)}
                  onPointerDown={() => startPress(l)}
                  onPointerUp={cancelPress}
                  onPointerLeave={cancelPress}
                  onContextMenu={(e) => e.preventDefault()}
                  className={cn(
                    "group relative flex cursor-pointer flex-col gap-1 rounded-lg px-3 py-3 pr-12 transition-colors web:px-4",
                    on ? "bg-hl" : "hover:bg-sunken/60",
                    kids && "py-4",
                  )}
                >
                  <p lang="pa" className="font-[family-name:var(--font-gurbani)] leading-[1.55] text-gurbani" style={{ fontSize: gSize, fontWeight: kids ? 600 : 500 }}>
                    <G text={l.gurmukhi} />
                  </p>
                  {settings.roman && <p className={cn("font-semibold italic text-ink-2", kids ? "text-[18px]" : "text-[15px]")}>{l.roman}</p>}
                  {settings.en && meaning(l) && <p className={cn("text-ink-2", kids ? "text-[17px]" : "text-[15px]")}>{meaning(l)}</p>}
                  {settings.pa && l.pa && (
                    <p lang="pa" className="font-[family-name:var(--font-gurmukhi)] text-[15px] text-ink-2">
                      {l.pa}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void toggleBookmark(l);
                    }}
                    aria-label={marked ? "Remove bookmark" : "Bookmark this line"}
                    aria-pressed={marked}
                    className={cn(
                      "absolute right-1.5 top-2.5 grid size-10 place-items-center rounded-full hover:bg-surface",
                      marked ? "text-brand-text" : "text-ink-3 opacity-0 focus-visible:opacity-100 group-hover:opacity-100",
                      on && "opacity-100",
                    )}
                  >
                    <Icon name={marked ? "bookmark-on" : "bookmark"} size={20} />
                  </button>
                </div>
              </div>
            );
          })}

          {(prev || next) && (
            <nav aria-label="Sections" className="mt-10 flex items-center justify-between gap-3 px-2">
              {prev ? (
                <Link href={prev.href} className="inline-flex h-11 items-center gap-2 rounded-md border-2 border-line-strong bg-surface px-4 text-[15px] font-extrabold">
                  <Icon name="arrow-right" size={18} className="rotate-180" /> {prev.label}
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link href={next.href} className="inline-flex h-11 items-center gap-2 rounded-md bg-brand px-4 text-[15px] font-extrabold text-white shadow-[0_3px_0_var(--brand-shadow)]">
                  {next.label} <Icon name="arrow-right" size={18} />
                </Link>
              )}
            </nav>
          )}
          <p className="mt-10 border-t border-line px-2 pt-4 text-caption text-ink-3">
            Text: Shabad OS. English meaning: Sant Singh Khalsa. Punjabi meaning: Prof. Sahib Singh. Roman spelling is a reading aid.
            {kids && " Simple kids meanings are being written and reviewed."}
          </p>
        </div>
      )}

      {/* Audio bar (N.4.3) — sits above the mobile tab bar. */}
      <div className="fixed inset-x-0 bottom-[84px] z-30 border-t border-line bg-surface/95 backdrop-blur tab:bottom-0 tab:left-20 web:left-[220px] wide:left-[256px]">
        <div className="mx-auto flex h-16 max-w-[760px] items-center gap-3 px-4">
          {hasAudio && <audio ref={audioRef} src={audioUrl!} preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onTimeUpdate={onTime} onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} onEnded={() => { setPlaying(false); if (settings.repeat === "bani" && audioRef.current) { audioRef.current.currentTime = 0; void audioRef.current.play(); } }} />}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause (Space)" : "Play (Space)"}
            className={cn("grid size-11 shrink-0 place-items-center rounded-full text-white", hasAudio ? "bg-navy-800 dark:bg-navy-600" : "bg-line-strong")}
          >
            <Icon name={playing ? "pause" : "play"} size={18} />
          </button>
          {hasAudio ? (
            <>
              <span className="w-10 text-caption tabular-nums text-ink-2">{fmtTime(time)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={time}
                onChange={(e) => {
                  if (audioRef.current) audioRef.current.currentTime = Number(e.target.value);
                }}
                aria-label="Audio position"
                className="h-2 flex-1 accent-[var(--brand)]"
              />
              <span className="w-10 text-caption tabular-nums text-ink-2">{fmtTime(duration)}</span>
              <button type="button" onClick={() => setSheet(true)} className="rounded-md px-2 py-1 text-label text-ink" aria-label="Audio speed">
                {settings.speed}×
              </button>
            </>
          ) : (
            <p className="flex-1 text-[14px] font-bold text-ink-2">Audio coming soon · recorded by real voices</p>
          )}
          <span className="hidden text-caption text-ink-3 web:inline">↑ ↓ lines · , settings · / search</span>
        </div>
      </div>

      <ReaderSettingsSheet open={sheet} onClose={() => setSheet(false)} settings={settings} mode={mode} hasAudio={hasAudio} />
    </article>
  );
}

function KidsLineView({
  line,
  index,
  total,
  size,
  showRoman,
  bookmarked,
  onBookmark,
  onListen,
  onPrev,
  onNext,
  hasAudio,
  G,
}: {
  line: ReaderLine;
  index: number;
  total: number;
  size: number;
  showRoman: boolean;
  bookmarked: boolean;
  onBookmark: () => void;
  onListen: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasAudio: boolean;
  G: (p: { text: string }) => React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-5 px-5 py-6">
      <div className="flex items-center justify-between">
        <span className="text-label text-ink-2">
          Line {index + 1} of {total}
        </span>
        <button type="button" onClick={onBookmark} aria-pressed={bookmarked} aria-label={bookmarked ? "Remove bookmark" : "Bookmark this line"} className={cn("grid size-11 place-items-center rounded-full hover:bg-sunken", bookmarked ? "text-brand-text" : "text-ink-3")}>
          <Icon name={bookmarked ? "bookmark-on" : "bookmark"} />
        </button>
      </div>
      <section className="flex flex-col items-center gap-3 rounded-2xl bg-hl px-5 py-8 text-center">
        <p lang="pa" className="font-[family-name:var(--font-gurbani)] font-semibold leading-[1.5] text-gurbani" style={{ fontSize: size + 4 }}>
          <G text={line.gurmukhi} />
        </p>
        {showRoman && <p className="text-[20px] font-bold italic text-ink-2">{line.roman}</p>}
        <Button size="sm" variant="navy" icon={<Icon name="volume" size={18} />} onClick={onListen} aria-disabled={!hasAudio}>
          Listen
        </Button>
      </section>

      {line.words.length > 1 && (
        <section aria-labelledby="wbw" className="flex flex-col gap-2">
          <h2 id="wbw" className="text-label text-ink-2">Word by word</h2>
          <div className="flex flex-wrap gap-2">
            {line.words.map((w, n) => (
              <span key={`${w.g}-${n}`} className="flex flex-col items-center rounded-xl border border-line bg-surface px-3 py-2">
                <span lang="pa" className="font-[family-name:var(--font-gurbani)] text-[24px] text-gurbani">
                  <G text={w.g} />
                </span>
                <span className="text-caption text-ink-2">{w.r}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-1 rounded-xl bg-info-bg p-4">
        <h2 className="text-caption font-extrabold tracking-wide text-info">SIMPLE MEANING</h2>
        <p className="text-[17px] font-semibold text-ink">{line.enKids ?? line.en ?? "Meaning coming soon."}</p>
        {!line.enKids && <p className="text-caption text-ink-2">A simpler kids&apos; version is being written and checked by a Sikh teacher.</p>}
      </section>

      <div className="flex gap-3">
        <Button variant="secondary" block onClick={onPrev} disabled={index === 0}>
          Back
        </Button>
        <Button block onClick={onNext} disabled={index >= total - 1}>
          Next line
        </Button>
      </div>
    </div>
  );
}
