// N.3.1 Welcome (D05 / U01)
import type { Metadata } from "next";
import Link from "next/link";
import { Sheru } from "@/components/sheru/Sheru";
import { ButtonLink } from "@/components/ui/controls";
import { Returning } from "./Returning";

export const metadata: Metadata = { title: "Welcome", robots: { index: false } };

export default function Welcome() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <Returning />
      <Sheru mood="happy" size={160} className="animate-bob" />
      <div className="flex flex-col gap-2">
        <p lang="pa" className="text-gurmukhi-h text-brand-text">ਜੀ ਆਇਆਂ ਨੂੰ!</p>
        <h1 className="text-h1">Welcome to Gurmukhi Virsa</h1>
        <p className="text-body-l text-ink-2">Learn Gurmukhi, read Paath with meaning and discover Sikh heritage.</p>
      </div>
      <div className="flex w-full flex-col gap-3">
        <ButtonLink href="/who" block>Get started</ButtonLink>
        <ButtonLink href="/signin" variant="secondary" block>I already have an account</ButtonLink>
      </div>
      <p className="text-caption text-ink-3">
        By continuing you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy policy</Link>.
      </p>
    </div>
  );
}
