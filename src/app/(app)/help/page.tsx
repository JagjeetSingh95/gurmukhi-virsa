// N.9.2 In-app Help (U12): FAQ by topic + ways to reach us. Writing to us sits behind the parent gate.
import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Faq } from "@/components/site/blocks";
import { ButtonLink } from "@/components/ui/controls";
import { TopBar } from "@/components/ui/display";

export const metadata: Metadata = { title: "Help", robots: { index: false } };

const groups = [
  { id: "general", title: "Using Gurmukhi Virsa" },
  { id: "pricing", title: "Plans & trial" },
  { id: "privacy", title: "Privacy & safety" },
] as const;

export default function Page() {
  return (
    <>
      <TopBar title="Help" />
      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-8 px-5 py-6 web:px-8">
        {groups.map((g) => (
          <section key={g.id} aria-labelledby={`h-${g.id}`} className="flex flex-col gap-3">
            <h2 id={`h-${g.id}`} className="text-h3">{g.title}</h2>
            <div className="[&>div]:w-full [&>div]:max-w-none">
              <Faq group={g.id} />
            </div>
          </section>
        ))}
        <section className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-h3">Still stuck?</h2>
          <p className="text-[15px] text-ink-2">Grown-ups can write to us — we reply within 2 working days. Spotted a mistake in Gurbani text, meaning or audio? Tell us the bani and line.</p>
          <ButtonLink href="/parent/contact" className="gap-2"><Icon name="mail" size={18} /> Contact us (grown-ups)</ButtonLink>
          <p className="text-caption text-ink-3">
            <Link href="/privacy" className="underline">Privacy</Link> · <Link href="/terms" className="underline">Terms</Link>
          </p>
        </section>
      </div>
    </>
  );
}
