// W.6 Privacy policy — DRAFT, needs legal review before launch.
import type { Metadata } from "next";
import { Badge } from "@/components/ui/display";
import { PageHero, Prose } from "@/components/site/blocks";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What Gurmukhi Virsa collects (very little), why, and how to delete it.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy policy" body="The short version: we collect as little as possible, never sell it, never show ads and never use third-party trackers.">
        <Badge tone="reward">Draft · last updated 25 Nov 2026</Badge>
      </PageHero>
      <Prose>
        <h2>1. Who we are</h2>
        <p>
          {site.name} (“we”) provides a learning app for Gurmukhi, Paath and Sikh heritage. Contact us at <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
        </p>
        <h2>2. What we collect</h2>
        <ul>
          <li><strong>Parent account:</strong> your email address (used to sign in and, if you choose, for the weekly summary).</li>
          <li><strong>Child profiles:</strong> first name (or nickname), age range, chosen avatar and level. No photos, no surnames, no date of birth.</li>
          <li><strong>Learning progress:</strong> lessons completed, quiz results, streaks, bookmarks and settings.</li>
          <li><strong>Adult guest mode:</strong> bookmarks and settings stay on your device until you create an account.</li>
        </ul>
        <p>We do not collect location, contacts, voice recordings, advertising IDs or browsing history.</p>
        <h2>3. Children&apos;s privacy</h2>
        <p>
          Children never create accounts. A parent sets up each child profile after giving consent, in line with COPPA (US) and GDPR-K / UK Age Appropriate Design Code. Kids never see prices, ads or external links; these sit behind a parent gate.
        </p>
        <h2>4. How we use data</h2>
        <ul>
          <li>To run the app: sign-in, saving progress, syncing between your devices.</li>
          <li>To send emails you asked for: sign-in links, weekly summary, trial reminders. You can turn optional emails off.</li>
          <li>We never sell or share data for advertising.</li>
        </ul>
        <h2>5. Service providers</h2>
        <p>We use a small number of providers to host the app and send email (for example our database/auth host, web host and email service). They process data only on our instructions.</p>
        <h2>6. Cookies</h2>
        <p>We only use cookies and local storage needed for sign-in and remembering your settings. No analytics or advertising cookies.</p>
        <h2>7. Keeping and deleting data</h2>
        <p>You can delete a child profile or your whole account in Settings (behind the parent gate). Deleted data is removed from our systems within 30 days. You can also request a copy of your data.</p>
        <h2>8. Your rights</h2>
        <p>Depending on where you live you may have rights to access, correct, export or delete your data, and to complain to a regulator. Email us and we&apos;ll help.</p>
        <h2>9. Changes</h2>
        <p>If we make important changes we&apos;ll email parents before they take effect.</p>
      </Prose>
    </>
  );
}
