import type { Metadata } from "next";
import { LearnHome } from "@/features/learn/LearnHome";

export const metadata: Metadata = { title: "Learn", robots: { index: false } };

// N.9.5: rendered on the server too (empty progress), so the path paints before JS runs; device progress fills in on hydrate.
export default function Page() {
  return <LearnHome />;
}
