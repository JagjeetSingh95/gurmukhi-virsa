// W.5 Download / Open web app
import type { Metadata } from "next";
import { Icon } from "@/components/icons";
import { Sheru } from "@/components/sheru/Sheru";
import { ButtonLink } from "@/components/ui/controls";
import { Badge } from "@/components/ui/display";
import { PageHero, Section, SectionHead } from "@/components/site/blocks";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Get the app",
  description: "Use Gurmukhi Virsa in your browser today on phone, tablet or computer. Android and iOS apps are coming soon.",
  alternates: { canonical: "/download" },
};

const install = [
  { t: "iPhone & iPad (Safari)", s: ["Open the web app", "Tap the Share button", "Choose “Add to Home Screen”"] },
  { t: "Android (Chrome)", s: ["Open the web app", "Tap the ⋮ menu", "Choose “Install app” or “Add to Home screen”"] },
  { t: "Computer (Chrome / Edge)", s: ["Open the web app", "Click the install icon in the address bar", "Pin it to your dock or taskbar"] },
];

export default function Download() {
  return (
    <>
      <PageHero eyebrow="Get the app" title="Start learning in your browser — right now" body="No download needed. Gurmukhi Virsa works on any phone, tablet or computer. Native apps are on the way.">
        <div className="mt-2 flex flex-col gap-3 tab:flex-row">
          <ButtonLink href={site.appEntry}>
            Open web app <Icon name="arrow-right" size={18} />
          </ButtonLink>
          <ButtonLink href="/pricing" variant="secondary">
            See plans
          </ButtonLink>
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-6 web:grid-cols-3">
          <div className="flex flex-col gap-4 rounded-2xl border-2 border-brand bg-surface p-7 shadow-[0_6px_0_var(--brand-shadow)]">
            <Badge tone="success">Available now</Badge>
            <Icon name="devices" size={36} className="text-brand-text" />
            <h2 className="text-h2">Web app</h2>
            <p className="flex-1 text-[15px] text-ink-2">Paath, Learn, Culture and the parent dashboard — in any modern browser.</p>
            <ButtonLink href={site.appEntry} block>
              Open web app
            </ButtonLink>
          </div>
          {[
            ["Android", "Google Play"],
            ["iPhone & iPad", "App Store"],
          ].map(([t, store]) => (
            <div key={t} className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-7">
              <Badge tone="info">Coming soon</Badge>
              <Icon name="devices" size={36} className="text-ink-3" />
              <h2 className="text-h2">{t}</h2>
              <p className="flex-1 text-[15px] text-ink-2">On {store}, with offline Paath and smoother tracing. Your progress will carry over from the web.</p>
              <span aria-disabled className="flex h-[var(--control-h)] items-center justify-center rounded-lg bg-sunken text-[15px] font-extrabold text-ink-3 web:rounded-md">
                {store} — soon
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="sunken">
        <SectionHead eyebrow="Tip" title="Add it to your home screen" body="Install the web app so it opens full-screen like a normal app — one tap for your kids." />
        <div className="grid gap-5 tab:grid-cols-3">
          {install.map((i) => (
            <div key={i.t} className="rounded-2xl border border-line bg-surface p-6">
              <h3 className="mb-3 text-h3">{i.t}</h3>
              <ol className="flex flex-col gap-2">
                {i.s.map((s, n) => (
                  <li key={s} className="flex gap-3 text-[15px] text-ink-2">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-soft text-[13px] font-black text-brand-text">{n + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="flex flex-col items-center gap-4 text-center">
          <Sheru mood="cheer" size={96} decorative />
          <h2 className="text-h2">Using a second device?</h2>
          <p className="max-w-lg text-body text-ink-2">On your child&apos;s tablet, choose “Join my family” and enter the 6-digit family code from the parent dashboard. No second sign-in needed.</p>
        </div>
      </Section>
    </>
  );
}
