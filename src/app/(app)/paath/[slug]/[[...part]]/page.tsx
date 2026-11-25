import { Suspense } from "react";
// Reader route: server-renders every line (SEO + fast first paint), then <Reader> adds settings, highlight, audio, kids views.
// Calm, plain layout — no mascot or decoration near Gurbani (D.4).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import g from "gurmukhi-utils";
import { Reader, type ReaderLine } from "@/features/paath/Reader";
import { baniSlugs, libraryItem, loadBani, pagedBanis, sectionLabel } from "@/features/paath/library";
import { ReadingTracker } from "./ReadingTracker";

export function generateStaticParams() {
  return baniSlugs.flatMap((slug) => {
    const parts = pagedBanis[slug];
    if (!parts) return [{ slug, part: [] as string[] }];
    return [{ slug, part: [] as string[] }, ...Array.from({ length: parts - 1 }, (_, i) => ({ slug, part: [String(i + 2)] }))];
  });
}

/** Part 1 (no segment) … N. Returns null for an invalid URL. */
function parsePart(slug: string, part?: string[]) {
  const total = pagedBanis[slug];
  if (!part?.length) return total ? 1 : 0;
  if (!total || part.length > 1) return null;
  const n = Number(part[0]);
  return Number.isInteger(n) && n >= 2 && n <= total ? n : null;
}

export async function generateMetadata({ params }: PageProps<"/paath/[slug]/[[...part]]">): Promise<Metadata> {
  const { slug, part } = await params;
  const item = libraryItem(slug);
  const p = parsePart(slug, part);
  if (!item || p === null) return {};
  return {
    title: `${item.short} — read with meaning`,
    description: `Read ${item.title} (${item.gurmukhi}) line by line with transliteration and English meaning. Free forever.`,
    alternates: { canonical: `/paath/${slug}${p > 1 ? `/${p}` : ""}` },
  };
}


// Params are read inside <Suspense> so client navigations stay instant (cacheComponents).
export default function Page(props: PageProps<"/paath/[slug]/[[...part]]">) {
  return (
    <Suspense fallback={null}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ params }: PageProps<"/paath/[slug]/[[...part]]">) {
  const { slug, part } = await params;
  const bani = await loadBani(slug);
  const item = libraryItem(slug);
  const p = parsePart(slug, part);
  if (!bani || !item || p === null) notFound();
  const total = pagedBanis[slug] ?? 0;
  const partHref = (n: number) => `/paath/${slug}${n > 1 ? `/${n}` : ""}`;

  // One section per page for long banis; keep global line indexes for deep links + "continue reading".
  const lines: ReaderLine[] = bani.lines
    .map((l, i) => ({ ...l, i }))
    .filter((l) => !total || Math.max(1, l.section) === p)
    .map((l) => ({
      i: l.i,
      id: l.id,
      kind: l.kind,
      section: l.section,
      gurmukhi: l.gurmukhi,
      roman: l.roman,
      en: l.en,
      pa: l.pa,
      enKids: l.enKids,
      audio: l.audio,
      words:
        l.kind === "line"
          ? l.gurmukhi
              .split(" ")
              .filter((w) => w && !w.startsWith("॥"))
              .map((w) => ({ g: w, r: g.toEnglish(w) }))
          : [],
    }));

  const sectionLabels: Record<number, string> = {};
  for (const l of lines) {
    const label = sectionLabel(slug, l.section);
    if (label) sectionLabels[l.section] = label;
  }

  return (
    <>
      <Reader
        slug={slug}
        title={item.short}
        gurmukhiTitle={bani.gurmukhi}
        lines={lines}
        lineCount={bani.lines.length}
        sectionLabels={sectionLabels}
        audioUrl={bani.audioUrl}
        prev={total && p > 1 ? { href: partHref(p - 1), label: `Ashtpadi ${p - 1}` } : null}
        next={total && p < total ? { href: partHref(p + 1), label: `Ashtpadi ${p + 1}` } : null}
      />
      <ReadingTracker slug={slug} title={item.short} lineCount={bani.lines.length} />
    </>
  );
}
