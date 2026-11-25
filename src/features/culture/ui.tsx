"use client";
// Shared Culture pieces (D12/D13): back bar, Guru numeral tile + row, sakhi row, unlock card.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ParentGate } from "@/components/gate/ParentGate";
import { Icon } from "@/components/icons";
import { IkOnkar } from "@/components/IkOnkar";
import { Button } from "@/components/ui/controls";
import { plansHref } from "@/lib/entitlement";
import { Badge, LockTag, TopBar } from "@/components/ui/display";
import { cn } from "@/lib/cn";
import { sakhiHeading, type Guru, type Sakhi } from "./content";

export function BackBar({ title, back = "/culture", trailing }: { title: string; back?: string; trailing?: ReactNode }) {
  return (
    <TopBar
      title={title}
      leading={
        <Link href={back} aria-label="Back" className="-ml-2 grid size-11 place-items-center rounded-full text-ink-2 hover:bg-sunken">
          <Icon name="arrow-left" />
        </Link>
      }
      trailing={trailing}
    />
  );
}

/** Gurus are never drawn — a Gurmukhi numeral stands in. */
export function GuruNumeral({ guru, size = "md" }: { guru: Guru; size?: "md" | "lg" }) {
  return (
    <span
      aria-hidden
      lang="pa"
      className={cn(
        "grid shrink-0 place-items-center rounded-xl bg-brand-soft font-[family-name:var(--font-gurmukhi)] font-bold leading-none text-brand-text",
        size === "lg" ? "size-24 text-[52px] web:size-28 web:text-[60px]" : "size-12 text-[24px]",
        guru.id === "granth" && "bg-navy-50 text-navy-800 dark:bg-navy-900 dark:text-navy-50",
      )}
    >
      {guru.id === "granth" ? <IkOnkar /> : guru.numeral}
    </span>
  );
}

export function GuruRow({ guru }: { guru: Guru }) {
  return (
    <Link href={`/culture/gurus/${guru.id}`} className="flex min-h-[72px] items-center gap-4 rounded-xl px-3 py-2 hover:bg-sunken">
      <GuruNumeral guru={guru} />
      <span className="min-w-0 flex-1">
        <span className="block text-[17px] font-extrabold text-ink">{guru.name}</span>
        <span className="block text-caption text-ink-2">{guru.years}</span>
      </span>
      <Icon name="chevron-right" size={20} className="text-ink-3" />
    </Link>
  );
}

export function SakhiRow({ sakhi, locked }: { sakhi: Sakhi; locked: boolean }) {
  return (
    <Link href={`/culture/sakhis/${sakhi.id}`} className="flex min-h-[72px] items-center gap-4 rounded-xl px-3 py-2 hover:bg-sunken">
      <span aria-hidden className={cn("grid size-12 shrink-0 place-items-center rounded-xl text-[24px]", locked ? "bg-reward-bg" : "bg-info-bg")}>
        {sakhi.pages[0]?.scene ?? "📖"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[17px] font-extrabold text-ink">{sakhiHeading(sakhi)}</span>
        <span className="block text-caption text-ink-2">
          {sakhi.minutes} min · <span lang="pa">{sakhi.gurmukhi}</span>
        </span>
      </span>
      {locked ? <LockTag /> : sakhi.free ? <Badge tone="success">Free</Badge> : <Icon name="chevron-right" size={20} className="text-ink-3" />}
    </Link>
  );
}

/** Kids never see prices: "Ask a grown-up" → parent gate → plans. */
export function CultureUnlock({ text = "2 sakhis are free. Explore the rest with a family plan." }: { text?: string }) {
  const router = useRouter();
  const [gate, setGate] = useState(false);
  return (
    <div className="flex flex-col gap-3 rounded-2xl border-2 border-[var(--gold-500)] bg-reward-bg p-4 tab:flex-row tab:items-center">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--gold-500)] text-white">
        <Icon name="lock" size={18} />
      </span>
      <p className="flex-1 text-[15px] font-bold text-ink">{text}</p>
      <Button variant="secondary" size="sm" onClick={() => setGate(true)}>
        Ask a grown-up
      </Button>
      <ParentGate open={gate} reason="Plans are for grown-ups." onClose={() => setGate(false)} onPass={() => { setGate(false); router.push(plansHref(location.pathname + location.search)); }} />
    </div>
  );
}

export function LockedPanel({ title, back }: { title: string; back: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-5 px-5 py-12 text-center">
      <span className="grid size-20 place-items-center rounded-full bg-reward-bg text-reward">
        <Icon name="lock" size={36} />
      </span>
      <h1 className="text-h1">{title}</h1>
      <p className="text-body-l text-ink-2">This is part of the Family plan.</p>
      <div className="w-full text-left">
        <CultureUnlock text="Ask a grown-up to see plans." />
      </div>
      <Link href={back} className="text-[15px] font-bold text-brand-text underline">Go back</Link>
    </div>
  );
}
