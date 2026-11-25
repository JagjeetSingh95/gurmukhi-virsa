"use client";
// N.6.1 Culture home (D12): greeting, today's sakhi, 6 sections, the 10 Gurus strip.
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Sheru } from "@/components/sheru/Sheru";
import { ButtonLink } from "@/components/ui/controls";
import { Badge, TopBar } from "@/components/ui/display";
import { useAuth } from "@/lib/auth";
import { useIsFamily } from "@/lib/entitlement";
import { local } from "@/lib/local";
import { useLocal } from "@/lib/useLocal";
import { cn } from "@/lib/cn";
import { sakhiHeading, sections, tenGurus, todaysSakhi } from "./content";
import { CultureUnlock, GuruNumeral } from "./ui";

export function CultureHome() {
  const { session, kids } = useAuth();
  const mode = useLocal(local.mode, null);
  const activeId = useLocal(local.activeChild, null);
  const child = session && mode === "family" ? kids.find((k) => k.id === activeId) : undefined;
  const isFamily = useIsFamily();
  const today = todaysSakhi(isFamily);

  return (
    <>
      <TopBar title="Culture" />
      <div className="flex flex-col gap-6 px-5 py-6 web:px-8">
        <div className="flex items-center gap-3">
          <Sheru mood="happy" size={56} decorative />
          <p className="text-[17px] font-bold text-ink">
            Sat Sri Akal{child ? `, ${child.name}` : ""}! Today&apos;s story is ready.
          </p>
        </div>

        {/* Today's sakhi */}
        <Link
          href={`/culture/sakhis/${today.id}`}
          className="group grid gap-4 overflow-hidden rounded-2xl bg-brand p-5 text-white shadow-[0_5px_0_var(--brand-shadow)] tab:grid-cols-[1fr_auto] tab:items-center web:p-7"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {today.free && <Badge tone="success">Free</Badge>}
              <span className="text-caption font-extrabold uppercase tracking-wider">Today&apos;s sakhi · {today.minutes} min</span>
            </div>
            <h2 className="text-h2 text-white web:text-h1">
              {sakhiHeading(today)}
            </h2>
            <p className="text-[15px]">{today.tagline}.</p>
            <span className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-[15px] font-extrabold text-[var(--saffron-800)]">
              <Icon name="play" size={16} /> Play story
            </span>
          </div>
          <span aria-hidden className="hidden size-36 place-items-center rounded-full bg-white/15 text-[72px] transition-transform group-hover:scale-105 tab:grid">
            {today.pages[0]?.scene}
          </span>
        </Link>

        {!isFamily && <CultureUnlock />}

        {/* Sections */}
        <nav aria-label="Culture sections" className="grid grid-cols-2 gap-3 tab:grid-cols-3 web:grid-cols-6">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface p-4 text-center shadow-[0_2px_0_var(--border-default)] transition-transform hover:-translate-y-0.5"
            >
              <span className={cn("grid size-14 place-items-center rounded-full", s.tint)} aria-hidden>
                {s.glyph ? <span lang="pa" className="font-[family-name:var(--font-gurmukhi)] text-[26px] font-bold leading-none">{s.glyph}</span> : s.icon && <Icon name={s.icon} size={26} />}
              </span>
              <span className="text-[16px] font-extrabold text-ink">{s.label}</span>
              <span lang="pa" className="text-caption text-ink-2">{s.gurmukhi}</span>
            </Link>
          ))}
        </nav>

        {/* 10 Gurus strip */}
        <section aria-labelledby="gurus-h" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 id="gurus-h" className="text-h3">The 10 Gurus</h2>
            <ButtonLink href="/culture/gurus" variant="ghost" size="sm">See all</ButtonLink>
          </div>
          <ul className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2 web:mx-0 web:grid web:grid-cols-5 web:overflow-visible web:px-0">
            {tenGurus.map((g) => (
              <li key={g.id} className="w-40 shrink-0 snap-start web:w-auto">
                <Link href={`/culture/gurus/${g.id}`} className="flex h-full flex-col gap-2 rounded-2xl border border-line bg-surface p-4 hover:bg-sunken">
                  <GuruNumeral guru={g} />
                  <span className="text-[15px] font-extrabold leading-tight text-ink">{g.name}</span>
                  <span className="text-caption text-ink-2">{g.years}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
