import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "./SearchView";

export const metadata: Metadata = { title: "Search Paath", robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SearchView />
    </Suspense>
  );
}
