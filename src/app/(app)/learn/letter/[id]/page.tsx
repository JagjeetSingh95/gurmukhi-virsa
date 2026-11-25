import { Suspense } from "react";
import { ClientOnly } from "@/components/ClientOnly";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { letterById, letters } from "@/features/learn/content";
import { LetterLesson } from "@/features/learn/LetterLesson";

export function generateStaticParams() {
  return letters.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: PageProps<"/learn/letter/[id]">): Promise<Metadata> {
  const l = letterById((await params).id);
  return l ? { title: `${l.name} (${l.letter})`, robots: { index: false } } : {};
}

// Params are read inside <Suspense> so client navigations stay instant (cacheComponents).
export default function Page(props: PageProps<"/learn/letter/[id]">) {
  return (
    <Suspense fallback={null}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ params }: PageProps<"/learn/letter/[id]">) {
  const l = letterById((await params).id);
  if (!l) notFound();
  return (
    <ClientOnly>
      <LetterLesson id={l.id} />
    </ClientOnly>
  );
}
