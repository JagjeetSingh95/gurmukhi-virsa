import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientOnly } from "@/components/ClientOnly";
import { sakhiById, sakhiHeading, sakhis } from "@/features/culture/content";
import { SakhiPlayer } from "@/features/culture/Sakhis";

export function generateStaticParams() {
  return sakhis.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: PageProps<"/culture/sakhis/[id]">): Promise<Metadata> {
  const s = sakhiById((await params).id);
  return s ? { title: sakhiHeading(s), robots: { index: false } } : {};
}

export default function Page(props: PageProps<"/culture/sakhis/[id]">) {
  return (
    <Suspense fallback={null}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ params }: PageProps<"/culture/sakhis/[id]">) {
  const { id } = await params;
  if (!sakhiById(id)) notFound();
  return (
    <ClientOnly>
      <SakhiPlayer id={id} />
    </ClientOnly>
  );
}
