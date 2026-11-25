"use client";
// N.3.2 Magic-link / OAuth landing: ?token_hash=…&type=email (email link) or ?code=… (Google, PKCE).
// States: verifying → signed in (redirect) · expired / already used · error.
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Sheru } from "@/components/sheru/Sheru";
import { ButtonLink } from "@/components/ui/controls";
import { nextRoute, useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase/client";

function Confirm() {
  const params = useSearchParams();
  const router = useRouter();
  const { ready, session, profile } = useAuth();
  const [state, setState] = useState<"verifying" | "expired" | "error">("verifying");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const tokenHash = params.get("token_hash");
    const type = params.get("type");
    const code = params.get("code");
    const errDesc = params.get("error_description") ?? params.get("error");
    (async () => {
      if (errDesc) return setState(/expired|invalid/i.test(errDesc) ? "expired" : "error");
      const sb = supabase();
      const { error } = tokenHash
        ? await sb.auth.verifyOtp({ token_hash: tokenHash, type: (type as "email" | "magiclink" | "signup") ?? "email" })
        : code
          ? await sb.auth.exchangeCodeForSession(code)
          : { error: new Error("missing") };
      if (error) setState(/expired|invalid|already/i.test(error.message) ? "expired" : "error");
    })();
  }, [params]);

  useEffect(() => {
    if (ready && session && profile) router.replace(nextRoute(profile));
  }, [ready, session, profile, router]);

  if (state === "verifying")
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center" role="status">
        <span className="size-10 animate-spin rounded-full border-4 border-brand border-r-transparent" aria-hidden />
        <p className="text-body-l text-ink-2">Signing you in…</p>
      </div>
    );

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <Sheru mood="oops" size={120} decorative />
      <h1 className="text-h1">{state === "expired" ? "This link has expired" : "We couldn't sign you in"}</h1>
      <p className="max-w-sm text-body-l text-ink-2">
        {state === "expired"
          ? "Sign-in links work once and only for a short time. Send yourself a new one."
          : "Something went wrong with the sign-in. Please try again."}
      </p>
      <ButtonLink href="/signin">Send a new link</ButtonLink>
      <Link href="/support" className="text-[15px] font-bold text-ink-2 underline">Get help</Link>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={null}>
      <Confirm />
    </Suspense>
  );
}
