import type { Metadata } from "next";
import { Suspense } from "react";
import { PlansPage } from "./PlansPage";

export const metadata: Metadata = { title: "Plans", robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PlansPage />
    </Suspense>
  );
}
