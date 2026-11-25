"use client";
// Locked (Family) content: kids never see prices — "Ask a grown-up" opens the parent gate, then plans.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ParentGate } from "@/components/gate/ParentGate";
import { Icon } from "@/components/icons";
import { Sheru } from "@/components/sheru/Sheru";
import { Button, ButtonLink } from "@/components/ui/controls";
import { plansHref } from "@/lib/entitlement";

export function UnlockCard({ compact }: { compact?: boolean }) {
  const router = useRouter();
  const [gate, setGate] = useState(false);
  return (
    <div className="flex flex-col gap-3 rounded-2xl border-2 border-[var(--gold-500)] bg-reward-bg p-5">
      <div className="flex items-center gap-3">
        {!compact && <Sheru mood="proud" size={48} decorative />}
        <div>
          <p className="text-h3 text-reward">Unlock all 35 letters</p>
          <p className="text-[14px] text-ink-2">First 10 letters are free. Ask a grown-up to see plans.</p>
        </div>
      </div>
      <Button variant="secondary" size="sm" icon={<Icon name="lock" size={16} />} onClick={() => setGate(true)}>
        Ask a grown-up
      </Button>
      <ParentGate open={gate} reason="Plans are for grown-ups." onClose={() => setGate(false)} onPass={() => { setGate(false); router.push(plansHref(location.pathname + location.search)); }} />
    </div>
  );
}

export function LockedScreen({ title }: { title: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-5 px-5 py-12 text-center">
      <span className="grid size-20 place-items-center rounded-full bg-reward-bg text-reward">
        <Icon name="lock" size={36} />
      </span>
      <h1 className="text-h1">{title}</h1>
      <p className="text-body-l text-ink-2">This is part of the Family plan.</p>
      <div className="w-full text-left">
        <UnlockCard compact />
      </div>
      <ButtonLink href="/learn" variant="ghost">Back to the path</ButtonLink>
    </div>
  );
}
