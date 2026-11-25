import type { Metadata } from "next";
import { GuruList } from "@/features/culture/Gurus";

export const metadata: Metadata = { title: "The 10 Gurus", robots: { index: false } };

export default function Page() {
  return <GuruList />;
}
