import { ClientOnly } from "@/components/ClientOnly";
import type { Metadata } from "next";
import { WordsTopic } from "@/features/learn/Topics";

export const metadata: Metadata = { title: "Word builder", robots: { index: false } };

export default function Page() {
  return (
    <ClientOnly>
      <WordsTopic />
    </ClientOnly>
  );
}
