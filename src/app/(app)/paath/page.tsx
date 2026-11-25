import type { Metadata } from "next";
import { Placeholder } from "@/components/shell/Placeholder";

export const metadata: Metadata = { title: "Paath", robots: { index: false } };

export default function Page() {
  return <Placeholder title="Paath" task="N.4.1" body="Mool Mantar, Japji Sahib (pauris 1–5), Kirtan Sohila and Sukhmani Sahib — with transliteration, meaning and audio. Free forever." />;
}
