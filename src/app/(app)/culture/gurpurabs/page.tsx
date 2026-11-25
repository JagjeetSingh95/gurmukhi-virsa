import type { Metadata } from "next";
import { ClientOnly } from "@/components/ClientOnly";
import { GurpurabCalendar } from "@/features/culture/CultureMore";

export const metadata: Metadata = { title: "Gurpurab calendar", robots: { index: false } };

export default function Page() {
  return (
    <ClientOnly>
      <GurpurabCalendar />
    </ClientOnly>
  );
}
