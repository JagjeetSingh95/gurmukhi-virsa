import type { Metadata } from "next";
import { FiveKs } from "@/features/culture/CultureMore";

export const metadata: Metadata = { title: "The 5 Ks", robots: { index: false } };

export default function Page() {
  return <FiveKs />;
}
