"use client";
// N.8.1 Paywall (D15, U06): calm, no guilt, small Proud Sheru, parent-only (behind the gate via ParentShell).
// Free vs Family, monthly/yearly, 7-day trial with day-5 reminder. Talks only to lib/billing (mock until N.8.2).
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { Sheru } from "@/components/sheru/Sheru";
import { Button, Segmented } from "@/components/ui/controls";
import { Badge } from "@/components/ui/display";
import { ConfirmDialog, useToast } from "@/components/ui/feedback";
import { plans } from "@/content/marketing";
import { billing, type Cycle } from "@/lib/billing";
import { cn } from "@/lib/cn";
import { TRIAL_DAYS, TRIAL_REMINDER_DAY, mockAllowed, tierLabel, useEntitlement, writeMock } from "@/lib/entitlement";

const trust: { icon: IconName; t: string }[] = [
  { icon: "mail", t: `Email reminder on day ${TRIAL_REMINDER_DAY}` },
  { icon: "close", t: "Cancel any time" },
  { icon: "shield", t: "Kids never see prices" },
  { icon: "heart", t: "No ads, no tracking" },
];

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });

/** Only allow in-app return paths. */
const safeFrom = (from: string | null) => (from && from.startsWith("/") && !from.startsWith("//") ? from : null);

export function Plans({ from }: { from: string | null }) {
  const router = useRouter();
  const toast = useToast();
  const ent = useEntitlement();
  const b = billing();
  const [cycle, setCycle] = useState<Cycle>("yearly");
  const [busy, setBusy] = useState<null | "trial" | "subscribe" | "cancel">(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const back = safeFrom(from);
  const price = b.price(cycle);

  const run = async (kind: "trial" | "subscribe" | "cancel") => {
    setBusy(kind);
    setError(null);
    const fn = kind === "trial" ? b.startTrial : kind === "subscribe" ? b.subscribe : b.cancel;
    const r = await fn(cycle);
    setBusy(null);
    if (!r.ok) return setError(r.message);
    if (kind === "cancel") return toast("Family is off. Paath stays free.", "success");
    toast(kind === "trial" ? `Family trial started — ${TRIAL_DAYS} days free` : "Welcome to Family!", "success");
    if (back) router.replace(back);
  };

  const free = plans[0];
  const family = plans[1];

  return (
    <>
      <header className="flex items-center gap-4">
        <Sheru mood="proud" size={48} decorative />
        <div>
          <h1 className="text-h2 web:text-h1">Learn together with Family</h1>
          <p className="text-[15px] text-ink-2">Paath is free forever. Family opens all of Learn and Culture for up to 5 children.</p>
        </div>
      </header>

      {ent.tier !== "free" && (
        <section aria-label="Your plan" className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 tab:flex-row tab:items-center">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-success-bg text-success">
            <Icon name="check" />
          </span>
          <div className="flex-1">
            <p className="text-h3">{ent.tier === "trial" ? `Family trial · ${ent.trialDaysLeft} day${ent.trialDaysLeft === 1 ? "" : "s"} left` : "You're on Family"}</p>
            <p className="text-[14px] text-ink-2">
              {ent.tier === "trial" && ent.trialEndsAt
                ? `Ends ${fmtDate(ent.trialEndsAt)}. We'll email you before it ends — nothing is charged until you choose a plan.`
                : "All letters, sakhis and parent insights are open for every child."}
            </p>
          </div>
          <div className="flex gap-2">
            {ent.tier === "trial" && (
              <Button size="sm" loading={busy === "subscribe"} onClick={() => run("subscribe")}>Keep Family</Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setConfirmCancel(true)}>{ent.tier === "trial" ? "End trial" : "Cancel plan"}</Button>
          </div>
        </section>
      )}

      <div className="flex flex-col items-center gap-2">
        <Segmented
          label="Billing period"
          value={cycle}
          onChange={setCycle}
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "yearly", label: "Yearly" },
          ]}
        />
      </div>

      <div className="grid gap-4 tab:grid-cols-2">
        <PlanCard name={free.name} price={free.price} note={free.note} features={free.features} current={ent.tier === "free"} />
        <PlanCard
          name={family.name}
          price={price ?? "Price coming soon"}
          note={`${cycle === "yearly" ? "Billed yearly" : "Billed monthly"} · ${family.note}`}
          features={family.features}
          current={ent.tier !== "free"}
          highlight
        />
      </div>

      {ent.tier === "free" && (
        <div className="flex flex-col items-stretch gap-3 tab:mx-auto tab:w-[420px]">
          <Button block loading={busy === "trial"} onClick={() => run("trial")} icon={<Icon name="sparkle" size={18} />}>
            Start {TRIAL_DAYS}-day free trial
          </Button>
          <Button block variant="ghost" onClick={() => router.push(back ?? "/parent")}>Not now</Button>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-md bg-info-bg px-4 py-3 text-[15px] font-bold text-info">{error}</p>
      )}
      {!b.live && !error && (
        <p className="rounded-md bg-info-bg px-4 py-3 text-[14px] font-bold text-info">Payments aren&apos;t live yet — you can start the trial once Family launches.</p>
      )}

      <ul className="grid grid-cols-2 gap-3 web:grid-cols-4">
        {trust.map((x) => (
          <li key={x.t} className="flex items-center gap-2 rounded-xl bg-sunken px-3 py-3 text-[14px] font-bold text-ink-2">
            <Icon name={x.icon} size={18} className="shrink-0 text-navy-700 dark:text-navy-200" />
            {x.t}
          </li>
        ))}
      </ul>

      <p className="text-caption text-ink-3">
        How the trial works: day 1 everything opens · day {TRIAL_REMINDER_DAY} we email a reminder · day {TRIAL_DAYS} it ends unless you choose a plan. Your child&apos;s progress is kept either way.
      </p>

      {mockAllowed() && <MockPanel />}

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={() => {
          setConfirmCancel(false);
          run("cancel");
        }}
        title={ent.tier === "trial" ? "End the trial?" : "Cancel Family?"}
        body="Learn goes back to the first 10 letters and 2 sakhis. Progress is kept, and Paath stays free."
        confirmLabel={ent.tier === "trial" ? "End trial" : "Cancel plan"}
      />
      <span className="sr-only" aria-live="polite">Current plan: {tierLabel(ent)}</span>
    </>
  );
}

