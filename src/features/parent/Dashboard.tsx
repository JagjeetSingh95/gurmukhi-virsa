"use client";
// N.7.1 Parent dashboard (D14, U05) — behind the parent gate. Calm summary, no rankings between siblings.
// Free plan: family totals + letters/streak per child; the minutes chart and per-child week detail carry a Family tag.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { Button, ButtonLink, Segmented } from "@/components/ui/controls";
import { Badge, LockTag, Progress } from "@/components/ui/display";
import { Skeleton } from "@/components/ui/feedback";
import { useAuth } from "@/lib/auth";
import { avatarEmoji } from "@/lib/avatars";
import { cn } from "@/lib/cn";
import { useIsFamily } from "@/lib/entitlement";
import { useFamilyStats, type ChildStats } from "./stats";

const AVATAR_BG = ["#FFE7CC", "#E6E9F6", "#DDF3E6", "#FFF1C7", "#E0EEFA", "#FBE3E3"];
const ageLabel = (b: string) => `Age ${b.replace("-", "–")}`;

export function ParentDashboard() {
  const router = useRouter();
  const { profile, kids, signOut } = useAuth();
  const isFamily = useIsFamily();
  const { loading, error, stats, totals, familyDays } = useFamilyStats(kids);
  const [range, setRange] = useState<"week" | "month">("week");
  const [now] = useState(() => Date.now());
  const maxKids = isFamily ? 5 : 1;
  const trialDays = profile?.trial_ends_at ? Math.ceil((new Date(profile.trial_ends_at).getTime() - now) / 86_400_000) : 0;
  const plan = profile?.plan === "family" ? "Family" : trialDays > 0 ? `Trial · ${trialDays} day${trialDays === 1 ? "" : "s"} left` : "Free";

  return (
    <div className="flex flex-col gap-6 px-5 py-6 web:px-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-h2 web:text-h1">Parent dashboard</h1>
        <ButtonLink href={kids.length < maxKids ? "/setup?add=1" : "/pricing"} size="sm" variant="secondary" className="gap-2">
          <Icon name="users" size={18} /> Add child
        </ButtonLink>
      </div>

      {error && <p className="rounded-xl bg-error-bg p-4 text-[15px] font-bold text-error">Couldn&apos;t load the latest progress. Check your connection and try again.</p>}

      <div className="grid gap-6 web:grid-cols-[minmax(0,1fr)_340px]">
        {/* Children column */}
        <div className="flex flex-col gap-5">
          {kids.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface p-5">
              <p className="text-h3">Add your first child</p>
              <p className="text-[15px] text-ink-2">Create a profile so their letters, stories and streak are saved.</p>
              <ButtonLink href="/setup?add=1" size="sm">Add child</ButtonLink>
            </div>
          ) : (
            <>
              {/* Family summary */}
              <section aria-label="This week" className="rounded-2xl bg-navy-800 p-5 text-white dark:bg-navy-900">
                <p className="text-caption font-extrabold uppercase tracking-wider opacity-80">This week</p>
                {loading ? (
                  <Skeleton className="mt-2 h-8 w-2/3 bg-white/20" />
                ) : totals.minutes || totals.newLetters || totals.sakhis ? (
                  <p className="mt-1 text-h3 text-white">
                    {totals.minutes} minutes together · {totals.newLetters} letters · {totals.sakhis} sakhi{totals.sakhis === 1 ? "" : "s"}
                  </p>
                ) : (
                  <p className="mt-1 text-[17px] font-bold">
                    No learning yet this week. {kids[0].name}&apos;s first lesson takes 3 minutes.
                  </p>
                )}
                <p className="mt-1 text-[14px] opacity-80">
                  {totals.learning} of {kids.length} learning this week
                </p>
              </section>

              {/* Child cards — in the order they were added, never ranked */}
              <ul className="grid gap-3 tab:grid-cols-2">
                {stats.map((s) => (
                  <ChildCard key={s.child.id} s={s} loading={loading} detail={isFamily} />
                ))}
              </ul>

              {/* Family minutes */}
              <section aria-labelledby="minutes-h" className="rounded-2xl border border-line bg-surface p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 id="minutes-h" className="text-h3">Family minutes</h2>
                  {isFamily ? (
                    <Segmented label="Range" value={range} onChange={setRange} options={[{ value: "week", label: "Week" }, { value: "month", label: "Month" }]} />
                  ) : (
                    <LockTag />
                  )}
                </div>
                {isFamily ? (
                  <MinutesChart days={familyDays(range === "week" ? 7 : 30)} loading={loading} />
                ) : (
                  <div className="flex flex-col items-start gap-3">
                    <p className="text-[15px] text-ink-2">See minutes per day, letters to practise and recent activity with the Family plan.</p>
                    <Button size="sm" variant="secondary" onClick={() => router.push("/pricing")}>See plans</Button>
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        {/* Settings column */}
        <aside className="flex flex-col gap-3">
          <SettingRow icon="mail" title="Weekly email" value={profile?.weekly_email ? "Sundays" : "Off"} soon />
          <SettingRow icon="clock" title="Reminders" value="Set up" soon />
          <SettingRow icon="devices" title="Devices" value="Join code" soon />
          <SettingRow icon="star" title="Plan" value={plan} href="/pricing" />
          <SettingRow icon="shield" title="Parent PIN" value={profile?.has_pin ? "On" : "Off"} soon />
          <div className="mt-2 flex flex-col gap-1 rounded-2xl border border-line bg-surface p-4">
            <p className="text-caption text-ink-3">Signed in as</p>
            <p className="truncate text-[16px] font-extrabold">{profile?.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <ButtonLink href="/profiles" size="sm" variant="secondary">Switch profile</ButtonLink>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await signOut();
                  router.replace("/welcome");
                }}
              >
                Sign out
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ChildCard({ s, loading, detail }: { s: ChildStats; loading: boolean; detail: boolean }) {
  const { child } = s;
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 shadow-[0_2px_0_var(--border-default)]">
      <div className="flex items-center gap-3">
        <span className="grid size-14 place-items-center rounded-2xl text-[30px]" style={{ background: AVATAR_BG[child.color_index % AVATAR_BG.length] }} aria-hidden>
          {avatarEmoji(child.avatar)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[18px] font-extrabold">{child.name}</p>
          <p className="text-caption text-ink-2">{ageLabel(child.age_band)}</p>
        </div>
        <Badge tone="reward" icon="star">{child.streak_days} day{child.streak_days === 1 ? "" : "s"}</Badge>
      </div>
      <div>
        <div className="flex justify-between text-[14px]">
          <span className="font-bold text-ink-2">Letters</span>
          <span className="font-extrabold">{loading ? "…" : `${s.letters} / 35`}</span>
        </div>
        <Progress value={(s.letters / 35) * 100} label={`${child.name}: letters learned`} className="mt-1.5" tone={s.letters >= 35 ? "success" : "brand"} />
      </div>
      <div className="flex items-center justify-between border-t border-line pt-3 text-[14px]">
        <span className="font-bold text-ink-2">This week</span>
        {detail ? <span className="font-extrabold">{loading ? "…" : `${s.minutesWeek} min · ${s.newLetters} letters`}</span> : <LockTag />}
      </div>
    </li>
  );
}

function MinutesChart({ days, loading }: { days: { date: Date; minutes: number }[]; loading: boolean }) {
  const max = Math.max(10, ...days.map((d) => d.minutes));
  const total = Math.round(days.reduce((s, d) => s + d.minutes, 0));
  const many = days.length > 7;
  const today = new Date().toDateString();
  return (
    <figure>
      <div className={cn("flex h-40 items-end", many ? "gap-1" : "gap-3")} role="img" aria-label={`${total} minutes over the last ${days.length} days`}>
        {days.map((d) => {
          const h = loading ? 8 : Math.max(d.minutes ? 6 : 2, (d.minutes / max) * 100);
          return (
            <div key={d.date.toISOString()} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              {!many && !loading && d.minutes > 0 && <span className="text-caption text-ink-2">{Math.round(d.minutes)}</span>}
              <span
                className={cn("w-full rounded-t-md", loading ? "animate-pulse bg-sunken" : d.minutes ? (d.date.toDateString() === today ? "bg-brand" : "bg-brand/60") : "bg-sunken")}
                style={{ height: `${h}%` }}
                title={`${d.date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}: ${Math.round(d.minutes)} min`}
              />
            </div>
          );
        })}
      </div>
      <div className={cn("mt-2 flex text-center text-caption text-ink-3", many ? "gap-1" : "gap-3")} aria-hidden>
        {days.map((d, i) => (
          <span key={i} className="flex-1">
            {many ? (i % 5 === 4 || i === days.length - 1 ? d.date.getDate() : "") : d.date.toLocaleDateString("en-GB", { weekday: "narrow" })}
          </span>
        ))}
      </div>
      <figcaption className="mt-3 text-[14px] text-ink-2">{total} minutes in the last {days.length} days. Time counts while a child profile is open and in use.</figcaption>
    </figure>
  );
}

function SettingRow({ icon, title, value, href, soon }: { icon: IconName; title: string; value: string; href?: string; soon?: boolean }) {
  const inner = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-text">
        <Icon name={icon} size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-extrabold">{title}</span>
        <span className="block text-caption text-ink-2">{value}</span>
      </span>
      {soon ? <Badge tone="info">Soon</Badge> : <Icon name="chevron-right" size={20} className="text-ink-3" />}
    </>
  );
  const cls = "flex items-center gap-3 rounded-2xl border border-line bg-surface p-3";
  return href ? <Link href={href} className={cn(cls, "hover:bg-sunken")}>{inner}</Link> : <div className={cls}>{inner}</div>;
}
