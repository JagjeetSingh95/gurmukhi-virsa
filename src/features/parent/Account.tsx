"use client";
// N.9.2 Help & account (U12), all behind the parent gate (ParentShell):
// contact form, data export (JSON download), delete account (email code re-auth → delete-account Edge Function), parent PIN.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ContactForm } from "@/app/(site)/contact/ContactForm";
import { Icon } from "@/components/icons";
import { Button, ButtonLink, CodeInput, Input } from "@/components/ui/controls";
import { ConfirmDialog, useToast } from "@/components/ui/feedback";
import { useAuth } from "@/lib/auth";
import { local } from "@/lib/local";
import { friendlyError, siteOrigin, supabase } from "@/lib/supabase/client";

export function ParentContact() {
  const { profile } = useAuth();
  return (
    <>
      <p className="text-body-l text-ink-2">Questions, ideas or corrections — we read every message and reply within 2 working days.</p>
      <ContactForm defaultEmail={profile?.email ?? ""} />
    </>
  );
}

const PROFILE_EXPORT = "id,email,consent_at,has_pin,plan,trial_ends_at,weekly_email,weekly_day,reminder_on,reminder_hour,timezone,gurpurab_reminders,created_at";

export function AccountData() {
  const router = useRouter();
  const toast = useToast();
  const { profile, session, signOut } = useAuth();
  const [busy, setBusy] = useState<null | "export" | "send" | "verify" | "delete">(null);
  const [step, setStep] = useState<"idle" | "code" | "confirm">("idle");
  const [code, setCode] = useState("");
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ask, setAsk] = useState(false);
  const email = profile?.email ?? session?.user.email ?? "";

  const exportData = async () => {
    setBusy("export");
    const sb = supabase();
    const [p, c, pr, b, s, a] = await Promise.all([
      sb.from("profiles").select(PROFILE_EXPORT).maybeSingle(),
      sb.from("children").select("*"),
      sb.from("progress").select("*"),
      sb.from("bookmarks").select("*"),
      sb.from("settings").select("*"),
      sb.from("activity").select("*"),
    ]);
    setBusy(null);
    const err = [p, c, pr, b, s, a].find((r) => r.error)?.error;
    if (err) return toast(friendlyError(err), "error");
    const data = { exported_at: new Date().toISOString(), app: "Gurmukhi Virsa", profile: p.data, children: c.data, progress: pr.data, bookmarks: b.data, settings: s.data, activity: a.data };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const el = document.createElement("a");
    el.href = url;
    el.download = `gurmukhi-virsa-data-${new Date().toISOString().slice(0, 10)}.json`;
    el.click();
    URL.revokeObjectURL(url);
    toast("Your data is downloading", "success");
  };

  const sendCode = async () => {
    setBusy("send");
    setError(null);
    const { error: e } = await supabase().auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: `${siteOrigin()}/auth/confirm` } });
    setBusy(null);
    if (e) return setError(friendlyError(e));
    setStep("code");
  };

  const verify = async () => {
    setBusy("verify");
    setError(null);
    const { error: e } = await supabase().auth.verifyOtp({ email, token: code, type: "email" });
    setBusy(null);
    if (e) {
      setCode("");
      return setError("That code didn't work. Check the latest email or send a new code.");
    }
    setStep("confirm");
  };

  const del = async () => {
    setBusy("delete");
    setError(null);
    const { error: e } = await supabase().functions.invoke("delete-account", { body: { confirm: "DELETE" } });
    if (e) {
      setBusy(null);
      const status = (e as { context?: Response }).context?.status;
      if (status === 401) {
        setStep("idle");
        return setError("For safety, please confirm with a new email code.");
      }
      return setError("Couldn't delete right now. Check your connection and try again.");
    }
    await signOut().catch(() => {});
    try {
      Object.keys(localStorage).filter((k) => k.startsWith("gv.")).forEach((k) => localStorage.removeItem(k));
    } catch {}
    local.setMode(null);
    router.replace("/welcome?deleted=1");
  };

  return (
    <>
      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-h3">What we keep</h2>
        <ul className="flex flex-col gap-2 text-[15px] text-ink-2">
          {["Your email (to sign in and send emails you chose)", "Each child's first name, age band, picture and level", "Learning progress, bookmarks, settings and minutes"].map((t) => (
            <li key={t} className="flex gap-2"><Icon name="check" size={18} className="mt-0.5 shrink-0 text-success" />{t}</li>
          ))}
        </ul>
        <p className="text-caption text-ink-3">No ads, no tracking, no photos. Read the full <a href="/privacy" className="underline">privacy notice</a>.</p>
      </section>

      <section className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-h3">Download your data</h2>
        <p className="text-[15px] text-ink-2">A copy of everything above as a JSON file.</p>
        <Button variant="secondary" size="sm" loading={busy === "export"} onClick={exportData} className="gap-2">
          <Icon name="arrow-right" size={16} className="rotate-90" /> Download my data
        </Button>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border-2 border-[var(--red-600)]/40 bg-surface p-5">
        <h2 className="text-h3">Delete account</h2>
        <p className="text-[15px] text-ink-2">
          Deletes your family account, every child profile and all progress. This can&apos;t be undone. Data is removed straight away and gone from backups within 30 days.
        </p>
        {step === "idle" && (
          <Button variant="secondary" className="self-start" onClick={() => setAsk(true)}>Delete my account…</Button>
        )}
        {step === "code" && (
          <div className="flex flex-col gap-3">
            <p className="text-[15px]">We sent a 6-digit code to <strong>{email}</strong>.</p>
            <CodeInput label="Code from the email" value={code} onChange={setCode} />
            <div className="flex flex-wrap gap-2">
              <Button disabled={code.length !== 6} loading={busy === "verify"} onClick={verify}>Confirm code</Button>
              <Button variant="ghost" loading={busy === "send"} onClick={sendCode}>Send a new code</Button>
            </div>
          </div>
        )}
        {step === "confirm" && (
          <div className="flex flex-col gap-3">
            <Input label='Type DELETE to confirm' value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
            <div className="flex flex-wrap gap-2">
              <Button variant="danger" disabled={typed.trim() !== "DELETE"} loading={busy === "delete"} onClick={del}>Delete everything</Button>
              <Button variant="ghost" onClick={() => { setStep("idle"); setTyped(""); }}>Keep my account</Button>
            </div>
          </div>
        )}
        {error && <p role="alert" className="text-caption text-error">{error}</p>}
      </section>

      <ButtonLink href="/parent/contact" variant="ghost">Questions? Contact us</ButtonLink>

      <ConfirmDialog
        open={ask}
        onClose={() => setAsk(false)}
        onConfirm={() => {
          setAsk(false);
          void sendCode();
        }}
        title="Delete your account?"
        body={`To keep your family safe we'll email a 6-digit code to ${email} first.`}
        confirmLabel="Email me a code"
        destructive
      />
    </>
  );
}

