import { ClientOnly } from "@/components/ClientOnly";
import type { Metadata } from "next";
import { SentencesTopic } from "@/features/learn/Topics";

export const metadata: Metadata = { title: "Sentences", robots: { index: false } };

export default function Page() {
  return (
    <ClientOnly>
      <SentencesTopic />
    </ClientOnly>
  );
}
