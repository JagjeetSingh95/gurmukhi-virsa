import type { Metadata } from "next";
import { ClientOnly } from "@/components/ClientOnly";
import { KidProfile } from "@/features/learn/KidProfile";

export const metadata: Metadata = { title: "My profile", robots: { index: false } };

export default function Page() {
  return (
    <ClientOnly>
      <KidProfile />
    </ClientOnly>
  );
}
