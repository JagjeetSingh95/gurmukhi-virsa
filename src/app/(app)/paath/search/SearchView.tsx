"use client";
// N.4.5 Search (U11): first letters (ਸਸਨਹ or "ssnh"), Gurmukhi, Roman or English. Works offline over bundled banis.
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { Chip } from "@/components/ui/controls";
import { StateView } from "@/components/ui/feedback";
import { library, lineHref, sectionLabel } from "@/features/paath/library";
import { readRecents } from "@/features/paath/recent";
import { useLocal } from "@/lib/useLocal";

type Row = [slug: string, i: number, section: number, g: string, r: string, en: string, fl: string, flr: string];
const KEYS = "ੳਅੲਸਹਕਖਗਘਙਚਛਜਝਞਟਠਡਢਣਤਥਦਧਨਪਫਬਭਮਯਰਲਵੜ".split("");
const GURMUKHI = /[਀-੿]/;
// Strip vowel signs etc. so typed first letters compare cleanly.
const baseLetters = (s: string) => s.replace(/[਼-ੑੰੱੵ\s]/g, "");

export function SearchView() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [filter, setFilter] = useState<"all" | "banis" | "lines">("all");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [kb, setKb] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const recents = useLocal(readRecents, []);

  // Load the index once (≈130 KB gzipped) — only on this page.
  useEffect(() => {
    let alive = true;
    import("@/content/banis/search.json").then((m) => alive && setRows(m.default as unknown as Row[]));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== input.current) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const query = q.trim();
  const banis = useMemo(() => {
    if (!query) return [];
    const lq = query.toLowerCase();
    return library.filter((b) => b.title.toLowerCase().includes(lq) || b.short.toLowerCase().includes(lq) || b.gurmukhi.includes(query));
  }, [query]);

  const lines = useMemo(() => {
    if (!rows || query.length < 2) return [];
    const lq = query.toLowerCase();
    const isG = GURMUKHI.test(query);
    const compact = !query.includes(" ");
    const gl = baseLetters(query);
    const scored: { row: Row; score: number }[] = [];
    for (const row of rows) {
      const [, , , g, r, en, fl, flr] = row;
      let score = 0;
      if (isG) {
        if (compact && fl.startsWith(gl)) score = 4;
        else if (compact && fl.includes(gl)) score = 3;
        else if (g.includes(query)) score = 2;
      } else {
        if (compact && /^[a-z]+$/.test(lq) && flr.startsWith(lq)) score = 4;
        else if (compact && /^[a-z]+$/.test(lq) && lq.length >= 3 && flr.includes(lq)) score = 3;
        else if (r.toLowerCase().includes(lq)) score = 2;
        else if (en.toLowerCase().includes(lq)) score = 1;
      }
      if (score) scored.push({ row, score });
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, 50).map((s) => s.row);
  }, [rows, query]);

  const titleOf = (slug: string) => library.find((b) => b.slug === slug)?.short ?? slug;
  const showBanis = filter !== "lines" && banis.length > 0;
  const showLines = filter !== "banis";

  return (
    <>
      <header className="sticky top-0 z-20 flex flex-col gap-3 border-b border-line bg-app/95 px-3 py-3 backdrop-blur web:px-8">
        <h1 className="sr-only">Search Gurbani</h1>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => router.back()} className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-sunken" aria-label="Back">
            <Icon name="arrow-right" className="rotate-180" />
          </button>
          <label className="flex h-12 flex-1 items-center gap-2 rounded-lg border-2 border-line-strong bg-surface px-3 focus-within:border-navy-600">
            <Icon name="search" size={20} className="text-ink-3" />
            <span className="sr-only">Search Paath</span>
            <input
              ref={input}
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ਸਸਨਹ, ssnh, a word or English"
              className="h-full flex-1 bg-transparent text-[16px] font-semibold outline-none placeholder:text-ink-3 focus-visible:outline-none"
              inputMode={kb ? "none" : "search"}
              enterKeyHint="search"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} aria-label="Clear" className="text-ink-3">
                <Icon name="close" size={18} />
              </button>
            )}
          </label>
          <button
            type="button"
            onClick={() => setKb((v) => !v)}
            aria-pressed={kb}
            aria-label="Gurmukhi keyboard"
            className={`grid size-11 shrink-0 place-items-center rounded-full ${kb ? "bg-brand-soft text-brand-text" : "text-ink-2 hover:bg-sunken"}`}
          >
            <Icon name="keyboard" />
          </button>
        </div>
        <p className="px-1 text-caption text-ink-2">Type first letters (ਸ ਸ ਨ ਹ or s s n h), Roman words, or English.</p>
        <div className="flex gap-2" role="group" aria-label="Filter">
          {(["all", "banis", "lines"] as const).map((f) => (
            <Chip key={f} selected={filter === f} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f === "banis" ? "Banis" : "Lines"}
            </Chip>
          ))}
        </div>
        {kb && (
          <div className="grid grid-cols-9 gap-1.5 rounded-xl bg-sunken p-2 tab:grid-cols-12" role="group" aria-label="Gurmukhi letters">
            {KEYS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setQ((v) => v + k)}
                className="h-11 rounded-md bg-surface font-[family-name:var(--font-gurmukhi)] text-[22px] font-bold shadow-[0_2px_0_var(--border-strong)] active:translate-y-px"
              >
                {k}
              </button>
            ))}
            <button type="button" onClick={() => setQ((v) => v.slice(0, -1))} className="col-span-2 h-11 rounded-md bg-surface text-[14px] font-extrabold" aria-label="Delete">
              ⌫
            </button>
          </div>
        )}
      </header>

      <div className="flex flex-col gap-6 px-5 py-5 web:px-8">
        {!query && (
          <section className="flex flex-col gap-2">
            <h2 className="text-label text-ink-2">Recent</h2>
            {recents.length ? (
              <ul className="flex flex-col gap-2">
                {recents.map((r) => (
                  <li key={r.slug}>
                    <Link href={lineHref(r.slug, r.section, r.lineIndex)} className="flex flex-col rounded-xl border border-line bg-surface px-4 py-3 hover:bg-sunken">
                      <span className="text-[16px] font-extrabold">{titleOf(r.slug)}</span>
                      <span lang="pa" className="truncate font-[family-name:var(--font-gurbani)] text-[16px] text-gurbani">{r.preview}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[15px] text-ink-2">Banis you read will show here.</p>
            )}
          </section>
        )}

        {query && showBanis && (
          <section className="flex flex-col gap-2">
            <h2 className="text-label text-ink-2">Banis</h2>
            {banis.map((b) => (
              <Link key={b.slug} href={`/paath/${b.slug}`} className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 hover:bg-sunken">
                <span className="text-[16px] font-extrabold">{b.short}</span>
                <span lang="pa" className="font-[family-name:var(--font-gurbani)] text-gurbani">{b.gurmukhi}</span>
              </Link>
            ))}
          </section>
        )}

        {query && showLines && (
          <section className="flex flex-col gap-2" aria-live="polite">
            <h2 className="text-label text-ink-2">{rows ? `Lines · ${lines.length}${lines.length === 50 ? "+" : ""}` : "Loading lines…"}</h2>
            <ul className="flex flex-col gap-2">
              {lines.map(([slug, i, section, g, r]) => (
                <li key={`${slug}-${i}`}>
                  <Link href={lineHref(slug, section, i)} className="flex flex-col gap-0.5 rounded-xl border border-line bg-surface px-4 py-3 hover:bg-sunken">
                    <span lang="pa" className="font-[family-name:var(--font-gurbani)] text-[19px] text-gurbani">{g}</span>
                    <span className="text-[14px] font-semibold italic text-ink-2">{r}</span>
                    <span className="text-caption text-ink-3">
                      {titleOf(slug)}
                      {sectionLabel(slug, section) ? ` · ${sectionLabel(slug, section)!.replace(/ of \d+$/, "")}` : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {query && rows && !lines.length && !(showBanis && banis.length) && (
          <StateView art={false} kind="empty" title="No matches" body={`No lines match “${query}”. Try first letters, e.g. ਸਸਨਹ or ssnh.`} />
        )}
      </div>
    </>
  );
}
