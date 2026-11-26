// W.2 Features
import type { Metadata } from "next";
import { Icon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/controls";
import { Badge } from "@/components/ui/display";
import {
  CtaBand,
  FeatureList,
  LetterPathPreview,
  PageHero,
  ParentPreview,
  ReaderPreview,
  Section,
  SectionHead,
} from "@/components/site/blocks";
import { Sheru } from "@/components/sheru/Sheru";
import { pillars } from "@/content/marketing";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Features",
  description: "Paath reader with audio and meaning, a playful Gurmukhi letter path, Sikh culture stories and a parent dashboard — all in one app.",
  alternates: { canonical: "/features" },
};

function CulturePreview() {
  const items = [
    ["The 10 Gurus", "Short, gentle lessons"],
    ["Sakhis", "Narrated stories"],
    ["The 5 Ks", "What each one means"],
    ["Gurpurabs", "A calendar for the year"],
  ];
  return (
    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-line bg-surface p-6" aria-hidden>
      {items.map(([t, b], i) => (
        <div key={t} className="rounded-xl bg-sunken p-4">
          <span className="mb-2 grid size-9 place-items-center rounded-md bg-surface text-brand-text">
            <Icon name={i === 3 ? "star" : "culture"} size={18} />
          </span>
          <p className="text-[15px] font-extrabold text-ink">{t}</p>
          <p className="text-caption text-ink-2">{b}</p>
        </div>
      ))}
      <div className="col-span-2 flex items-center gap-3 pt-1">
        <Sheru mood="think" size={48} decorative />
        <p className="text-[14px] font-bold text-ink-2">We never depict the Gurus — stories use places, objects and nature.</p>
      </div>
    </div>
  );
}

const previews = { paath: ReaderPreview, learn: LetterPathPreview, culture: CulturePreview, parent: ParentPreview };

export default function Features() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title="Built for little learners and calm reading"
        body="Gurmukhi Virsa brings together letters, Paath and Sikh heritage in one place — designed for kids, trusted by parents."
      >
        <nav aria-label="Jump to" className="mt-2 flex flex-wrap gap-2">
          {pillars.map((p) => (
            <a key={p.key} href={`#${p.key}`} className="inline-flex h-10 items-center gap-2 rounded-full border-[1.5px] border-line-strong bg-surface px-4 text-[14px] font-bold hover:border-navy-300">
              <Icon name={p.icon} size={16} /> {p.title}
            </a>
          ))}
        </nav>
      </PageHero>

      {pillars.map((p, i) => {
        const Preview = previews[p.key as keyof typeof previews];
        return (
          <Section key={p.key} id={p.key} tone={i % 2 ? "sunken" : "plain"} className="scroll-mt-20">
            <div className="grid items-center gap-12 web:grid-cols-2">
              <div className={i % 2 ? "web:order-last" : ""}>
                <Badge tone={p.key === "paath" ? "success" : "brand"} className="mb-4">
                  {p.free}
                </Badge>
                <SectionHead title={`${p.title} · ${p.gurmukhi}`} body={p.body} />
                <FeatureList items={p.points} />
              </div>
              <Preview />
            </div>
          </Section>
        );
      })}

      <Section>
        <SectionHead eyebrow="Everywhere" title="Works on every screen" body="One web app that adapts to phone, tablet and computer. Android and iOS apps are on the way." center />
        <div className="grid gap-5 tab:grid-cols-3">
          {[
            ["Phone", "Big tap targets and a bottom tab bar made for small hands."],
            ["Tablet", "Roomy layout for tracing letters and reading together."],
            ["Computer", "Keyboard shortcuts for the reader: Space to play, ↑ ↓ to move lines."],
          ].map(([t, b]) => (
            <div key={t} className="rounded-2xl border border-line bg-surface p-6">
              <Icon name="devices" className="mb-3 text-brand-text" />
              <h3 className="text-h3">{t}</h3>
              <p className="mt-1 text-[15px] text-ink-2">{b}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <ButtonLink href={site.appEntry}>Start learning — free</ButtonLink>
        </div>
      </Section>

      <Section tone="sunken">
        <SectionHead eyebrow="Accessible by design" title="Comfortable for every reader" center />
        <div className="grid gap-4 tab:grid-cols-2 web:grid-cols-4">
          {["Adjustable Gurbani text size", "Light and dark themes", "Full keyboard support", "Reduced-motion friendly"].map((t) => (
            <div key={t} className="flex items-center gap-3 rounded-xl bg-surface p-4 text-[15px] font-bold">
              <Icon name="check" className="text-success" /> {t}
            </div>
          ))}
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
