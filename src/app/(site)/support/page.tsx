// W.6 Help & support
import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/controls";
import { Faq, PageHero, Section, SectionHead } from "@/components/site/blocks";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Help centre",
  description: "Answers about Gurmukhi Virsa accounts, kids' profiles, plans, privacy and Paath.",
  alternates: { canonical: "/support" },
};

const topics = [
  { icon: "users" as const, t: "Getting started", b: "Adult guest mode, parent sign-in and adding a child.", href: "#general" },
  { icon: "star" as const, t: "Plans & billing", b: "Free vs Family, trials and cancelling.", href: "#pricing" },
  { icon: "shield" as const, t: "Privacy & safety", b: "What we collect, parent gate, deleting data.", href: "#privacy" },
  { icon: "mail" as const, t: "Still stuck?", b: "Send us a message — we reply within 2 working days.", href: "/contact" },
];

export default function Support() {
  return (
    <>
      <PageHero eyebrow="Help centre" title="How can we help?" body="Quick answers to the questions families ask most." />
      <Section>
        <div className="grid gap-4 tab:grid-cols-2 web:grid-cols-4">
          {topics.map((t) => (
            <Link key={t.t} href={t.href} className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-6 transition-transform hover:-translate-y-0.5">
              <Icon name={t.icon} className="text-brand-text" />
              <h2 className="text-h3">{t.t}</h2>
              <p className="text-[15px] text-ink-2">{t.b}</p>
            </Link>
          ))}
        </div>
      </Section>
      {(
        [
          ["general", "Getting started"],
          ["pricing", "Plans & billing"],
          ["privacy", "Privacy & safety"],
        ] as const
      ).map(([g, title], i) => (
        <Section key={g} id={g} tone={i % 2 ? "plain" : "sunken"} className="scroll-mt-20">
          <SectionHead title={title} center />
          <Faq group={g} />
        </Section>
      ))}
      <Section>
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-h2">Didn&apos;t find your answer?</h2>
          <ButtonLink href="/contact">Contact us</ButtonLink>
          <p className="text-caption text-ink-3">or email {site.supportEmail}</p>
        </div>
      </Section>
    </>
  );
}
