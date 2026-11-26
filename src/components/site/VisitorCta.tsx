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

const dest: Record<Visitor, string> = { out: site.appEntry, parent: "/profiles", guest: "/paath" };

/** Navbar actions. `mobile` = full-width stack inside the menu. */
export function HeaderCta({ mobile = false }: { mobile?: boolean }) {
  const v = useVisitor();
  const label = v === "out" ? "Start free" : v === "parent" ? "My family" : "Go to Paath";
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
        {label}
        {v !== "out" && <Icon name="arrow-right" size={16} />}
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
  const label = v === "parent" ? "Let's start learning" : v === "guest" ? "Let's read Paath" : "Start learning — free";
  return (
    <ButtonLink href={dest[v]}>
      {label} <Icon name="arrow-right" size={18} />
    </ButtonLink>
  );
}
