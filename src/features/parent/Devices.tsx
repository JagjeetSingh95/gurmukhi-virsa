"use client";
// N.7.2 Family code for a 2nd device (U04/U05): 6 digits, 10 minutes, single use. Family plan.
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/controls";
import { Badge } from "@/components/ui/display";
import { useIsFamily } from "@/lib/entitlement";
import { friendlyError, supabase } from "@/lib/supabase/client";

export function Devices() {
  const isFamily = useIsFamily();
  const [code, setCode] = useState<{ code: string; expires: number } | null>(null);
  const [left, setLeft] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    const tick = () => setLeft(Math.max(0, Math.round((code.expires - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [code]);

  const create = async () => {
    setBusy(true);
    setError(null);
    const { data, error: e } = await supabase().rpc("create_family_code");
    setBusy(false);
    if (e) return setError(/FAMILY_ONLY/.test(e.message) ? "Using more devices is part of the Family plan." : friendlyError(e));
    const d = data as { code: string; expires_at: string };
    setCode({ code: d.code, expires: new Date(d.expires_at).getTime() });
  };

  if (!isFamily)
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl border-2 border-[var(--gold-500)] bg-reward-bg p-5">
        <Badge tone="reward" icon="lock">Family plan</Badge>
        <p className="text-h3">Use Gurmukhi Virsa on more devices</p>
        <p className="text-[15px] text-ink-2">With the Family plan, your child&apos;s tablet can join with a 6-digit code — no second sign-in.</p>
        <ButtonLink href="/pricing" size="sm" variant="secondary">See plans</ButtonLink>
      </div>
    );

  const valid = code && left > 0;
  return (
    <>
      <p className="text-body-l text-ink-2">Add your child&apos;s tablet or another computer to your family. Progress stays in sync.</p>
      <section className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-surface p-6 text-center">
        {valid ? (
          <>
            <p className="text-label text-ink-2">Family code</p>
            <p className="font-mono text-[44px] font-extrabold tracking-[0.3em] text-ink" aria-live="polite">
              {code.code.slice(0, 3)} {code.code.slice(3)}
            </p>
            <p className="text-[14px] text-ink-2">
              Works once · expires in {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
            </p>
            <Button variant="secondary" size="sm" loading={busy} onClick={create}>New code</Button>
          </>
        ) : (
          <>
            <Icon name="devices" size={40} className="text-brand-text" />
            {code && <p className="text-[15px] font-bold text-ink-2">That code has expired.</p>}
            <Button loading={busy} onClick={create}>Show family code</Button>
          </>
        )}
        {error && <p className="text-[14px] font-bold text-error">{error}</p>}
      </section>
      <ol className="flex flex-col gap-2 text-[15px]">
        {["On the other device, open Gurmukhi Virsa.", "Tap “Join my family” on the Who’s using screen.", "Type the 6-digit code. Your kids’ profiles appear."].map((s, i) => (
          <li key={s} className="flex gap-3 rounded-xl bg-sunken p-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-[14px] font-extrabold text-white">{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      <p className="text-caption text-ink-3">The other device is signed in to your parent account. The Parent area stays behind the parent gate there too — set a PIN for extra safety.</p>
    </>
  );
}
