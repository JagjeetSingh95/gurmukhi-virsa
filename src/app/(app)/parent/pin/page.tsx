import type { Metadata } from "next";
import { ClientOnly } from "@/components/ClientOnly";
import { ParentPin } from "@/features/parent/Account";
import { ParentShell } from "@/features/parent/ui";

export const metadata: Metadata = { title: "Parent PIN", robots: { index: false } };

export default function Page() {
  return (
    <ClientOnly>
      <ParentShell title="Parent PIN">
        <ParentPin />
      </ParentShell>
    </ClientOnly>
  );
}
