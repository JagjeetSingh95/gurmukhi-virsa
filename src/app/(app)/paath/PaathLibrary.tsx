"use client";
// N.4.1 Paath library (D06): Adult/Kids toggle · Continue reading · All banis · Bedtime card.
// Respect rules: the only art here is Sheru Sleepy on the bedtime card; none near Gurbani lines.
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Sheru } from "@/components/sheru/Sheru";
import { Segmented } from "@/components/ui/controls";
import { Badge, Progress, TopBar } from "@/components/ui/display";
import { library, lineHref, sectionLabel } from "@/features/paath/library";
import { readReaderMode, readRecent, writeReaderMode, type ReaderMode } from "@/features/paath/recent";
import { useAuth } from "@/lib/auth";
import { local } from "@/lib/local";
import { useLocal } from "@/lib/useLocal";

const gurmukhiFont = "font-[family-name:var(--font-gurbani)]";

export function PaathLibrary() {
  const { session } = useAuth();
  const mode = useLocal(local.mode, null);
  const activeChild = useLocal(local.activeChild, null);
  const stored = useLocal(readReaderMode, null);
  const recent = useLocal(readRecent, null);
  // Default: Kids when a child profile is active, otherwise Adult.
  const readerMode: ReaderMode = stored ?? (mode === "family" && session && activeChild ? "kids" : "adult");
  const kids = readerMode === "kids";
  const recentItem = recent ? library.find((b) => b.slug === recent.slug) : null;
  const recentPct = recent ? ((recent.lineIndex + 1) / Math.max(1, recent.lineCount)) * 100 : 0;

  return (
    <>
      <TopBar
        title="Paath"
        trailing={
          <div className="flex items-center gap-1">
            <span className="grid size-11 place-items-center rounded-full text-ink-3" title="Search arrives soon" aria-label="Search (coming soon)">
              <Icon name="search" />
            </span>
            <Link href="/settings" className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-sunken" aria-label="Settings">
              <Icon name="settings" />
            </Link>
          </div>
        }
      />

      <div className="flex flex-col gap-6 px-5 py-5 web:px-8 web:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmented
            label="Reading mode"
            value={readerMode}
            onChange={(m) => writeReaderMode(m)}
            options={[
              { value: "adult", label: "Adult" },
              { value: "kids", label: "Kids" },
            ]}
          />
          <Badge tone="success">Paath is free forever</Badge>
        </div>

        {kids && (
          <div className="flex items-start gap-3 rounded-xl bg-info-bg p-4 text-info">
            <Icon name="info" className="mt-0.5 shrink-0" />
            <p className="text-[15px] font-bold">
              Kids mode · Bigger letters, Roman spelling and simple meanings.
            </p>
          </div>
        )}

        <div className="grid gap-4 web:grid-cols-2">
          {recent && recentItem ? (
            <Link
              href={lineHref(recent.slug, recent.section, recent.lineIndex)}
              className="flex flex-col gap-3 rounded-xl border border-[var(--saffron-300)] bg-hl p-5 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-caption font-extrabold tracking-wide text-brand-text">CONTINUE READING</span>
                {sectionLabel(recent.slug, recent.section) && <span className="text-caption text-ink-2">{sectionLabel(recent.slug, recent.section)}</span>}
              </div>
              <div className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-h3 text-ink">{recentItem.short}</p>
                  <p lang="pa" className={`truncate text-[17px] text-gurbani ${gurmukhiFont}`}>
                    {recent.preview}
                  </p>
                </div>
                <span className="grid size-[52px] shrink-0 place-items-center rounded-full bg-brand-strong text-white" aria-hidden>
                  <Icon name="arrow-right" size={22} />
                </span>
              </div>
              <Progress value={recentPct} label={`${Math.round(recentPct)}% read`} />
            </Link>
          ) : (
            <div className="flex flex-col justify-center gap-1 rounded-xl border border-dashed border-line-strong bg-surface p-5">
              <p className="text-h3">Start with Mool Mantar</p>
              <p className="text-[15px] text-ink-2">Pick any bani below. We&apos;ll remember where you stopped.</p>
            </div>
          )}

          {/* Bedtime card — Sheru Sleepy is allowed here only (D.4). */}
          <Link
            href="/paath/kirtan-sohila?bedtime=1"
            className="flex items-center gap-4 rounded-xl bg-navy-800 p-5 text-white transition-transform hover:-translate-y-0.5 dark:bg-navy-900"
          >
            <Sheru mood="sleepy" size={64} decorative />
            <span className="flex-1">
              <span className="block text-h3 text-white">Bedtime Paath</span>
              <span className="block text-[14px] font-semibold text-navy-50">Kirtan Sohila, calm and simple</span>
            </span>
            <span className="inline-flex h-10 items-center rounded-md bg-brand px-4 text-[14px] font-extrabold">Start</span>
          </Link>
        </div>

        <section aria-labelledby="all-banis" className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 id="all-banis" className="text-h3">All banis</h2>
            <span className="text-caption text-ink-2">{library.length} banis · audio coming soon</span>
          </div>
          <ul className="grid gap-3 web:grid-cols-2">
            {library.map((b) => {
              const isRecent = recent?.slug === b.slug;
              const pct = isRecent ? Math.round(recentPct) : 0;
              return (
                <li key={b.slug}>
                  <Link
                    href={`/paath/${b.slug}`}
                    className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4 shadow-[0_2px_0_var(--border-default)] transition-transform hover:-translate-y-0.5"
                  >
                    <span
                      lang="pa"
                      aria-hidden
                      className={`grid size-14 shrink-0 place-items-center rounded-md bg-navy-50 p-1 text-center text-[15px] font-semibold leading-tight text-navy-800 dark:bg-navy-900 dark:text-navy-50 ${gurmukhiFont}`}
                    >
                      {b.tile}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-h3 text-ink">{b.short}</span>
                      <span lang="pa" className={`text-[15px] text-gurbani ${gurmukhiFont}`}>{b.gurmukhi}</span>
                      <span className="text-caption text-ink-2">
                        {b.detail} · about {b.minutes} min
                      </span>
                    </span>
                    {isRecent && pct > 0 ? (
                      <span className="flex w-16 flex-col items-end gap-1">
                        <span className="text-caption text-ink-2">{pct}%</span>
                        <Progress value={pct} label={`${b.short} ${pct}% read`} className="w-16" />
                      </span>
                    ) : (
                      <Icon name="arrow-right" size={20} className="shrink-0 text-ink-3" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}
