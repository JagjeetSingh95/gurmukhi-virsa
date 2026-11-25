import type { Metadata } from "next";
import { ClientOnly } from "@/components/ClientOnly";
import { CultureHome } from "@/features/culture/CultureHome";

export const metadata: Metadata = { title: "Culture", robots: { index: false } };

// Client-only: today's sakhi depends on the date and the family plan.
export default function Page() {
  return (
    <ClientOnly>
      <CultureHome />
    </ClientOnly>
  );
}
