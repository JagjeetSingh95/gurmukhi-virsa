import { ClientOnly } from "@/components/ClientOnly";
import type { Metadata } from "next";
import { LearnHome } from "@/features/learn/LearnHome";

export const metadata: Metadata = { title: "Learn", robots: { index: false } };

export default function Page() {
  return (
    <ClientOnly>
      <LearnHome />
    </ClientOnly>
  );
}
