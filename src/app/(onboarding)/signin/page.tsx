"use client";
// N.3.2 Parent sign-in (U02): email magic link · 6-digit sign-in code fallback · Google. No passwords.
// States: enter email → link sent (resend cooldown, change email, use code) → code entry → signed in.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { Sheru } from "@/components/sheru/Sheru";
import { Button, CodeInput, Input } from "@/components/ui/controls";
import { nextRoute, useAuth } from "@/lib/auth";
import { friendlyError, siteOrigin, loadSupabase } from "@/lib/supabase/client";

const RESEND_SECONDS = 60;

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export default function SignIn() {
  const router = useRouter();
  const { ready, configured, session, profile } = useAuth();
  const [step, setStep] = useState<"email" | "sent" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Already signed in → continue.
  useEffect(() => {
    if (ready && session) router.replace(nextRoute(profile));
  }, [ready, session, profile, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!configured) {
    return <p className="rounded-xl bg-reward-bg p-4 text-reward">Sign-in isn&apos;t configured on this build (missing Supabase env).</p>;
  }

  const send = async () => {
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email address.");
    setBusy(true);
    const { error } = await (await loadSupabase()).auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${siteOrigin()}/auth/confirm`, shouldCreateUser: true },
    });
    setBusy(false);
    if (error) return setError(friendlyError(error));
    setStep("sent");
    setCooldown(RESEND_SECONDS);
  };

  const verify = async (token: string) => {
    if (token.length !== 6) return;
    setBusy(true);
    setError(null);
    const { error } = await (await loadSupabase()).auth.verifyOtp({ email: email.trim(), token, type: "email" });
    setBusy(false);
    if (error) {
      setCode("");
      return setError(/expired/i.test(error.message) ? "That code has expired. Send a new one." : "That code isn't right. Check the email and try again.");
    }
    // AuthProvider picks up SIGNED_IN and the effect above redirects.
  };

  const google = async () => {
    setError(null);
    const { error } = await (await loadSupabase()).auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${siteOrigin()}/auth/confirm` } });
    if (error) setError(/not enabled|provider/i.test(error.message) ? "Google sign-in isn't switched on yet. Use email for now." : friendlyError(error));
  };

  if (step === "sent" || step === "code") {
    return (
      <div className="flex flex-col gap-5 pt-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-brand-soft text-brand-text">
            <Icon name="mail" size={36} />
          </span>
          <h1 className="text-h1">Check your email</h1>
          <p className="text-body-l text-ink-2">
            We sent a sign-in link and a 6-digit code to <strong className="text-ink">{email}</strong>. It works once and expires soon.
          </p>
        </div>

        {step === "code" ? (
          <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
            <CodeInput
              label="6-digit sign-in code"
              value={code}
              onChange={(v) => {
                setCode(v);
                if (v.length === 6) void verify(v);
              }}
              error={error ?? undefined}
            />
            <Button loading={busy} disabled={code.length !== 6} onClick={() => verify(code)}>
              Sign in
            </Button>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setStep("code")}>
            Enter the code instead
          </Button>
        )}

        {step === "sent" && error && <p className="text-caption text-error" role="alert">{error}</p>}

        <div className="flex flex-col items-center gap-2 text-[15px]">
          <button type="button" disabled={cooldown > 0 || busy} onClick={send} className="font-bold text-brand-text underline disabled:text-ink-3 disabled:no-underline">
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            className="font-bold text-ink-2 underline"
          >
            Wrong email? Change it
          </button>
          <p className="max-w-sm text-center text-caption text-ink-3">Can&apos;t find it? Check spam or promotions. Opening the link on another device? Use the code instead.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pt-6">
      <div className="flex items-center gap-4">
        <Sheru mood="happy" size={72} decorative />
        <div>
          <h1 className="text-h1">Parent sign-in</h1>
          <p className="text-body text-ink-2">No password needed.</p>
        </div>
      </div>
      <form
        className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
        noValidate
      >
        <Input label="Your email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error ?? undefined} placeholder="parent@example.com" />
        <Button type="submit" loading={busy}>
          Email me a sign-in link
        </Button>
        <div className="flex items-center gap-3 text-caption text-ink-3">
          <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
        </div>
        <Button type="button" variant="secondary" icon={<GoogleIcon />} onClick={google}>
          Continue with Google
        </Button>
      </form>
      <p className="text-center text-caption text-ink-3">
        Only parents sign in. Kids never need an account. <Link href="/privacy" className="underline">How we use your email</Link>
      </p>
    </div>
  );
}
