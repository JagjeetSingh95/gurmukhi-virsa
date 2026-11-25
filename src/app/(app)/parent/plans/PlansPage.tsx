"use client";
// ?from= = page to return to after the trial starts or "Not now" (static route, Suspense + useSearchParams).
import { useSearchParams } from "next/navigation";
import { ClientOnly } from "@/components/ClientOnly";
import { Plans } from "@/features/parent/Plans";
import { ParentShell } from "@/features/parent/ui";

export function PlansPage() {
  const from = useSearchParams().get("from");
  const back = from && from.startsWith("/") && !from.startsWith("//") ? from : "/parent";
  return (
    <ClientOnly>
      <ParentShell title="Plans" back={back}>
        <Plans from={from} />
      </ParentShell>
    </ClientOnly>
  );
}