export function ParentPin() {
  const toast = useToast();
  const router = useRouter();
  const { profile, refresh } = useAuth();
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ask, setAsk] = useState(false);

  const save = async () => {
    setBusy(true);
    setError(null);
    const { error: e } = await supabase().rpc("set_parent_pin", { p_pin: pin });
    setBusy(false);
    if (e) return setError(friendlyError(e));
    await refresh();
    toast(profile?.has_pin ? "PIN changed" : "PIN is on", "success");
    router.push("/parent");
  };
  const clear = async () => {
    const { error: e } = await supabase().rpc("clear_parent_pin");
    if (e) return toast(friendlyError(e), "error");
    await refresh();
    toast("PIN is off — the gate uses a maths question", "success");
  };

  return (
    <>
      <p className="text-body-l text-ink-2">
        {profile?.has_pin ? "Your parent gate asks for this PIN. Change it here, or turn it off to use a maths question instead." : "Set a 4-digit PIN for the parent gate. Without one, the gate uses a maths question or a 3-second hold."}
      </p>
      <section className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
        <CodeInput label={profile?.has_pin ? "New 4-digit PIN" : "Choose a 4-digit PIN"} length={4} secret value={pin} onChange={setPin} />
        <CodeInput label="Type it again" length={4} secret value={pin2} onChange={setPin2} error={pin2.length === 4 && pin !== pin2 ? "PINs don't match." : (error ?? undefined)} />
        <Button disabled={pin.length !== 4 || pin !== pin2} loading={busy} onClick={save} className="self-start">Save PIN</Button>
      </section>
      {profile?.has_pin && (
        <Button variant="ghost" className="self-start" onClick={() => setAsk(true)}>Turn PIN off</Button>
      )}
      <ConfirmDialog open={ask} onClose={() => setAsk(false)} onConfirm={() => { setAsk(false); void clear(); }} title="Turn the PIN off?" body="The parent gate will use a maths question or a 3-second hold instead." confirmLabel="Turn off" />
    </>
  );
}
