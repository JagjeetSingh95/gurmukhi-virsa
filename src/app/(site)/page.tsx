// W.1 Landing
import Link from "next/link";
import { Sheru } from "@/components/sheru/Sheru";
import { Icon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/controls";
import {
  CtaBand,
  Faq,
  FeatureList,
  LetterPathPreview,
  ParentPreview,
  PricingCards,
  ReaderPreview,
  Section,
  SectionHead,
  TrustStrip,
} from "@/components/site/blocks";
import { pillars } from "@/content/marketing";
import { HeroCta, HeroEyebrow } from "@/components/site/VisitorCta";

const heroChips = ["🔤 35 letters through games", "🎧 Paath with meaning + audio", "📖 Stories of the Gurus"];

const floating = [
  { l: "ੳ", c: "left-[6%] top-[12%] rotate-[-8deg]" },
  { l: "ਕ", c: "right-[4%] top-[6%] rotate-[10deg]" },
  { l: "ਗ", c: "left-[2%] bottom-[14%] rotate-[6deg]" },
  { l: "ਮ", c: "right-[8%] bottom-[8%] rotate-[-6deg]" },
];

export default function Landing() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-saffron-50 via-app to-app dark:from-sunken">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 pb-16 pt-10 web:grid-cols-[1.1fr_1fr] web:px-8 web:pb-24 web:pt-16">
          <div className="flex flex-col items-start gap-5">
            <HeroEyebrow />
            <h1 className="text-display text-ink">
              Learn Gurmukhi, Paath and Sikh heritage —{" "}
              <span className="text-brand-text">made for kids.</span>
            </h1>
            <p className="max-w-xl text-body-l text-ink-2">
              Kids play their way through all 35 letters, read Paath with meaning and real audio, and discover the stories of the Gurus. Paath is free forever.
            </p>
            <ul className="flex flex-wrap gap-2" aria-label="What's inside">
              {heroChips.map((c) => (
                <li key={c} className="rounded-full border border-line bg-surface px-3 py-1.5 text-label text-ink-2">
                  {c}
                </li>
              ))}
            </ul>
            <div className="flex w-full flex-col gap-3 tab:w-auto tab:flex-row">
              <HeroCta />
              <ButtonLink href="/features" variant="secondary">
                See how it works
              </ButtonLink>
            </div>
            <p className="text-caption text-ink-3">Works in your browser — no download · No card · No ads</p>
          </div>

          <div className="relative mx-auto grid aspect-square w-full max-w-[320px] tab:max-w-[460px] place-items-center" aria-hidden>
            <div className="absolute inset-[8%] rounded-full bg-saffron-100 dark:bg-brand-soft" />
            <div className="absolute inset-[22%] rounded-full bg-saffron-300/40" />
            {floating.map((f) => (
              <span
                key={f.l}
                className={`absolute grid size-16 place-items-center rounded-xl bg-surface font-[family-name:var(--font-gurmukhi)] text-[34px] font-bold text-navy-800 shadow-[0_4px_0_var(--border-strong)] dark:text-navy-50 web:size-20 web:text-[42px] ${f.c}`}
              >
                {f.l}
              </span>
            ))}
            <Sheru mood="happy" size={240} decorative className="relative animate-bob" />
          </div>
        </div>
        <div className="mx-auto max-w-[1200px] px-5 pb-12 web:px-8">
          <TrustStrip />
        </div>
      </section>

      {/* Pillars */}
      <Section>
        <SectionHead
          eyebrow="Everything in one place"
          title="Four calm spaces, one app"
          body="Each part of Gurmukhi Virsa is built for how kids actually learn — short, playful steps — and for how families read Paath together."
          center
        />
        <div className="grid gap-5 tab:grid-cols-2 web:grid-cols-4">
          {pillars.map((p) => (
            <Link
              key={p.key}
              href={`/features#${p.key}`}
              className="group flex flex-col gap-3 rounded-2xl border border-line bg-surface p-6 transition-transform hover:-translate-y-1"
            >
              <span className="grid size-12 place-items-center rounded-lg bg-brand-soft text-brand-text">
                <Icon name={p.icon} size={26} />
              </span>
              <div className="flex items-baseline gap-2">
                <h3 className="text-h3">{p.title}</h3>
                <span lang="pa" className="font-[family-name:var(--font-gurmukhi)] text-[16px] font-bold text-ink-3">
                  {p.gurmukhi}
                </span>
              </div>
              <p className="flex-1 text-[15px] text-ink-2">{p.body}</p>
              <span className="text-label text-brand-text">{p.free}</span>
            </Link>
          ))}
        </div>
      </Section>

      {/* Paath */}
      <Section tone="sunken">
        <div className="grid items-center gap-12 web:grid-cols-2">
          <div>
            <SectionHead
              eyebrow="Paath · free forever"
              title="Read Gurbani with understanding"
              body="A quiet, respectful reader — line-by-line audio by real voices, transliteration and simple meaning you can switch on or off."
            />
            <FeatureList items={["Mool Mantar, Japji Sahib, Kirtan Sohila, Sukhmani Sahib", "Kids mode with bigger text and simple English", "Bedtime Kirtan Sohila with sleep timer", "No account needed for adults"]} />
          </div>
          <ReaderPreview />
        </div>
      </Section>

      {/* Learn */}
      <Section>
        <div className="grid items-center gap-12 web:grid-cols-2">
          <LetterPathPreview className="order-last web:order-first" />
          <div>
            <SectionHead
              eyebrow="Learn · first 10 letters free"
              title="From ੳ to ੜ, one happy step at a time"
              body="Kids hear each letter, trace it with a finger, then play quick matching games. Sheru cheers them on — gently, with no guilt."
            />
            <FeatureList items={["All 35 letters of the Painti", "Tracing, listening and quiz games", "Laga matra, words and short sentences", "Streaks that celebrate, never shame"]} />
          </div>
        </div>
      </Section>

      {/* Parents */}
      <Section tone="navy">
        <div className="grid items-center gap-12 web:grid-cols-2">
          <div>
            <SectionHead
              invert
              eyebrow="For parents"
              title="You stay in charge"
              body="One parent account, up to five kids. Every setting and purchase sits behind a parent gate, and a weekly email shows what each child learned."
            />
            <ul className="grid gap-4 tab:grid-cols-2">
              {[
                ["shield", "Parent gate", "PIN or a quick maths check before settings and payments."],
                ["mail", "Weekly summary", "Progress for each child in your inbox, once a week."],
                ["users", "Up to 5 kids", "Each child gets their own profile and path."],
                ["lock", "Minimal data", "Only your email and each child's first name."],
              ].map(([icon, t, b]) => (
                <li key={t} className="flex gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-md bg-white/10 text-saffron-300">
                    <Icon name={icon as "shield"} size={20} />
                  </span>
                  <span>
                    <span className="block text-[16px] font-extrabold text-white">{t}</span>
                    <span className="text-[14px] text-navy-50">{b}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <ParentPreview />
        </div>
      </Section>

      {/* Pricing teaser */}
      <Section>
        <SectionHead eyebrow="Pricing" title="Free to start. Family when you're ready." body="Paath is free for everyone, forever. Unlock the full Learn and Culture paths with Family." center />
        <PricingCards />
      </Section>

      {/* FAQ */}
      <Section tone="sunken">
        <SectionHead eyebrow="Questions" title="Parents often ask" center />
        <Faq limit={6} />
        <p className="mt-8 text-center text-body text-ink-2">
          More answers in the{" "}
          <Link href="/support" className="font-bold text-brand-text underline">
            help centre
          </Link>
          .
        </p>
      </Section>

      <CtaBand />
    </>
  );
}
