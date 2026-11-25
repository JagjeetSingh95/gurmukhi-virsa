"use client";
// N.6.1 The 10 Gurus list + Guru detail (D12). Gurus are never drawn — numerals and text only.
import Link from "next/link";
import { Icon } from "@/components/icons";
import { useIsFamily } from "@/lib/entitlement";
import { granth, guruById, gurus, sakhisForGuru, tenGurus } from "./content";
import { BackBar, GuruNumeral, GuruRow, SakhiRow } from "./ui";

export function GuruList() {
  return (
    <>
      <BackBar title="The 10 Gurus" />
      <div className="flex flex-col gap-5 px-5 py-6 web:px-8">
        <p className="text-body-l text-ink-2">Learn about the ten Gurus and Guru Granth Sahib Ji, our eternal Guru.</p>
        <ul className="grid gap-1 web:grid-cols-2 web:gap-x-6">
          {tenGurus.map((g) => (
            <li key={g.id}>
              <GuruRow guru={g} />
            </li>
          ))}
        </ul>
        <Link href={`/culture/gurus/${granth.id}`} className="flex items-center gap-4 rounded-2xl border-2 border-navy-600 bg-surface p-4 hover:bg-sunken">
          <GuruNumeral guru={granth} />
          <span className="min-w-0 flex-1">
            <span className="block text-[17px] font-extrabold text-ink">{granth.name}</span>
            <span className="block text-caption text-ink-2">{granth.role} · {granth.years}</span>
          </span>
          <Icon name="chevron-right" size={20} className="text-ink-3" />
        </Link>
      </div>
    </>
  );
}

export function GuruDetail({ id }: { id: string }) {
  const g = guruById(id)!;
  const isFamily = useIsFamily();
  const idx = gurus.findIndex((x) => x.id === id);
  const prev = gurus[idx - 1];
  const next = gurus[idx + 1];
  const stories = sakhisForGuru(id);

  return (
    <>
      <BackBar title={g.name} back="/culture/gurus" />
      <article className="mx-auto flex w-full max-w-[880px] flex-col gap-6 px-5 py-6 web:px-8">
        <header className="flex flex-col items-center gap-3 text-center tab:flex-row tab:text-left">
          <GuruNumeral guru={g} size="lg" />
          <div>
            <h1 className="text-h1">{g.name}</h1>
            <p lang="pa" className="text-gurmukhi-h text-ink-2">{g.gurmukhi}</p>
            <p className="text-label text-ink-2">{g.years} · {g.role}</p>
          </div>
        </header>

        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-label uppercase tracking-wider text-ink-3">{g.id === "granth" ? "Beginning" : "Born"}</h2>
          <p className="mt-1 text-body-l">{g.born}</p>
        </section>

        {g.teachings && (
          <section aria-labelledby="rules-h" className="flex flex-col gap-3">
            <h2 id="rules-h" className="text-h3">Three golden rules</h2>
            <ul className="grid gap-3 tab:grid-cols-3">
              {g.teachings.map((t) => (
                <li key={t.roman} className="flex flex-col items-center gap-1 rounded-2xl bg-brand-soft p-4 text-center">
                  <span lang="pa" className="text-gurmukhi-h text-brand-text">{t.gurmukhi}</span>
                  <span className="text-[16px] font-extrabold text-ink">{t.roman}</span>
                  <span className="text-[14px] text-ink-2">{t.meaning}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="facts-h" className="flex flex-col gap-3">
          <h2 id="facts-h" className="text-h3">Remember</h2>
          <ul className="flex flex-col gap-2">
            {g.facts.map((f) => (
              <li key={f} className="flex gap-3 rounded-xl bg-sunken p-4 text-body">
                <Icon name="star" size={20} className="mt-0.5 shrink-0 text-[var(--gold-500)]" />
                {f}
              </li>
            ))}
          </ul>
        </section>

        {stories.length > 0 && (
          <section aria-labelledby="sakhis-h" className="flex flex-col gap-2">
            <h2 id="sakhis-h" className="text-h3">Sakhis</h2>
            <ul>
              {stories.map((s) => (
                <li key={s.id}>
                  <SakhiRow sakhi={s} locked={!s.free && !isFamily} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav aria-label="More Gurus" className="flex justify-between gap-3 border-t border-line pt-4">
          {prev ? (
            <Link href={`/culture/gurus/${prev.id}`} className="flex items-center gap-2 rounded-lg px-2 py-2 text-[15px] font-bold text-brand-text hover:bg-sunken">
              <Icon name="chevron-left" size={18} /> {prev.name}
            </Link>
          ) : <span />}
          {next && (
            <Link href={`/culture/gurus/${next.id}`} className="flex items-center gap-2 rounded-lg px-2 py-2 text-right text-[15px] font-bold text-brand-text hover:bg-sunken">
              {next.name} <Icon name="chevron-right" size={18} />
            </Link>
          )}
        </nav>
      </article>
    </>
  );
}
