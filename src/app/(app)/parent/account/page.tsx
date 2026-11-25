import type { Metadata } from "next";
import { ClientOnly } from "@/components/ClientOnly";
import { AccountData } from "@/features/parent/Account";
import { ParentShell } from "@/features/parent/ui";

export const metadata: Metadata = { title: "Account & data", robots: { index: false } };

export default function Page() {
  return (
    <ClientOnly>
      <ParentShell title="Account & data">
        <AccountData />
      </ParentShell>
    </ClientOnly>
  );
}
