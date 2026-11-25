"use client";
// N.7.3 Weekly email + reminders settings (U05 §5–6, U13). Web = email first: max 1 reminder a day,
// only when a child hasn't learned yet that day; calm copy, no guilt. Times use the parent's own timezone.
import { useState } from "react";
import { Segmented, Toggle } from "@/components/ui/controls";
import { useToast } from "@/components/ui/feedback";
import { useAuth } from "@/lib/auth";
import { friendlyError, supabase } from "@/lib/supabase/client";
import type { Child, Profile } from "@/lib/supabase/types";

const DAY_OPTS = [
  { value: "6", label: "Sat" },
  { value: "0", label: "Sun" },
  { value: "1", label: "Mon" },
];
const tz = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};
const hourLabel = (h: number) => new Date(2000, 0, 1, h).toLocaleTimeString("en-GB", { hour: "numeric", hour12: true });

type ProfilePatch = Partial<Pick<Profile, "weekly_email" | "weekly_day" | "reminder_on" | "reminder_hour" | "timezone" | "gurpurab_reminders">>;

function useSaveProfile() {
  const { profile, refresh } = useAuth();
  const toast = useToast();
  return async (patch: ProfilePatch) => {
    if (!profile) return;
    // Keep the timezone current so emails arrive at the right local time.
    const { error } = await supabase().from("profiles").update({ ...patch, timezone: tz() }).eq("id", profile.id);
    if (error) toast(friendlyError(error), "error");
    await refresh();
  };
}

function Row({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 px-4 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-[16px] font-extrabold">{title}</p>
        {sub && <p className="text-caption text-ink-2">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export function WeeklyEmail() {
  const { profile, kids } = useAuth();
  const save = useSaveProfile();
  const [on, setOn] = useState(!!profile?.weekly_email);
  const [day, setDay] = useState(String(profile?.weekly_day ?? 0));
  const first = kids[0]?.name ?? "Your child";

  return (
    <>
      <section className="divide-y divide-line rounded-2xl border border-line bg-surface">
        <Row title="Send weekly summary" sub={`To ${profile?.email ?? "your email"} at 9 am`}>
          <Toggle label="Send weekly summary" checked={on} onChange={(v) => { setOn(v); void save({ weekly_email: v }); }} />
        </Row>
        {on && (
          <Row title="Day">
            <Segmented label="Day" value={day} onChange={(v) => { setDay(v); void save({ weekly_day: Number(v) }); }} options={DAY_OPTS} />
          </Row>
        )}
      </section>

      <section aria-labelledby="preview-h" className="flex flex-col gap-2">
        <h2 id="preview-h" className="text-h3">Preview</h2>
        <div className="rounded-2xl border border-line bg-white p-5 text-[#2A1F14] shadow-[0_2px_0_var(--border-default)]">
          <p className="text-[13px] text-[#6E6155]">From Gurmukhi Virsa · {DAY_OPTS.find((d) => d.value === day)?.label ?? "Sun"}</p>
          <p className="mt-2 text-[20px] font-extrabold">Sat Sri Akal!</p>
          <p className="mt-1 text-[15px]">Here&apos;s your family&apos;s week: <b>38 minutes</b> of learning together.</p>
          <p className="mt-3 text-[15px]">
            <b>{first}&apos;s week</b>
            <br />3 letters: <span lang="pa" className="font-[family-name:var(--font-gurmukhi)] text-[18px]">ਕ ਖ ਗ</span> · 38 minutes · 6-day streak
          </p>
          <span className="mt-4 inline-block rounded-full bg-[#BD550E] px-4 py-2 text-[14px] font-bold text-white">Open dashboard</span>
          <p className="mt-4 text-[12px] text-[#6E6155]">Unsubscribe · Manage emails</p>
        </div>
        <p className="text-caption text-ink-3">Plain email, one-tap unsubscribe, no tracking pixels. Letter details come with the Family plan.</p>
      </section>
    </>
  );
}

export function Reminders() {
  const { profile, kids, refresh } = useAuth();
  const toast = useToast();
  const save = useSaveProfile();
  const [on, setOn] = useState(!!profile?.reminder_on);
  const [hour, setHour] = useState(profile?.reminder_hour ?? 18);
  const [gurpurab, setGurpurab] = useState(profile?.gurpurab_reminders ?? true);
  const [kidOn, setKidOn] = useState<Record<string, boolean>>(() => Object.fromEntries(kids.map((k) => [k.id, k.reminder ?? true])));

  const setKid = async (k: Child, v: boolean) => {
    setKidOn((s) => ({ ...s, [k.id]: v }));
    const { error } = await supabase().from("children").update({ reminder: v }).eq("id", k.id);
    if (error) toast(friendlyError(error), "error");
    await refresh();
  };

  return (
    <>
      <section className="divide-y divide-line rounded-2xl border border-line bg-surface">
        <Row title="Daily learning reminder" sub="One email a day, only if no one has learned yet">
          <Toggle label="Daily learning reminder" checked={on} onChange={(v) => { setOn(v); void save({ reminder_on: v }); }} />
        </Row>
        {on && (
          <>
            <Row title="Time" sub={`Your time zone: ${tz()}`}>
              <select
                aria-label="Reminder time"
                value={hour}
                onChange={(e) => { const h = Number(e.target.value); setHour(h); void save({ reminder_hour: h }); }}
                className="h-11 rounded-lg border-[1.5px] border-line-strong bg-surface px-3 text-[15px] font-bold"
              >
                {Array.from({ length: 16 }, (_, i) => i + 7).map((h) => (
                  <option key={h} value={h}>{hourLabel(h)}</option>
                ))}
              </select>
            </Row>
            {kids.map((k) => (
              <Row key={k.id} title={k.name}>
                <Toggle label={`Reminders for ${k.name}`} checked={kidOn[k.id] ?? true} onChange={(v) => void setKid(k, v)} />
              </Row>
            ))}
          </>
        )}
      </section>
      <section className="rounded-2xl border border-line bg-surface">
        <Row title="Gurpurab reminders" sub="On the morning of each Gurpurab, once dates are set for the year">
          <Toggle label="Gurpurab reminders" checked={gurpurab} onChange={(v) => { setGurpurab(v); void save({ gurpurab_reminders: v }); }} />
        </Row>
      </section>
      <p className="text-caption text-ink-3">Reminders come by email for now. Phone notifications arrive with the mobile apps.</p>
    </>
  );
}
