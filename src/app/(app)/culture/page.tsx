import type { Metadata } from "next";
import { CultureHome } from "@/features/culture/CultureHome";

export const metadata: Metadata = { title: "Culture", robots: { index: false } };

// N.9.5: server-rendered too; today's sakhi (date + plan) swaps in after hydration without a mismatch.
export default function Page() {
  return <CultureHome />;
}
