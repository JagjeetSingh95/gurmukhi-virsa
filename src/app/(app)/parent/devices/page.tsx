import type { Metadata } from "next";
import { ClientOnly } from "@/components/ClientOnly";
import { Devices } from "@/features/parent/Devices";
import { ParentShell } from "@/features/parent/ui";

export const metadata: Metadata = { title: "Devices", robots: { index: false } };

export default function Page() {
  return (
    <ClientOnly>
      <ParentShell title="Devices">
        <Devices />
      </ParentShell>
    </ClientOnly>
  );
}
