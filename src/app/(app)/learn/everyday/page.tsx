import { ClientOnly } from "@/components/ClientOnly";
import type { Metadata } from "next";
import { EverydayTopic } from "@/features/learn/Topics";

export const metadata: Metadata = { title: "Everyday words", robots: { index: false } };

export default function Page() {
  return (
    <ClientOnly>
      <EverydayTopic />
    </ClientOnly>
  );
}
