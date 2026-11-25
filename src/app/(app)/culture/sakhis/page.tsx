import type { Metadata } from "next";
import { SakhiList } from "@/features/culture/Sakhis";

export const metadata: Metadata = { title: "Sakhis", robots: { index: false } };

export default function Page() {
  return <SakhiList />;
}
