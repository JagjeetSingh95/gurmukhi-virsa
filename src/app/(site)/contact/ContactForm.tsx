"use client";
// No backend yet: builds a mailto: so nothing is stored or sent to third parties.
// TODO(N.9.2): replace with a Convex action + Resend.
import { useState } from "react";
import { Button, Chip, Input } from "@/components/ui/controls";
import { site } from "@/lib/site";

const topics = ["General", "Billing", "Schools", "Bug report", "Content"] as const;

export function ContactForm() {
  const [topic, setTopic] = useState<(typeof topics)[number]>("General");
  const [errors, setErrors] = useState<{ email?: string; message?: string }>({});

  return (
    <form
      noValidate
      className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-6 web:p-8"
      onSubmit={(e) => {
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
      <Input name="email" type="email" label="Email" autoComplete="email" required error={errors.email} />
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
      <Button type="submit">Send message</Button>
    </form>
  );
}
