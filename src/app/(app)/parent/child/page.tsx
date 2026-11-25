"use client";
// Child id comes from ?id= (ids are private UUIDs, so no static params; keeps the route static).
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ChildDetail } from "@/features/parent/ChildDetail";
import { ParentShell } from "@/features/parent/ui";

function Content() {
  const id = useSearchParams().get("id") ?? "";
  return (
    <ParentShell title="Child progress" back="/parent">
      <ChildDetail id={id} />
    </ParentShell>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  );
}
