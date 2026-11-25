// Marketing building blocks (Module W). Mascot never appears inside Gurbani previews.
import type { ReactNode } from "react";
import { IkOnkar } from "@/components/IkOnkar";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/icons";
import { Sheru } from "@/components/sheru/Sheru";
import { ButtonLink } from "@/components/ui/controls";
import { Badge, Progress } from "@/components/ui/display";
import { faqs, plans } from "@/content/marketing";
import { site } from "@/lib/site";

export function Section({ id, className, children, tone }: { id?: string; className?: string; children: ReactNode; tone?: "plain" | "sunken" | "navy" }) {
  return (
    <section
      id={id}
      className={cn(
        tone === "sunken" && "bg-sunken",
        tone === "navy" && "bg-navy-800 text-white dark:bg-navy-900",
        className,
      )}
    >
      <div className="mx-auto max-w-[1200px] px-5 py-16 web:px-8 web:py-24">{children}</div>
    </section>
  );
}

export function SectionHead({ eyebrow, title, body, center, invert }: { eyebrow?: string; title: string; body?: string; center?: boolean; invert?: boolean }) {
  return (
    <div className={cn("mb-10 flex max-w-2xl flex-col gap-3", center && "mx-auto items-center text-center")}>
      {eyebrow && <span className={cn("text-label uppercase tracking-[0.12em]", invert ? "text-saffron-300" : "text-brand-text")}>{eyebrow}</span>}
      <h2 className={cn("text-h1", invert ? "text-white" : "text-ink")}>{title}</h2>
      {body && <p className={cn("text-body-l", invert ? "text-navy-50" : "text-ink-2")}>{body}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, body, children }: { eyebrow: string; title: string; body: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-saffron-50 to-app dark:from-sunken">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-5 py-14 web:px-8 web:py-20">
        <span className="text-label uppercase tracking-[0.12em] text-brand-text">{eyebrow}</span>
        <h1 className="max-w-3xl text-display text-ink">{title}</h1>
        <p className="max-w-2xl text-body-l text-ink-2">{body}</p>
        {children}
      </div>
    </section>
  );
}

/** Calm reader preview — Mool Mantar. No mascot, no decoration (respect rules). */
export function ReaderPreview({ className }: { className?: string }) {
  return (
    <figure className={cn("overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_8px_30px_-12px_rgba(42,32,24,.25)]", className)}>
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <span className="text-label text-ink">Mool Mantar</span>
        <span className="flex gap-1.5">
          <Badge tone="navy">Roman</Badge>
          <Badge tone="navy">Meaning</Badge>
        </span>
      </div>
      <div className="flex flex-col gap-1 px-5 py-6">
        <p lang="pa" className="rounded-md bg-hl px-3 py-2 text-gurbani-adult">
          <IkOnkar /> ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ॥
        </p>
        <p className="px-3 text-[15px] italic font-semibold text-ink-2">Ik Oankaar Sat Naam Kartaa Purakh Nirbhau Nirvair</p>
        <p className="px-3 text-[15px] text-ink-2">One Creator. Truth is the Name. The Creator, without fear, without hate.</p>
        <p lang="pa" className="mt-3 px-3 text-gurbani-adult opacity-70">
          ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥
        </p>
      </div>
      <div className="flex items-center gap-3 border-t border-line bg-sunken/60 px-5 py-3">
        <span className="grid size-10 place-items-center rounded-full bg-navy-800 text-white dark:bg-navy-600">
          <Icon name="play" size={16} />
        </span>
        <Progress value={34} label="Audio position" className="flex-1" />
        <span className="text-caption text-ink-2">0:21</span>
      </div>
      <figcaption className="sr-only">Preview of the Paath reader showing Mool Mantar with transliteration and meaning</figcaption>
    </figure>
  );
}

const letters = ["ੳ", "ਅ", "ੲ", "ਸ", "ਹ", "ਕ", "ਖ"];

export function LetterPathPreview({ className }: { className?: string }) {
  return (
    <div className={cn("relative rounded-2xl border border-line bg-surface p-6", className)} aria-hidden>
      <div className="mb-5 flex items-center justify-between">
        <span className="text-label text-ink">Painti · Row 1</span>
        <Badge tone="reward" icon="star">
          5-day streak
        </Badge>
      </div>
      <div className="grid grid-cols-4 gap-3 tab:grid-cols-7">
        {letters.map((l, i) => (
          <span
            key={l}
            className={cn(
              "grid aspect-square place-items-center rounded-xl font-[family-name:var(--font-gurmukhi)] text-[32px] font-bold",
              i < 3 && "bg-success-bg text-success shadow-[0_3px_0_var(--green-600)]",
              i === 3 && "bg-brand text-white shadow-[0_4px_0_var(--brand-shadow)] ring-4 ring-brand-soft",
              i > 3 && "bg-sunken text-ink-3",
            )}
          >
            {l}
          </span>
        ))}
        <span className="grid aspect-square place-items-center rounded-xl bg-sunken text-ink-3 tab:hidden">
          <Icon name="lock" size={20} />
        </span>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <Sheru mood="cheer" size={48} decorative />
        <p className="text-[15px] font-bold text-ink">ਸ is for ਸੇਬ (apple)! Trace it next.</p>
      </div>
    </div>
  );
}

export function ParentPreview({ className }: { className?: string }) {
  const kids = [
    { name: "Simran", emoji: "🦋", pct: 72, note: "Letters 18/35 · Japji pauri 3" },
    { name: "Arjan", emoji: "🚀", pct: 40, note: "Letters 10/35 · 2 sakhis" },
  ];
  return (
    <div className={cn("rounded-2xl border border-line bg-surface p-6", className)} aria-hidden>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-label text-ink">This week</span>
        <Badge tone="success" icon="shield">
          Parent gate on
        </Badge>
      </div>
      <div className="flex flex-col gap-4">
        {kids.map((k) => (
          <div key={k.name} className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-xl bg-brand-soft text-[24px]">{k.emoji}</span>
            <div className="flex-1">
              <div className="flex justify-between text-[15px] font-extrabold text-ink">
                <span>{k.name}</span>
                <span>{k.pct}%</span>
              </div>
              <Progress value={k.pct} label={`${k.name} progress`} tone="success" className="my-1.5" />
              <span className="text-caption text-ink-2">{k.note}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((p) => (
        <li key={p} className="flex items-start gap-2.5 text-body text-ink">
          <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-success-bg text-success">
            <Icon name="check" size={14} strokeWidth={3} />
          </span>
          {p}
        </li>
      ))}
    </ul>
  );
}

export function TrustStrip() {
  const items: [IconName, string][] = [
    ["book", "Paath free forever"],
    ["shield", "No ads, no tracking"],
    ["heart", "Real voices for Gurbani"],
    ["devices", "Phone, tablet & computer"],
  ];
  return (
    <ul className="grid grid-cols-2 gap-4 web:grid-cols-4">
      {items.map(([icon, label]) => (
        <li key={label} className="flex items-center gap-3 text-[15px] font-bold text-ink">
          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-surface text-brand-text shadow-[0_2px_0_var(--border-default)]">
            <Icon name={icon} size={20} />
          </span>
          {label}
        </li>
      ))}
    </ul>
  );
}

export function PricingCards() {
  return (
    <div className="mx-auto grid max-w-4xl gap-6 tab:grid-cols-2">
      {plans.map((p) => {
        const featured = p.id === "family";
        return (
          <div
            key={p.id}
            className={cn(
              "relative flex flex-col gap-5 rounded-2xl border-2 bg-surface p-7",
              featured ? "border-brand shadow-[0_6px_0_var(--brand-shadow)]" : "border-line",
            )}
          >
            {featured && (
              <span className="absolute -top-3.5 left-7 flex items-center gap-2">
                <Badge tone="brand" className="!bg-brand !text-white">
                  Most loved
                </Badge>
              </span>
            )}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-h2">{p.name}</h3>
                <p className="mt-1 text-[22px] font-black text-ink">{p.price}</p>
                <p className="text-caption text-ink-2">{p.note}</p>
              </div>
              {featured && <Sheru mood="proud" size={48} decorative />}
            </div>
            <ul className="flex flex-1 flex-col gap-2.5">
              {p.features.map(([f, ok]) => (
                <li key={f} className={cn("flex items-start gap-2.5 text-[15px]", ok ? "text-ink" : "text-ink-3 line-through decoration-1")}>
                  <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full", ok ? "bg-success-bg text-success" : "bg-sunken text-ink-3")}>
                    <Icon name={ok ? "check" : "close"} size={12} strokeWidth={3} />
                  </span>
                  <span className={ok ? "" : "no-underline"}>{f}</span>
                </li>
              ))}
            </ul>
            <ButtonLink href={site.appEntry} variant={featured ? "primary" : "secondary"} block>
              {p.cta}
            </ButtonLink>
          </div>
        );
      })}
    </div>
  );
}

export function Faq({ group, limit }: { group?: "general" | "pricing" | "privacy"; limit?: number }) {
  const list = (group ? faqs.filter((f) => f.group === group) : faqs).slice(0, limit);
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3">
      {list.map((f) => (
        <details key={f.q} className="group rounded-xl border border-line bg-surface px-5 open:shadow-[0_3px_0_var(--border-default)]">
          <summary className="flex cursor-pointer list-none items-center gap-3 py-4 text-[17px] font-extrabold text-ink [&::-webkit-details-marker]:hidden">
            <span className="flex-1">{f.q}</span>
            <Icon name="chevron-down" size={20} className="shrink-0 text-ink-3 transition-transform group-open:rotate-180" />
          </summary>
          <p className="pb-5 text-body text-ink-2">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function CtaBand() {
  return (
    <Section>
      <div className="flex flex-col items-center gap-6 rounded-2xl bg-navy-800 px-6 py-12 text-center text-white dark:bg-navy-900 web:flex-row web:px-12 web:text-left">
        <Sheru mood="happy" size={96} decorative className="animate-bob" />
        <div className="flex-1">
          <h2 className="text-h1 text-white">Start with one letter today.</h2>
          <p className="mt-2 text-body-l text-navy-50">Paath is free forever. Kids get 10 letters and 2 sakhis free — no card needed.</p>
        </div>
        <div className="flex flex-col gap-3 tab:flex-row">
          <ButtonLink href={site.appEntry}>Open web app</ButtonLink>
          <ButtonLink href="/pricing" variant="secondary">
            See plans
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 web:px-8 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-h2 [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-h3 [&_li]:mb-1.5 [&_p]:mb-4 [&_p]:text-body [&_p]:text-ink-2 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-body [&_ul]:text-ink-2 [&_a]:font-bold [&_a]:text-brand-text [&_a]:underline">
      {children}
    </div>
  );
}
