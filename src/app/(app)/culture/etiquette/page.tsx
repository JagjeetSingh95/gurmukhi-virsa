import type { Metadata } from "next";
import { Etiquette } from "@/features/culture/CultureMore";

export const metadata: Metadata = { title: "Gurdwara etiquette", robots: { index: false } };

export default function Page() {
  return <Etiquette />;
}
