"use client";
// N.9.1 Kid profile (D15): picture, name, letters / streak / stars / sakhis, badges, switch profile.
// No prices, no settings that cost money. Picture change is kid-safe (emoji avatars only, no photos).
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { Sheru } from "@/components/sheru/Sheru";
import { ButtonLink } from "@/components/ui/controls";
import { TopBar } from "@/components/ui/display";
import { useToast } from "@/components/ui/feedback";
import { useAuth } from "@/lib/auth";
import { avatarEmoji, avatars } from "@/lib/avatars";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n";
import { supabase } from "@/lib/supabase/client";
import { letters } from "./content";
import { useLearner } from "./learner";

type BadgeDef = { id: string; label: string; emoji: string; earned: boolean };

export function KidProfile() {
  const t = useT();
  const toast = useToast();
  const { refresh } = useAuth();
  const L = useLearner();
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  const child = L.child;

  const stars = Object.values(L.progress).reduce((a, b) => a + b, 0);
  const sakhis = Object.keys(L.progress).filter((k) => k.startsWith("sakhi:")).length;
  const badges: BadgeDef[] = [
    { id: "l1", label: "First letter", emoji: "🌱", earned: L.lettersDone >= 1 },
    { id: "l5", label: "First 5 letters", emoji: "✋", earned: L.lettersDone >= 5 },
    { id: "l10", label: "First 10 letters", emoji: "🔟", earned: L.lettersDone >= 10 },
    { id: "l35", label: "All 35 letters", emoji: "🏆", earned: L.lettersDone >= letters.length },
    { id: "s3", label: "3-day streak", emoji: "🔥", earned: L.streak >= 3 },
    { id: "s7", label: "7-day streak", emoji: "🌟", earned: L.streak >= 7 },
    { id: "k1", label: "First sakhi", emoji: "📖", earned: sakhis >= 1 },
  ];

  if (!child)
    return (
      <>
        <TopBar title={t("profile.title")} />
        <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <Sheru mood="think" size={96} decorative />
          <p className="text-body text-ink-2">Pick who&apos;s learning to see their profile.</p>
          <ButtonLink href="/profiles">{t("settings.switch")}</ButtonLink>
        </div>
      </>
    );

  const setAvatar = async (id: string) => {
    setBusy(true);
    const { error } = await supabase().from("children").update({ avatar: id }).eq("id", child.id);
    setBusy(false);
    if (error) return toast("Couldn't save. Check your connection.", "error");
    await refresh();
    setPicking(false);
  };

  const stats = [
    { label: t("profile.letters"), value: `${L.lettersDone}/${letters.length}`, icon: "letter" as const },
    { label: t("profile.streak"), value: String(L.streak), icon: "star" as const },
    { label: t("profile.stars"), value: String(stars), icon: "sparkle" as const },
    { label: t("profile.sakhis"), value: String(sakhis), icon: "book" as const },
  ];

  return (
    <>
      <TopBar
        title={t("profile.title")}
        trailing={
          <Link href="/settings" aria-label={t("nav.settings")} className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-sunken">
            <Icon name="settings" />
          </Link>
        }
      />
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-5 py-6 web:px-8">
        <section className="flex flex-col items-center gap-3 text-center">
          <button
            type="button"
            onClick={() => setPicking((p) => !p)}
            aria-expanded={picking}
            aria-label={t("profile.avatar")}
            className="relative grid size-28 place-items-center rounded-full bg-brand-soft text-[60px] tab:size-32"
          >
            {avatarEmoji(child.avatar)}
            <span className="absolute right-0 bottom-0 grid size-9 place-items-center rounded-full bg-brand text-white shadow">
              <Icon name="sparkle" size={18} />
            </span>
          </button>
          <h1 className="text-h1">{child.name}</h1>
        </section>

        {picking && (
          <section aria-label={t("profile.avatar")} className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
            <p className="text-label text-ink-2">{t("profile.avatar")}</p>
            <div className="grid grid-cols-4 gap-3">
              {avatars.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  disabled={busy}
                  aria-pressed={a.id === child.avatar}
                  aria-label={a.label}
                  onClick={() => setAvatar(a.id)}
                  className={cn("grid aspect-square place-items-center rounded-2xl text-[36px]", a.id === child.avatar ? "bg-brand-soft ring-3 ring-brand" : "bg-sunken hover:bg-brand-soft")}
                >
                  {a.emoji}
                </button>
              ))}
            </div>
          </section>
        )}

        <ul className="grid grid-cols-2 gap-3 web:grid-cols-4">
          {stats.map((s) => (
            <li key={s.label} className="flex flex-col items-center gap-1 rounded-2xl border border-line bg-surface p-4 text-center">
              <Icon name={s.icon} className="text-brand-text" />
              <span className="text-h2">{s.value}</span>
              <span className="text-[13px] font-bold text-ink-2">{s.label}</span>
            </li>
          ))}
        </ul>

        <section aria-labelledby="badges-h" className="flex flex-col gap-3">
          <h2 id="badges-h" className="text-h3">{t("profile.badges")}</h2>
          {!badges.some((b) => b.earned) && <p className="text-[15px] text-ink-2">{t("profile.noBadges")}</p>}
          <ul className="grid grid-cols-3 gap-3 tab:grid-cols-4 web:grid-cols-7">
            {badges.map((b) => (
              <li
                key={b.id}
                className={cn("flex flex-col items-center gap-1 rounded-2xl p-3 text-center", b.earned ? "bg-reward-bg" : "bg-sunken opacity-60")}
                aria-label={`${b.label}${b.earned ? "" : " (not yet)"}`}
              >
                <span className={cn("text-[32px]", !b.earned && "grayscale")} aria-hidden>{b.earned ? b.emoji : "🔒"}</span>
                <span className="text-[12px] font-extrabold text-ink-2">{b.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <ButtonLink href="/profiles" variant="ghost">{t("profile.switch")}</ButtonLink>
      </div>
    </>
  );
}
