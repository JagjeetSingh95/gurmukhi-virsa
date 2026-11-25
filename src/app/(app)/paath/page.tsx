import type { Metadata } from "next";
import { PaathLibrary } from "./PaathLibrary";
import { TeachingKidsCard } from "./TeachingKidsCard";

export const metadata: Metadata = {
  title: "Paath",
  description: "Read Mool Mantar, Japji Sahib, Kirtan Sohila and Sukhmani Sahib with transliteration and meaning. Free forever.",
};

export default function Page() {
  return (
    <>
      <PaathLibrary />
      <TeachingKidsCard />
    </>
  );
}
