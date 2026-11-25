"use client";
// N.9.2 Contact form → `contact` Edge Function (Resend). Message is emailed, never stored.
// If email isn't configured yet (or fails), falls back to opening the parent's mail app.
import { useState } from "react";
import { Icon } from "@/components/icons";
import { Button, Chip, Input } from "@/components/ui/controls";
import { site } from "@/lib/site";
import { loadSupabase } from "@/lib/supabase/client";

const topics = ["General", "Billing", "Schools", "Bug report", "Content", "Account"] as const;

export function ContactForm({ defaultEmail = "", compact }: { defaultEmail?: string; compact?: boolean }) {
  const [topic, setTopic] = useState<(typeof topics)[number]>("General");
  const [errors, setErrors] = useState<{ email?: string; message?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  if (sent)
    return (
      <div role="status" className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-8 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-success-bg text-success"><Icon name="check" size={28} /></span>
        <p className="text-h3">Thanks — message sent</p>
        <p className="text-[15px] text-ink-2">We reply within 2 working days.</p>
        <Button variant="ghost" onClick={() => setSent(false)}>Send another</Button>
      </div>
    );

  return (
    <form
      noValidate
      className={compact ? "flex flex-col gap-5" : "flex flex-col gap-5 rounded-2xl border border-line bg-surface p-6 web:p-8"}
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const name = String(f.get("name") ?? "").trim();
        const email = String(f.get("email") ?? "").trim();
        const message = String(f.get("message") ?? "").trim();
        const next: typeof errors = {};
        if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email so we can reply.";
        if (message.length < 10) next.message = "Tell us a little more (at least 10 characters).";
        setErrors(next);
        if (Object.keys(next).length) return;
        setBusy(true);
        const { error } = await (await loadSupabase()).functions.invoke("contact", { body: { topic, name, email, message, website: f.get("website") } });
        setBusy(false);
        if (!error) return setSent(true);
        const status = (error as { context?: Response }).context?.status;
        if (status === 429) return setErrors({ form: "You've sent a few messages already — please try again in an hour." });
        // Not configured / failed → open the mail app instead.
        const body = `${message}\n\n— ${name || "Parent"} (${email})`;
        window.location.href = `mailto:${site.supportEmail}?subject=${encodeURIComponent(`[${topic}] Gurmukhi Virsa`)}&body=${encodeURIComponent(body)}`;
      }}
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-label">Topic</legend>
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <Chip key={t} selected={t === topic} onClick={() => setTopic(t)}>
              {t}
            </Chip>
          ))}
        </div>
      </fieldset>
      <Input name="name" label="Your name (optional)" autoComplete="name" />
      <Input name="email" type="email" label="Email" autoComplete="email" required error={errors.email} defaultValue={defaultEmail} />
      {/* Honeypot for bots — hidden from people and screen readers. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-label">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          aria-invalid={!!errors.message || undefined}
          aria-describedby={errors.message ? "message-err" : undefined}
          className={`rounded-lg border-2 bg-surface p-4 text-[16px] font-semibold outline-none focus-visible:border-navy-600 web:rounded-md ${errors.message ? "border-[var(--red-600)]" : "border-line-strong"}`}
        />
        {errors.message && (
          <p id="message-err" className="text-caption text-error">
            {errors.message}
          </p>
        )}
      </div>
      <p className="text-caption text-ink-2">Please don&apos;t include your child&apos;s full name or any personal details.</p>
      {errors.form && <p role="alert" className="text-caption text-error">{errors.form}</p>}
      <Button type="submit" loading={busy}>Send message</Button>
    </form>
  );
}