function PlanCard({
  name,
  price,
  note,
  features,
  current,
  highlight,
}: {
  name: string;
  price: string;
  note: string;
  features: [string, boolean][];
  current?: boolean;
  highlight?: boolean;
}) {
  return (
    <section
      aria-label={`${name} plan`}
      className={cn("flex flex-col gap-3 rounded-2xl border bg-surface p-5", highlight ? "border-2 border-brand" : "border-line")}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-h3">{name}</h2>
        {current ? <Badge tone="success" icon="check">Current</Badge> : highlight ? <Badge tone="brand">{TRIAL_DAYS} days free</Badge> : null}
      </div>
      <div>
        <p className="text-h2">{price}</p>
        <p className="text-[13px] text-ink-3">{note}</p>
      </div>
      <ul className="flex flex-col gap-2">
        {features.map(([f, on]) => (
          <li key={f} className={cn("flex items-start gap-2 text-[15px]", on ? "text-ink" : "text-ink-3")}>
            <Icon name={on ? "check" : "close"} size={18} className={cn("mt-0.5 shrink-0", on ? "text-success" : "text-ink-3")} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Dev / preview only: flip the mock entitlement to QA locks. */
function MockPanel() {
  const day = 86_400_000;
  return (
    <section aria-label="Test plan" className="flex flex-col gap-2 rounded-2xl border border-dashed border-line p-4">
      <p className="text-label text-ink-2">Test mode (not in production) — mock entitlement</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => writeMock(null)}>Free</Button>
        <Button size="sm" variant="secondary" onClick={() => writeMock({ tier: "trial", trialEndsAt: new Date(Date.now() + 7 * day).toISOString() })}>Trial 7 days</Button>
        <Button size="sm" variant="secondary" onClick={() => writeMock({ tier: "trial", trialEndsAt: new Date(Date.now() + 2 * day - 60_000).toISOString() })}>Trial ending (day 5)</Button>
        <Button size="sm" variant="secondary" onClick={() => writeMock({ tier: "family" })}>Family</Button>
      </div>
    </section>
  );
}
