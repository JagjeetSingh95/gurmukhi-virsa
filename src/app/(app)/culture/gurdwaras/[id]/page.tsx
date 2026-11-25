import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { gurdwaraById, gurdwaras } from "@/features/culture/content";
import { GurdwaraDetail } from "@/features/culture/CultureMore";

export function generateStaticParams() {
  return gurdwaras.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: PageProps<"/culture/gurdwaras/[id]">): Promise<Metadata> {
  const g = gurdwaraById((await params).id);
  return g ? { title: g.name, robots: { index: false } } : {};
}

export default function Page(props: PageProps<"/culture/gurdwaras/[id]">) {
  return (
    <Suspense fallback={null}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ params }: PageProps<"/culture/gurdwaras/[id]">) {
  const { id } = await params;
  if (!gurdwaraById(id)) notFound();
  return <GurdwaraDetail id={id} />;
}
