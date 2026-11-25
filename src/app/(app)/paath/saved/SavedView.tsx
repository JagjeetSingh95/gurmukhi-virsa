"use client";
// N.4.5 Saved (U11): Bookmarks (lines) · Favourites (banis pinned to Paath home) · Recent (last 10). Remove → undo toast.
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { Segmented } from "@/components/ui/controls";
import { TopBar } from "@/components/ui/display";
import { StateView, useToast } from "@/components/ui/feedback";
import { library, lineHref, loadBani, sectionLabel } from "@/features/paath/library";
import { clearRecent, readRecents, writeRecent, type Recent } from "@/features/paath/recent";
import { useSaved } from "@/features/paath/saved";
import { useLocal } from "@/lib/useLocal";

type Row = [slug: string, i: number, section: number, g: string, r: string, en: string, fl: string, flr: string];
type Tab = "bookmarks" | "favourites" | "recent";
type Undo = { kind: "bookmark"; slug: string; id: string } | { kind: "fav"; slug: string } | { kind: "recent"; recent: Recent };

function ago(iso: string | number) {
  const d = (Date.now() - new Date(iso).getTime()) / 86_400_000;
  if (d < 1) return "today";
  if (d < 2) return "yesterday";
  if (d < 7) return `${Math.floor(d)} days ago`;
  if (d < 14) return "last week";
  return new Date(iso).toLocaleDateString();
}

