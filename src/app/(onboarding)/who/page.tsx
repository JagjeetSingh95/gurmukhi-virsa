"use client";
// N.3.1 Who's using (D05 / U01): Adult = guest (no account) · Family = parent sign-in.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { Sheru } from "@/components/sheru/Sheru";
import { nextRoute, useAuth } from "@/lib/auth";
import { local } from "@/lib/local";

export default function Who() {
  const router = useRouter();
  const { session, profile } = useAuth();
  const choose = (mode: "adult" | "family") => {
    local.setMode(mode);
    if (mode === "adult") router.push("/paath");
    else router.push(session ? nextRoute(profile) : "/signin");
  };
  const card = "flex w-full items-center gap-4 rounded-2xl border-2 border-line bg-surface p-5 text-left shadow-[0_4px_0_var(--border-default)] transition-transform hover:-translate-y-0.5 active:translate-y-[3px] active:shadow-none";
  return (
    <div className="flex flex-col gap-6 pt-6">
      <h1 className="text-h1">Who&apos;s using Gurmukhi Virsa?</h1>
      <button type="button" className={card} onClick={() => choose("family")}>
        <Sheru mood="cheer" size={72} decorative />
        <span className="flex-1">
          <span className="block text-h3">My family</span>
          <span className="block text-[15px] text-ink-2">Kids learn letters, Paath and stories. A parent signs in once.</span>
        </span>
        <Icon name="arrow-right" className="text-ink-3" />
      </button>
      <button type="button" className={card} onClick={() => choose("adult")}>
        <span className="grid size-[72px] shrink-0 place-items-center rounded-full bg-navy-50 text-navy-800 dark:bg-navy-900 dark:text-navy-50">
          <Icon name="book" size={32} />
        </span>
        <span className="flex-1">
          <span className="block text-h3">Just me</span>
          <span className="block text-[15px] text-ink-2">Read Paath and explore culture. No account needed.</span>
        </span>
        <Icon name="arrow-right" className="text-ink-3" />
      </button>
      <p className="text-center text-[15px] text-ink-2">
        Already set up on another device? <Link href="/join" className="font-bold text-brand-text underline">Join my family</Link>
      </p>
    </div>
  );
}
