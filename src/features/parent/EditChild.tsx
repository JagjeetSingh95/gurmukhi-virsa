"use client";
// N.7.2 Edit / remove child (U05 §4): name, age, picture, level, daily goal. Reset progress is separate
// from removing. Removing the last child sends the parent back to "Add child" on the dashboard.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Input, Segmented } from "@/components/ui/controls";
import { ConfirmDialog, useToast } from "@/components/ui/feedback";
import { useAuth } from "@/lib/auth";
import { ageBands, avatars, levels } from "@/lib/avatars";
import { cn } from "@/lib/cn";
import { local } from "@/lib/local";
import { friendlyError, supabase } from "@/lib/supabase/client";
import type { Child } from "@/lib/supabase/types";
import { Field } from "./ui";

const GOALS = [3, 5, 10, 15] as const;

export function EditChild({ id }: { id: string }) {
  const { kids } = useAuth();
  const child = kids.find((k) => k.id === id);
  if (!child) return <p className="text-body-l">We couldn&apos;t find this child.</p>;
  return <EditForm key={child.id} child={child} />;
}

function EditForm({ child }: { child: Child }) {
  const router = useRouter();
  const toast = useToast();
  const { refresh } = useAuth();
  const [name, setName] = useState(child.name);
  const [age, setAge] = useState<Child["age_band"]>(child.age_band);
  const [avatar, setAvatar] = useState(child.avatar);
  const [level, setLevel] = useState<Child["level"]>(child.level);
  const [goal, setGoal] = useState<Child["daily_goal_min"]>(child.daily_goal_min ?? 5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"reset" | "remove" | null>(null);
  const clean = name.trim();

  const clearDevice = () => {
    try {
      localStorage.removeItem(`gv.learn.${child.id}`);
    } catch {}
  };

  const save = async () => {
    if (!clean) return setError("Please enter a first name.");
    setBusy(true);
    setError(null);
    const { error: e } = await supabase().from("children").update({ name: clean.slice(0, 24), age_band: age, avatar, level, daily_goal_min: goal }).eq("id", child.id);
    setBusy(false);
    if (e) return setError(friendlyError(e));
    await refresh();
    toast("Saved", "success");
    router.push(`/parent/child?id=${child.id}`);
  };

  const reset = async () => {
    setConfirm(null);
    const { error: e } = await supabase().rpc("reset_child_progress", { p_child: child.id });
    if (e) return toast(friendlyError(e), "error");
    clearDevice();
    await refresh();
    toast(`${child.name}'s progress was reset`, "success");
  };

  const remove = async () => {
    setConfirm(null);
    const { error: e } = await supabase().from("children").delete().eq("id", child.id);
    if (e) return toast(friendlyError(e), "error");
    clearDevice();
    if (local.activeChild() === child.id) local.setActiveChild(null);
    await refresh();
    toast(`${child.name} was removed`, "success");
    router.replace("/parent");
  };

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <Input label="First name" value={name} maxLength={24} autoComplete="off" onChange={(e) => setName(e.target.value)} error={error ?? undefined} />
      <Field label="Age">
        <Segmented label="Age" value={age} onChange={setAge} options={ageBands.map((a) => ({ value: a.value, label: a.label }))} />
      </Field>
      <Field label="Picture">
        <div className="grid grid-cols-4 gap-3 tab:grid-cols-8" role="radiogroup" aria-label="Picture">
          {avatars.map((a) => (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={avatar === a.id}
              aria-label={a.label}
              onClick={() => setAvatar(a.id)}
              className={cn("grid aspect-square place-items-center rounded-2xl bg-sunken text-[32px]", avatar === a.id && "ring-4 ring-brand ring-offset-2 ring-offset-app")}
            >
              {a.emoji}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Level">
        <div className="grid gap-2" role="radiogroup" aria-label="Level">
          {levels.map((l) => (
            <button
              key={l.value}
              type="button"
              role="radio"
              aria-checked={level === l.value}
              onClick={() => setLevel(l.value)}
              className={cn("rounded-xl border-2 p-3 text-left", level === l.value ? "border-brand bg-brand-soft" : "border-line bg-surface")}
            >
              <span className="block text-[16px] font-extrabold">{l.label}</span>
              <span className="block text-caption text-ink-2">{l.hint}</span>
            </button>
          ))}
        </div>
      </Field>
      <Field label="Daily goal" hint="A gentle target shown to you, never a pressure on your child.">
        <Segmented label="Daily goal" value={String(goal)} onChange={(v) => setGoal(Number(v) as Child["daily_goal_min"])} options={GOALS.map((g) => ({ value: String(g), label: `${g} min` }))} />
      </Field>
      <Button type="submit" loading={busy}>Save</Button>

      <div className="mt-4 flex flex-col gap-3 border-t border-line pt-6">
        <Button type="button" variant="secondary" onClick={() => setConfirm("reset")}>Reset {child.name}&apos;s progress</Button>
        <Button type="button" variant="ghost" className="!text-error" onClick={() => setConfirm("remove")}>Remove {child.name}</Button>
      </div>

      <ConfirmDialog
        open={confirm === "reset"}
        onClose={() => setConfirm(null)}
        onConfirm={() => void reset()}
        title={`Reset ${child.name}'s progress?`}
        body="Letters, stars, stories, minutes and the streak go back to the start. The profile stays. This can't be undone."
        confirmLabel="Reset"
        destructive
      />
      <ConfirmDialog
        open={confirm === "remove"}
        onClose={() => setConfirm(null)}
        onConfirm={() => void remove()}
        title={`Remove ${child.name}?`}
        body={`${child.name}'s profile, progress and stars are deleted. This can't be undone.`}
        confirmLabel="Remove"
        destructive
      />
    </form>
  );
}
