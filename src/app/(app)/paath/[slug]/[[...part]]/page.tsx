// Basic reader (N.4.1 entry point). N.4.2 adds transliteration/meaning toggles + settings sheet; N.4.3 audio.
// Calm, plain layout — no mascot or decoration near Gurbani (D.4).
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { IkOnkar } from "@/components/IkOnkar";
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

function GurmukhiText({ text }: { text: string }) {
  if (!text.startsWith("ੴ")) return <>{text}</>;
  return (
    <>
      <IkOnkar />
      {text.slice(1)}
    </>
  );
}

export default async function Reader({ params }: PageProps<"/paath/[slug]/[[...part]]">) {
  const { slug, part } = await params;
  const bani = await loadBani(slug);
  const item = libraryItem(slug);
  const p = parsePart(slug, part);
  if (!bani || !item || p === null) notFound();
  const total = pagedBanis[slug] ?? 0;
  // Keep global line indexes (for "continue reading") while showing one section per page.
  const lines = bani.lines.map((l, i) => ({ ...l, i })).filter((l) => !total || Math.max(1, l.section) === p);
  const partHref = (n: number) => `/paath/${slug}${n > 1 ? `/${n}` : ""}`;

  return (
    <article className="pb-16">
      <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-app/95 px-3 backdrop-blur web:h-16 web:px-6">
        <Link href="/paath" className="grid size-11 place-items-center rounded-full hover:bg-sunken" aria-label="Back to library">
          <Icon name="arrow-right" className="rotate-180" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-h3">{item.short}</h1>
          <p lang="pa" className="truncate font-[family-name:var(--font-gurbani)] text-[14px] text-gurbani">{bani.gurmukhi}</p>
        </div>
      </header>

      <div className="mx-auto flex max-w-[760px] flex-col px-5 py-6 web:px-8">
        {total > 0 && <p className="mb-4 text-label text-ink-3">{sectionLabel(slug, p)}</p>}
        {lines.map((l, k) => {
          const i = l.i;
          const label = !total && (k === 0 || l.section !== lines[k - 1].section) ? sectionLabel(slug, l.section) : null;
          return (
            <div key={l.id} id={`l${i}`} data-line={i} data-section={l.section} className="scroll-mt-20">
              {label && <h2 className="mb-2 mt-8 text-label uppercase tracking-wider text-ink-3 first:mt-0">{label.replace(/ of \d+$/, "")}</h2>}
              {l.kind === "heading" ? (
                <p lang="pa" className="mb-2 mt-6 text-center font-[family-name:var(--font-gurbani)] text-[18px] font-semibold text-ink-2">
                  <GurmukhiText text={l.gurmukhi} />
                </p>
              ) : (
                <div className="flex flex-col gap-1 rounded-md px-2 py-3 web:px-3">
                  <p lang="pa" className="text-gurbani-adult">
                    <GurmukhiText text={l.gurmukhi} />
                  </p>
                  <p className="text-[15px] font-semibold italic text-ink-2">{l.roman}</p>
                  {l.en && <p className="text-[15px] text-ink-2">{l.en}</p>}
                </div>
              )}
            </div>
          );
        })}
        {total > 0 && (
          <nav aria-label="Sections" className="mt-10 flex items-center justify-between gap-3">
            {p > 1 ? (
              <Link href={partHref(p - 1)} className="inline-flex h-11 items-center gap-2 rounded-md border-2 border-line-strong bg-surface px-4 text-[15px] font-extrabold">
                <Icon name="arrow-right" size={18} className="rotate-180" /> Ashtpadi {p - 1}
              </Link>
            ) : <span />}
            {p < total && (
              <Link href={partHref(p + 1)} className="inline-flex h-11 items-center gap-2 rounded-md bg-brand px-4 text-[15px] font-extrabold text-white shadow-[0_3px_0_var(--brand-shadow)]">
                Ashtpadi {p + 1} <Icon name="arrow-right" size={18} />
              </Link>
            )}
          </nav>
        )}
        <p className="mt-10 border-t border-line pt-4 text-caption text-ink-3">
          Text: Shabad OS. English meaning: Sant Singh Khalsa. Transliteration is a reading aid.
        </p>
      </div>
      <ReadingTracker slug={slug} title={item.short} lineCount={bani.lines.length} />
    </article>
  );
}
