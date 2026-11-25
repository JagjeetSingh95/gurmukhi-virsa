import type { Metadata } from "next";
import { ClientOnly } from "@/components/ClientOnly";
import { Reminders } from "@/features/parent/Notifications";
import { ParentShell } from "@/features/parent/ui";

export const metadata: Metadata = { title: "Reminders", robots: { index: false } };

export default function Page() {
  return (
    <ClientOnly>
      <ParentShell title="Reminders">
        <Reminders />
      </ParentShell>
    </ClientOnly>
  );
}
