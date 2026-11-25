import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { guruById, gurus } from "@/features/culture/content";
import { GuruDetail } from "@/features/culture/Gurus";

export function generateStaticParams() {
  return gurus.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: PageProps<"/culture/gurus/[id]">): Promise<Metadata> {
  const g = guruById((await params).id);
  return g ? { title: g.name, robots: { index: false } } : {};
}

export default function Page(props: PageProps<"/culture/gurus/[id]">) {
  return (
    <Suspense fallback={null}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ params }: PageProps<"/culture/gurus/[id]">) {
  const { id } = await params;
  if (!guruById(id)) notFound();
  return <GuruDetail id={id} />;
}
