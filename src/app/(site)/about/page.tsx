// W.4 About
import type { Metadata } from "next";
import { Sheru } from "@/components/sheru/Sheru";
import { CtaBand, PageHero, Section, SectionHead } from "@/components/site/blocks";
import { principles } from "@/content/marketing";

export const metadata: Metadata = {
  title: "About",
  description: "Why we built Gurmukhi Virsa, and the principles that guide how we treat Gurbani, Sikh heritage and children's privacy.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Keeping our virsa alive, one child at a time"
        body="Virsa (ਵਿਰਸਾ) means heritage. Gurmukhi Virsa helps children growing up far from Punjab connect with their script, their Paath and their history."
      />

      <Section>
        <div className="grid items-center gap-12 web:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col gap-4 text-body-l text-ink-2">
            <h2 className="text-h1 text-ink">Why we built this</h2>
            <p>
              Many Punjabi families abroad want their kids to read Gurmukhi and understand Paath — but classes are far away, weekends are busy, and most apps are either too dry for kids or not respectful enough for Gurbani.
            </p>
            <p>
              We set out to make something kids genuinely enjoy, that parents can trust, and that treats Gurbani with the care it deserves. Learning is playful. Paath is calm. And the two never mix.
            </p>
          </div>
          <div className="mx-auto grid size-72 place-items-center rounded-full bg-saffron-100 dark:bg-brand-soft">
            <Sheru mood="proud" size={160} decorative />
          </div>
        </div>
      </Section>

      <Section tone="sunken">
        <SectionHead eyebrow="Our principles" title="How we make decisions" body="These rules apply to every screen, illustration and email we create." />
        <div className="grid gap-5 tab:grid-cols-2 web:grid-cols-3">
          {principles.map((p, i) => (
            <div key={p.title} className="rounded-2xl border border-line bg-surface p-6">
              <span className="mb-3 grid size-10 place-items-center rounded-full bg-brand-soft text-[16px] font-black text-brand-text">{i + 1}</span>
              <h3 className="text-h3">{p.title}</h3>
              <p className="mt-1.5 text-[15px] text-ink-2">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHead eyebrow="Meet Sheru" title="Our little lion cub" body="Sheru (ਸ਼ੇਰੂ) cheers kids on in Learn and Culture. He takes a nap when it's time for Paath — you'll never see him near Gurbani." />
        <div className="flex flex-wrap gap-6">
          {(["happy", "cheer", "think", "oops", "sleepy", "proud"] as const).map((m) => (
            <figure key={m} className="flex flex-col items-center gap-2">
              <span className="grid size-28 place-items-center rounded-2xl bg-surface shadow-[0_3px_0_var(--border-default)]">
                <Sheru mood={m} size={96} />
              </span>
              <figcaption className="text-label capitalize text-ink-2">{m}</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
