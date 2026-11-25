import type { Metadata } from "next";
import { SavedView } from "./SavedView";

export const metadata: Metadata = { title: "Saved", robots: { index: false } };

export default function Page() {
  return <SavedView />;
}
