import type { Metadata } from "next";
import { ClientOnly } from "@/components/ClientOnly";
import { WeeklyEmail } from "@/features/parent/Notifications";
import { ParentShell } from "@/features/parent/ui";

export const metadata: Metadata = { title: "Weekly email", robots: { index: false } };

export default function Page() {
  return (
    <ClientOnly>
      <ParentShell title="Weekly email">
        <WeeklyEmail />
      </ParentShell>
    </ClientOnly>
  );
}