export function SavedView() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("bookmarks");
  const saved = useSaved();
  const recents = useLocal(readRecents, []);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [undo, setUndo] = useState<Undo | null>(null);
  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 5000);
    return () => clearTimeout(t);
  }, [undo]);

  // Line text for bookmarks comes from the offline index (bookmarks store ids only).
  useEffect(() => {
    if (tab !== "bookmarks" || rows) return;
    import("@/content/banis/search.json").then((m) => setRows(m.default as unknown as Row[]));
  }, [tab, rows]);

  const byId = useMemo(() => {
    const map = new Map<string, Row>();
    if (!rows) return map;
    for (const row of rows) map.set(`${row[0]}:${row[1]}`, row);
    return map;
  }, [rows]);
  // Bookmarks store Shabad OS line ids; map them to line indexes from each bookmarked bani.
  const [idIndex, setIdIndex] = useState<Map<string, number> | null>(null);
  useEffect(() => {
    if (tab !== "bookmarks" || !saved.bookmarks.length || idIndex) return;
    const slugs = Array.from(new Set(saved.bookmarks.map((b) => b.baniSlug)));
    Promise.all(slugs.map(async (s) => [s, await loadBani(s)] as const)).then((all) => {
      const m = new Map<string, number>();
      for (const [s, bani] of all) bani?.lines.forEach((l, i) => m.set(`${s}:${l.id}`, i));
      setIdIndex(m);
    });
  }, [tab, saved.bookmarks, idIndex]);

  const titleOf = (slug: string) => library.find((b) => b.slug === slug)?.short ?? slug;

  return (
    <>
      <TopBar
        title="Saved"
        leading={
          <Link href="/paath" className="-ml-2 grid size-11 place-items-center rounded-full hover:bg-sunken" aria-label="Back to Paath">
            <Icon name="arrow-right" className="rotate-180" />
          </Link>
        }
      />
      <div className="flex flex-col gap-5 px-5 py-5 web:px-8">
        <Segmented<Tab>
          label="Saved"
          value={tab}
          onChange={setTab}
          options={[
            { value: "bookmarks", label: "Bookmarks" },
            { value: "favourites", label: "Favourites" },
            { value: "recent", label: "Recent" },
          ]}
        />
        {!saved.synced && <p className="text-caption text-ink-2">Saved on this device. <Link href="/signin" className="font-bold underline">Create a free account</Link> to keep them everywhere.</p>}
        {saved.error && <p className="text-caption text-error" role="alert">{saved.error}</p>}

        {tab === "bookmarks" &&
          (saved.bookmarks.length ? (
            <ul className="flex flex-col gap-2">
              {saved.bookmarks.map((b) => {
                const idx = idIndex?.get(`${b.baniSlug}:${b.lineId}`);
                const row = idx !== undefined ? byId.get(`${b.baniSlug}:${idx}`) : undefined;
                return (
                  <li key={`${b.baniSlug}:${b.lineId}`} className="flex items-center gap-2 rounded-xl border border-line bg-surface pr-2">
                    <Link href={row ? lineHref(b.baniSlug, row[2], row[1]) : `/paath/${b.baniSlug}`} className="flex min-w-0 flex-1 flex-col gap-0.5 px-4 py-3">
                      {row ? (
                        <>
                          <span className="truncate text-[16px] font-extrabold italic">{row[4]}</span>
                          <span lang="pa" className="truncate font-[family-name:var(--font-gurbani)] text-[17px] text-gurbani">{row[3]}</span>
                        </>
                      ) : (
                        <span className="text-[15px] text-ink-3">Loading…</span>
                      )}
                      <span className="text-caption text-ink-3">
                        {titleOf(b.baniSlug)}
                        {row && sectionLabel(b.baniSlug, row[2]) ? ` · ${sectionLabel(b.baniSlug, row[2])!.replace(/ of \d+$/, "")}` : ""} · {ago(b.createdAt)}
                      </span>
                    </Link>
                    <button
                      type="button"
                      aria-label="Remove bookmark"
                      className="grid size-11 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-sunken"
                      onClick={async () => {
                        await saved.remove(b.baniSlug, b.lineId);
                        toast("Bookmark removed", "info");
                        // Undo: re-add within the toast window.
                        setUndo({ kind: "bookmark", slug: b.baniSlug, id: b.lineId });
                      }}
                    >
                      <Icon name="close" size={18} />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <StateView art={false} kind="empty" title="No bookmarks yet" body="Tap the bookmark on a line, or long-press it while reading, to save it here." />
          ))}

        {tab === "favourites" &&
          (saved.favourites.length ? (
            <ul className="grid gap-2 web:grid-cols-2">
              {saved.favourites.map((slug) => {
                const b = library.find((x) => x.slug === slug);
                if (!b) return null;
                return (
                  <li key={slug} className="flex items-center gap-2 rounded-xl border border-line bg-surface pr-2">
                    <Link href={`/paath/${slug}`} className="flex flex-1 flex-col px-4 py-3">
                      <span className="text-[16px] font-extrabold">{b.short}</span>
                      <span lang="pa" className="font-[family-name:var(--font-gurbani)] text-gurbani">{b.gurmukhi}</span>
                    </Link>
                    <button
                      type="button"
                      aria-label={`Unpin ${b.short}`}
                      className="grid size-11 place-items-center rounded-full text-brand-text hover:bg-sunken"
                      onClick={async () => {
                        await saved.setFavourite(slug, false);
                        toast("Removed from favourites", "info");
                        setUndo({ kind: "fav", slug });
                      }}
                    >
                      <Icon name="heart-on" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <StateView art={false} kind="empty" title="No favourites yet" body="Tap the heart in the reader to pin a bani to the top of Paath." />
          ))}

        {tab === "recent" &&
          (recents.length ? (
            <ul className="flex flex-col gap-2">
              {recents.map((r) => (
                <li key={r.slug} className="flex items-center gap-2 rounded-xl border border-line bg-surface pr-2">
                  <Link href={lineHref(r.slug, r.section, r.lineIndex)} className="flex min-w-0 flex-1 flex-col px-4 py-3">
                    <span className="text-[16px] font-extrabold">{titleOf(r.slug)}</span>
                    <span lang="pa" className="truncate font-[family-name:var(--font-gurbani)] text-[16px] text-gurbani">{r.preview}</span>
                    <span className="text-caption text-ink-3">{ago(r.at)}</span>
                  </Link>
                  <button
                    type="button"
                    aria-label="Remove from recent"
                    className="grid size-11 place-items-center rounded-full text-ink-3 hover:bg-sunken"
                    onClick={() => {
                      clearRecent(r.slug);
                      toast("Removed from recent", "info");
                      setUndo({ kind: "recent", recent: r });
                    }}
                  >
                    <Icon name="close" size={18} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <StateView art={false} kind="empty" title="Nothing read yet" body="The last 10 banis you read will appear here." />
          ))}

        {undo && (
          <button
            type="button"
            className="fixed bottom-40 left-1/2 z-50 -translate-x-1/2 rounded-full border-2 border-brand bg-surface px-5 py-2 text-[15px] font-extrabold text-brand-text shadow-lg web:bottom-20"
            onClick={async () => {
              if (undo.kind === "bookmark") await saved.add(undo.slug, undo.id);
              else if (undo.kind === "fav") await saved.setFavourite(undo.slug, true);
              else writeRecent(undo.recent);
              setUndo(null);
            }}
          >
            Undo
          </button>
        )}
      </div>
    </>
  );
}
