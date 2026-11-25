import { ClientOnly } from "@/components/ClientOnly";
import type { Metadata } from "next";
import { MatraTopic } from "@/features/learn/Topics";

export const metadata: Metadata = { title: "Laga Matra", robots: { index: false } };

export default function Page() {
  return (
    <ClientOnly>
      <MatraTopic />
    </ClientOnly>
  );
}
