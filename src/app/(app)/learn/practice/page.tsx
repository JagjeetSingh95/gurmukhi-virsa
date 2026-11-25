import { ClientOnly } from "@/components/ClientOnly";
import type { Metadata } from "next";
import { Practice } from "@/features/learn/Practice";

export const metadata: Metadata = { title: "Practice", robots: { index: false } };

export default function Page() {
  return (
    <ClientOnly>
      <Practice />
    </ClientOnly>
  );
}
