// W.6 Terms — DRAFT, needs legal review before launch.
import type { Metadata } from "next";
import { Badge } from "@/components/ui/display";
import { PageHero, Prose } from "@/components/site/blocks";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The terms for using Gurmukhi Virsa.",
  alternates: { canonical: "/terms" },
};

export default function Terms() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms of use" body="Plain-language terms for families using Gurmukhi Virsa.">
        <Badge tone="reward">Draft · last updated 25 Nov 2026</Badge>
      </PageHero>
      <Prose>
        <h2>1. Using the app</h2>
        <p>Adults can use Paath without an account. A parent or guardian (18+) must create the account and any child profiles, and is responsible for how children in their family use the app.</p>
        <h2>2. Plans and trials</h2>
        <p>Paath is free. The Family plan is a subscription that renews until cancelled. New families can try it free for 7 days; we email a reminder before the trial ends. You can cancel any time and keep access until the end of the paid period.</p>
        <h2>3. Gurbani and content</h2>
        <p>Gurbani text is presented with respect and care. Translations and transliterations are aids to understanding and are not a substitute for learning from a Granthi or teacher. If you find an error, please tell us.</p>
        <h2>4. Acceptable use</h2>
        <ul>
          <li>Don&apos;t misuse the service, try to break it or access other families&apos; data.</li>
          <li>Don&apos;t copy or redistribute our lessons, audio or artwork without permission.</li>
        </ul>
        <h2>5. Availability</h2>
        <p>We work hard to keep the app running but can&apos;t promise it will always be available or error-free.</p>
        <h2>6. Ending your account</h2>
        <p>You can delete your account at any time from Settings. We may suspend accounts that break these terms.</p>
        <h2>7. Contact</h2>
        <p>
          Questions? Email <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
        </p>
      </Prose>
    </>
  );
}
