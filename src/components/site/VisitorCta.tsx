"use client";
// Feedback F1.2 / F1.3: marketing CTAs change once we know who is visiting.
// Server render = signed-out version; swaps after hydration (cookie + local mode, no Supabase download).
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Icon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/controls";
import { hasAuthCookie } from "@/lib/supabase/client";
import { local } from "@/lib/local";
import { site } from "@/lib/site";
import { resolveEntitlement } from "@/lib/plan";

export type Visitor = "out" | "parent" | "guest";

const subscribe = (cb: () => void) => {
  window.addEventListener("gv-local", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("gv-local", cb);
    window.removeEventListener("storage", cb);
  };
};

function readVisitor(): Visitor {
  if (hasAuthCookie()) return "parent";
  if (local.mode() === "adult") return "guest";
  return "out";
}

export function useVisitor(): Visitor {
  return useSyncExternalStore(subscribe, readVisitor, () => "out");
}

const leadIcon = { parent: "users", guest: "book" } as const;
const dest: Record<Visitor, string> = { out: site.appEntry, parent: "/profiles", guest: "/paath" };

/** Navbar actions. `mobile` = full-width stack inside the menu. */
export function HeaderCta({ mobile = false }: { mobile?: boolean }) {
  const v = useVisitor();
  const label = v === "out" ? "Join now — free" : v === "parent" ? "Let's learn" : "Let's read Paath";
  return (
    <span className={mobile ? "mt-2 flex flex-col gap-2" : "flex items-center gap-2"}>
      {v !== "parent" && (
        <Link
          href="/signin"
          className={
            mobile
              ? "block rounded-md px-4 py-3 text-[16px] font-bold hover:bg-sunken"
              : "rounded-md px-3 py-2 text-[15px] font-bold text-ink-2 hover:bg-sunken hover:text-ink"
          }
        >
          Log in
        </Link>
      )}
      <ButtonLink href={dest[v]} size={mobile ? undefined : "sm"} block={mobile}>
        {v !== "out" && <Icon name={leadIcon[v]} size={16} />}
        {label}
      </ButtonLink>
    </span>
  );
}

/** Small chip above the hero headline. */
export function HeroEyebrow() {
  const v = useVisitor();
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-label text-brand-text shadow-[0_2px_0_var(--border-default)]">
      <Icon name="sparkle" size={16} />
      {v === "out" ? "Gurmukhi learning app · Kids 4–12" : "Welcome back 👋"}
    </span>
  );
}

/** Primary hero button. */
export function HeroCta() {
  const v = useVisitor();
  const label = v === "parent" ? "Let's learn" : v === "guest" ? "Let's read Paath" : "Join now — free";
  return (
    <ButtonLink href={dest[v]}>
      {v !== "out" && <Icon name={leadIcon[v]} size={18} />}
      {label}
      {v === "out" && <Icon name="arrow-right" size={18} />}
    </ButtonLink>
  );
}

// Plan snapshot as a string ("" unknown · "free" · "trial:N" · "family") so useSyncExternalStore stays stable.
function readPlan(): string {
  if (!hasAuthCookie()) return "";
  const cached = local.plan();
  if (!cached) return ""; // unknown → show nothing (never nudge a paying parent by mistake)
  const e = resolveEntitlement(cached, null);
  return e.tier === "trial" ? `trial:${e.trialDaysLeft}` : e.tier;
}

/** Line under the hero buttons: trust line (signed out), calm plan note (parents on Free / trial). */
export function HeroNote() {
  const v = useVisitor();
  const plan = useSyncExternalStore(subscribe, readPlan, () => "");
  const link = "font-bold text-brand-text underline underline-offset-2 hover:no-underline";
  if (v === "out") return <p className="text-caption text-ink-3">Works in your browser — no download · No card · No ads</p>;
  if (v !== "parent" || !plan || plan === "family") return null;
  if (plan === "free")
    return (
      <p className="text-caption text-ink-3">
        You&apos;re on Free ·{" "}
        <Link href="/pricing" className={link}>
          Try Family free for 7 days →
        </Link>
      </p>
    );
  const days = Number(plan.split(":")[1] ?? 0);
  return (
    <p className="text-caption text-ink-3">
      Family trial · {days} day{days === 1 ? "" : "s"} left ·{" "}
      <Link href="/pricing" className={link}>
        Keep Family →
      </Link>
    </p>
  );
}
