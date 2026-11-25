// W.4 Contact
import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { PageHero, Section } from "@/components/site/blocks";
import { site } from "@/lib/site";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions, feedback or school enquiries — get in touch with the Gurmukhi Virsa team.",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return (
    <>
      <PageHero eyebrow="Contact" title="We'd love to hear from you" body="Questions, ideas, corrections or school enquiries — we read every message and reply within 2 working days." />
      <Section>
        <div className="grid gap-10 web:grid-cols-[1fr_1.4fr]">
          <div className="flex flex-col gap-4">
            {[
              { icon: "mail" as const, t: "Email", b: site.supportEmail, href: `mailto:${site.supportEmail}` },
              { icon: "info" as const, t: "Help centre", b: "Answers to common questions", href: "/support" },
              { icon: "book" as const, t: "Gurbani corrections", b: "Spotted an error in text, meaning or audio? Choose “Content” and tell us the bani and line.", href: undefined },
            ].map((c) => (
              <div key={c.t} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-md bg-brand-soft text-brand-text">
                  <Icon name={c.icon} size={22} />
                </span>
                <div>
                  <h2 className="text-[17px] font-extrabold">{c.t}</h2>
                  {c.href ? (
                    c.href.startsWith("/") ? (
                      <Link href={c.href} className="text-[15px] font-bold text-brand-text underline">
                        {c.b}
                      </Link>
                    ) : (
                      <a href={c.href} className="text-[15px] font-bold text-brand-text underline">
                        {c.b}
                      </a>
                    )
                  ) : (
                    <p className="text-[15px] text-ink-2">{c.b}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <ContactForm />
        </div>
      </Section>
    </>
  );
}
