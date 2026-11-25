"use client";
// N.7.2 Join my family on a 2nd device: 6-digit code → join-family Edge Function → one-time sign-in.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sheru } from "@/components/sheru/Sheru";
import { Button, CodeInput } from "@/components/ui/controls";
import { local } from "@/lib/local";
import { friendlyError, supabase } from "@/lib/supabase/client";

const ERRORS: Record<string, string> = {
  BAD_CODE: "That code didn't work. Codes last 10 minutes and work once — ask for a new one.",
  TOO_MANY: "Too many tries from this device. Please wait an hour or ask for a new code.",
};

export default function Join() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const join = async () => {
    setBusy(true);
    setError(null);
    try {
      const { data, error: e } = await supabase().functions.invoke<{ token_hash?: string; error?: string }>("join-family", { body: { code } });
      const token = data?.token_hash;
      if (e) {
        const body = await (e as { context?: Response }).context?.json?.().catch(() => null);
        throw new Error(body?.error ?? e.message);
      }
      if (!token) throw new Error(data?.error ?? "BAD_CODE");
      const { error: v } = await supabase().auth.verifyOtp({ token_hash: token, type: "magiclink" });
      if (v) throw v;
      local.setMode("family");
      router.replace("/profiles");
    } catch (err) {
      const m = (err as Error).message;
      setError(ERRORS[m] ?? friendlyError(err));
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 pt-6 text-center">
      <Sheru mood="happy" size={96} decorative />
      <h1 className="text-h1">Join my family</h1>
      <p className="text-body text-ink-2">Ask a grown-up for the 6-digit family code. It&apos;s in the Parent area under Devices.</p>
      <form
        className="flex w-full flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (code.length === 6) void join();
        }}
      >
        <CodeInput label="Family code" value={code} onChange={(v) => setCode(v.replace(/\D/g, ""))} error={error ?? undefined} />
        <Button type="submit" loading={busy} disabled={code.length !== 6}>Join</Button>
      </form>
      <Link href="/who" className="text-[15px] font-bold text-brand-text underline">Back</Link>
    </div>
  );
}
