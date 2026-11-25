// W.3 Pricing + FAQ
import type { Metadata } from "next";
import { Icon } from "@/components/icons";
import { CtaBand, Faq, PageHero, PricingCards, Section, SectionHead } from "@/components/site/blocks";
import { faqs } from "@/content/marketing";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Paath is free forever. Start free with 10 letters and 2 sakhis, or try the Family plan free for 7 days.",
  alternates: { canonical: "/pricing" },
};

const compare: [string, string, string][] = [
  ["Paath reader, audio, meaning", "✓", "✓"],
  ["Gurmukhi letters", "First 10", "All 35"],
  ["Laga matra, words, sentences", "—", "✓"],
  ["Sakhis", "2", "All"],
  ["Culture lessons", "Preview", "All"],
  ["Child profiles", "1", "Up to 5"],
  ["Practice mode", "—", "✓"],
  ["Weekly progress email", "—", "✓"],
];

export default function Pricing() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.filter((f) => f.group === "pricing").map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero eyebrow="Pricing" title="Simple plans for every family" body="Paath stays free for everyone, forever. Upgrade to Family to unlock every letter, story and child profile." />

      <Section>
        <PricingCards />
        <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-x-8 gap-y-3 text-[15px] font-bold text-ink-2">
          {["7-day free trial", "Reminder before it ends", "Cancel any time", "Kids never see prices"].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <Icon name="check" size={18} className="text-success" /> {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="sunken">
        <SectionHead title="Compare plans" center />
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-line bg-surface">
          <table className="w-full text-left text-[15px]">
            <caption className="sr-only">Free and Family plan comparison</caption>
            <thead className="bg-sunken text-label text-ink-2">
              <tr>
                <th scope="col" className="px-5 py-3">Feature</th>
                <th scope="col" className="px-5 py-3 text-center">Free</th>
                <th scope="col" className="px-5 py-3 text-center text-brand-text">Family</th>
              </tr>
            </thead>
            <tbody>
              {compare.map(([f, a, b]) => (
                <tr key={f} className="border-t border-line">
                  <th scope="row" className="px-5 py-3.5 font-bold text-ink">{f}</th>
                  <td className="px-5 py-3.5 text-center text-ink-2">{a}</td>
                  <td className="px-5 py-3.5 text-center font-extrabold text-ink">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section>
        <SectionHead eyebrow="FAQ" title="Questions about plans" center />
        <Faq group="pricing" />
        <div className="mt-3" />
        <Faq group="privacy" />
      </Section>

      <Section tone="sunken">
        <div className="mx-auto max-w-3xl rounded-2xl border border-line bg-surface p-7 text-center">
          <h2 className="text-h2">Punjabi school or Gurdwara class?</h2>
          <p className="mt-2 text-body text-ink-2">We&apos;re planning group plans for teachers. Get in touch and we&apos;ll let you know first.</p>
          <a href="/contact" className="mt-4 inline-block font-extrabold text-brand-text underline">Contact us</a>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
