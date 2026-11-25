import type { Metadata } from "next";
import { GurdwaraList } from "@/features/culture/CultureMore";

export const metadata: Metadata = { title: "Gurdwaras", robots: { index: false } };

export default function Page() {
  return <GurdwaraList />;
}
