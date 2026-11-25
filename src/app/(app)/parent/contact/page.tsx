import type { Metadata } from "next";
import { ClientOnly } from "@/components/ClientOnly";
import { ParentContact } from "@/features/parent/Account";
import { ParentShell } from "@/features/parent/ui";

export const metadata: Metadata = { title: "Contact us", robots: { index: false } };

export default function Page() {
  return (
    <ClientOnly>
      <ParentShell title="Contact us" back="/help">
        <ParentContact />
      </ParentShell>
    </ClientOnly>
  );
}
