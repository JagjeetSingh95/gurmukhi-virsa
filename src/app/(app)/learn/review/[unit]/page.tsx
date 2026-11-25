import { Suspense } from "react";
import { ClientOnly } from "@/components/ClientOnly";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReviewLesson } from "@/features/learn/ReviewLesson";

export function generateStaticParams() {
  return [1, 2, 3, 4, 5, 6, 7].map((u) => ({ unit: String(u) }));
}

export const metadata: Metadata = { title: "Unit review", robots: { index: false } };

// Params are read inside <Suspense> so client navigations stay instant (cacheComponents).
export default function Page(props: PageProps<"/learn/review/[unit]">) {
  return (
    <Suspense fallback={null}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ params }: PageProps<"/learn/review/[unit]">) {
  const u = Number((await params).unit);
  if (!Number.isInteger(u) || u < 1 || u > 7) notFound();
  return (
    <ClientOnly>
      <ReviewLesson unit={u} />
    </ClientOnly>
  );
}
