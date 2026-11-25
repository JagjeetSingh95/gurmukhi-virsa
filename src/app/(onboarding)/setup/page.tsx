"use client";
// N.3.3 Parent setup (U03): consent → PIN (optional) → child name → age → avatar → level → more kids → trial offer → finish.
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { Sheru } from "@/components/sheru/Sheru";
import { Button, Chip, CodeInput, Input } from "@/components/ui/controls";
import { Badge, Progress, ProfileTile } from "@/components/ui/display";
import { useToast } from "@/components/ui/feedback";
import { useAuth } from "@/lib/auth";
import { ageBands, avatarEmoji, avatars, levels } from "@/lib/avatars";
import { billing } from "@/lib/billing";
import { useIsFamily } from "@/lib/entitlement";
import { friendlyError, loadSupabase } from "@/lib/supabase/client";
import type { Child } from "@/lib/supabase/types";

type Step = "consent" | "pin" | "name" | "age" | "avatar" | "level" | "more" | "trial";
const ORDER: Step[] = ["consent", "pin", "name", "age", "avatar", "level", "more", "trial"];
type Draft = { name: string; age_band: string; avatar: string; level: string };
const emptyDraft: Draft = { name: "", age_band: "", avatar: "lion", level: "new" };

export default function Setup() {
  const router = useRouter();
  const toast = useToast();
  const { ready, session, profile, kids, refresh } = useAuth();
  const [chosen, setStep] = useState<Step>("consent");
  const [agree, setAgree] = useState(false);
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [adding] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("add"));

  // Guard + resume where the parent left off.
  useEffect(() => {
    if (!ready) return;
    if (!session) return router.replace("/signin");
    if (profile?.setup_done && !adding) return router.replace("/profiles");
  }, [ready, session, profile, router, adding]);

  const isFamily = useIsFamily();
  const limit = isFamily ? 5 : 1;
  const go = (s: Step) => {
    setError(null);
    setStep(s);
  };
  const run = async (fn: () => Promise<{ error: unknown } | void>) => {
    setBusy(true);
    setError(null);
    try {
      const r = await fn();
      if (r && r.error) throw r.error;
      return true;
    } catch (e) {
      setError(friendlyError(e));
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (!ready || !session) return null;
  // Resume: skip consent if already given (or when adding a child later).
  const step: Step =
    chosen !== "consent" ? chosen : adding ? "name" : profile?.consent_at ? (kids.length ? "more" : "pin") : "consent";
  const idx = ORDER.indexOf(step);

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex items-center gap-3">
        {idx > 0 && step !== "more" && step !== "trial" && (
          <button type="button" aria-label="Back" onClick={() => go(ORDER[idx - 1])} className="grid size-10 place-items-center rounded-full hover:bg-sunken">
            <Icon name="arrow-right" className="rotate-180" />
          </button>
        )}
        <Progress value={((idx + 1) / ORDER.length) * 100} label="Setup progress" className="flex-1" />
      </div>

      {step === "consent" && (
        <section className="flex flex-col gap-5">
          <h1 className="text-h1">Before we start</h1>
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 text-[15px] text-ink-2">
            <p className="font-bold text-ink">As a parent or guardian, you agree that we may store:</p>
            <ul className="flex flex-col gap-2">
              {["Your email address (to sign in)", "Each child's first name, age range, avatar and level", "Their learning progress"].map((t) => (
                <li key={t} className="flex gap-2"><Icon name="check" size={18} className="mt-0.5 shrink-0 text-success" />{t}</li>
              ))}
            </ul>
            <p>No photos, no surnames, no ads, no tracking. You can delete everything at any time.</p>
          </div>
          <label className="flex cursor-pointer items-start gap-3 text-[15px] font-bold">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 size-5 accent-[var(--brand)]" />
            I&apos;m the parent or guardian and I agree to the Privacy policy.
          </label>
          {error && <p className="text-caption text-error" role="alert">{error}</p>}
          <Button disabled={!agree} loading={busy} onClick={async () => (await run(async () => (await loadSupabase()).rpc("give_consent"))) && (await refresh(), go("pin"))}>
            Agree and continue
          </Button>
        </section>
      )}

      {step === "pin" && (
        <section className="flex flex-col gap-5">
          <h1 className="text-h1">Set a parent PIN</h1>
          <p className="text-body-l text-ink-2">The PIN keeps settings and purchases away from little fingers. You can skip this — we&apos;ll use a quick sum instead.</p>
          <CodeInput label="Choose a 4-digit PIN" length={4} secret value={pin} onChange={setPin} />
          <CodeInput label="Type it again" length={4} secret value={pin2} onChange={setPin2} error={pin2.length === 4 && pin !== pin2 ? "PINs don't match." : (error ?? undefined)} />
          <Button
            disabled={pin.length !== 4 || pin !== pin2}
            loading={busy}
            onClick={async () => (await run(async () => (await loadSupabase()).rpc("set_parent_pin", { p_pin: pin }))) && (await refresh(), go(kids.length ? "more" : "name"))}
          >
            Save PIN
          </Button>
          <Button variant="ghost" onClick={() => go(kids.length ? "more" : "name")}>Skip for now</Button>
        </section>
      )}

      {step === "name" && (
        <section className="flex flex-col gap-5">
          <Sheru mood="happy" size={96} decorative />
          <h1 className="text-h1">What&apos;s your child&apos;s name?</h1>
          <Input label="First name or nickname" hint="First name only — no surnames." maxLength={30} autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <Button disabled={!draft.name.trim()} onClick={() => go("age")}>Next</Button>
        </section>
      )}

      {step === "age" && (
        <section className="flex flex-col gap-5">
          <h1 className="text-h1">How old is {draft.name.trim()}?</h1>
          <div className="grid grid-cols-2 gap-3">
            {ageBands.map((a) => (
              <Chip key={a.value} selected={draft.age_band === a.value} onClick={() => setDraft({ ...draft, age_band: a.value })} className="!h-16 justify-center !text-[20px]">
                {a.label}
              </Chip>
            ))}
          </div>
          <Button disabled={!draft.age_band} onClick={() => go("avatar")}>Next</Button>
        </section>
      )}

      {step === "avatar" && (
        <section className="flex flex-col gap-5">
          <h1 className="text-h1">Pick a buddy for {draft.name.trim()}</h1>
          <div className="grid grid-cols-4 gap-3" role="radiogroup" aria-label="Avatar">
            {avatars.map((a, i) => (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={draft.avatar === a.id}
                aria-label={a.label}
                onClick={() => setDraft({ ...draft, avatar: a.id })}
                className={`grid aspect-square place-items-center rounded-2xl text-[40px] transition-transform hover:scale-105 ${draft.avatar === a.id ? "ring-4 ring-brand ring-offset-2 ring-offset-app" : ""}`}
                style={{ background: ["#FFE7CC", "#E6E9F6", "#DDF3E6", "#FFF1C7", "#E0EEFA", "#FBE3E3"][i % 6] }}
              >
                {a.emoji}
              </button>
            ))}
          </div>
          <Button onClick={() => go("level")}>Next</Button>
        </section>
      )}

      {step === "level" && (
        <section className="flex flex-col gap-5">
          <h1 className="text-h1">How much Gurmukhi does {draft.name.trim()} know?</h1>
          <div className="flex flex-col gap-3" role="radiogroup" aria-label="Level">
            {levels.map((l) => (
              <button
                key={l.value}
                type="button"
                role="radio"
                aria-checked={draft.level === l.value}
                onClick={() => setDraft({ ...draft, level: l.value })}
                className={`rounded-xl border-2 bg-surface p-4 text-left ${draft.level === l.value ? "border-navy-600 bg-navy-50 dark:bg-navy-900" : "border-line-strong"}`}
              >
                <span className="block text-[17px] font-extrabold">{l.label}</span>
                <span className="text-[14px] text-ink-2">{l.hint}</span>
              </button>
            ))}
          </div>
          {error && <p className="text-caption text-error" role="alert">{error}</p>}
          <Button
            loading={busy}
            onClick={async () => {
              const ok = await run(async () =>
                (await loadSupabase()).from("children").insert({
                  parent_id: session.user.id,
                  name: draft.name.trim(),
                  age_band: draft.age_band as Child["age_band"],
                  avatar: draft.avatar,
                  level: draft.level as Child["level"],
                  color_index: kids.length % 6,
                }),
              );
              if (ok) {
                await refresh();
                toast(`${draft.name.trim()} added`, "success");
                setDraft(emptyDraft);
                go("more");
              }
            }}
          >
            Add {draft.name.trim()}
          </Button>
        </section>
      )}

      {step === "more" && (
        <section className="flex flex-col gap-5">
          <h1 className="text-h1">Your family</h1>
          <div className="flex flex-wrap gap-5">
            {kids.map((k) => (
              <ProfileTile key={k.id} name={k.name} emoji={avatarEmoji(k.avatar)} colorIndex={k.color_index} />
            ))}
          </div>
          {kids.length < limit ? (
            <Button variant="secondary" icon={<Icon name="users" size={20} />} onClick={() => go("name")}>
              Add another child
            </Button>
          ) : (
            !isFamily && (
              <p className="flex items-center gap-2 rounded-xl bg-reward-bg p-4 text-[15px] font-bold text-reward">
                <Icon name="lock" size={18} /> The Free plan has 1 child profile. Family adds up to 5.
              </p>
            )
          )}
          <Button disabled={!kids.length} onClick={() => (adding ? router.replace("/profiles") : go("trial"))}>{adding ? "Done" : "Continue"}</Button>
        </section>
      )}

      {step === "trial" && (
        <section className="flex flex-col items-center gap-5 text-center">
          <Sheru mood="proud" size={120} decorative />
          <Badge tone="reward" icon="star">Optional</Badge>
          <h1 className="text-h1">Try Family free for 7 days</h1>
          <p className="text-body-l text-ink-2">All 35 letters, every sakhi and up to 5 children. We&apos;ll remind you on day 5. Cancel any time.</p>
          {!billing().live && (
            <p className="rounded-md bg-info-bg px-3 py-2 text-[14px] font-bold text-info">Payments aren&apos;t live yet — you can start the trial once Family launches.</p>
          )}
          {error && <p className="text-caption text-error" role="alert">{error}</p>}
          {billing().live && (
            <Button
              block
              loading={busy}
              onClick={async () => {
                const r = await billing().startTrial("yearly");
                if (!r.ok) return setError(r.message);
                if (await run(async () => (await loadSupabase()).rpc("finish_setup"))) {
                  await refresh();
                  router.replace("/profiles");
                }
              }}
            >
              Start 7-day free trial
            </Button>
          )}
          <Button
            block
            variant={billing().live ? "ghost" : undefined}
            loading={busy}
            onClick={async () => (await run(async () => (await loadSupabase()).rpc("finish_setup"))) && (await refresh(), router.replace("/profiles"))}
          >
            Maybe later — let&apos;s start
          </Button>
        </section>
      )}
    </div>
  );
}
