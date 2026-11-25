"use client";
// N.9.1 Settings (D15, U12): reading, app (language, theme, sounds), kid profile, family account, help.
// Plan / parent area / sign out sit behind the parent gate. Settings sync to the family account when signed in.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ParentGate } from "@/components/gate/ParentGate";
import { Icon } from "@/components/icons";
import { Button, ButtonLink, Segmented, Toggle } from "@/components/ui/controls";
import { Card, ListRow, TopBar } from "@/components/ui/display";
import { sizes, writeSettings, useReaderSettings, type ReaderSettings } from "@/features/paath/settings";
import moolMantar from "@/content/banis/mool-mantar.json";
import { useAuth } from "@/lib/auth";
import { avatarEmoji } from "@/lib/avatars";
import { tierLabel, useEntitlement } from "@/lib/entitlement";
import { useT } from "@/lib/i18n";
import { local } from "@/lib/local";
import { usePrefs, writePrefs, type Lang, type Theme } from "@/lib/prefs";
import { useSyncStatus } from "@/lib/settingsSync";
import { useLocal } from "@/lib/useLocal";

const SIZE_LABELS = ["S", "M", "L", "XL"];
// Preview words come from Shabad OS data (never hand-typed); skip the first word (ੴ needs <IkOnkar/>).
const SAMPLE = moolMantar.lines[0].gurmukhi.split(" ").slice(1, 5).join(" ");

export function SettingsView() {
  const router = useRouter();
  const t = useT();
  const { session, profile, kids, signOut } = useAuth();
  const prefs = usePrefs();
  const reader = useReaderSettings();
  const sync = useSyncStatus();
  const ent = useEntitlement();
  const mode = useLocal(local.mode, null);
  const activeId = useLocal(local.activeChild, null);
  const child = session && mode === "family" ? kids.find((k) => k.id === activeId) : undefined;
  const [gateFor, setGateFor] = useState<null | "signout" | "parent" | "plan">(null);

  const onPass = async () => {
    const g = gateFor;
    setGateFor(null);
    if (g === "signout") {
      await signOut();
      router.replace("/welcome");
    } else if (g === "parent") router.push("/parent");
    else if (g === "plan") router.push("/parent/plans?from=/settings");
  };

  return (
    <>
      <TopBar title={t("settings.title")} />
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5 p-5 web:p-8">
        {child && (
          <Link href="/profile" className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 hover:bg-sunken">
            <span className="grid size-14 place-items-center rounded-full bg-brand-soft text-[30px]">{avatarEmoji(child.avatar)}</span>
            <span className="flex-1">
              <span className="block text-h3">{child.name}</span>
              <span className="text-[14px] text-ink-2">{t("profile.title")}</span>
            </span>
            <Icon name="chevron-right" className="text-ink-3" />
          </Link>
        )}

        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-h3">{t("settings.reading")}</h2>
            <span className="inline-flex items-center gap-1 text-caption font-bold text-ink-3">
              <Icon name={sync === "synced" ? "check" : "devices"} size={14} />
              {sync === "synced" ? t("settings.synced") : t("settings.device")}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[15px] font-bold">{t("settings.textSize")}</span>
            <Segmented
              label={t("settings.textSize")}
              value={String(reader.size)}
              onChange={(v) => writeSettings({ size: Number(v) as ReaderSettings["size"] })}
              options={SIZE_LABELS.map((l, i) => ({ value: String(i), label: l }))}
            />
          </div>
          <p className="rounded-xl bg-sunken px-4 py-3 text-center font-gurbani text-ink" style={{ fontSize: sizes.adult[reader.size] }} lang="pa">
            {SAMPLE}
          </p>
          {(["roman", "en", "pa"] as const).map((k) => (
            <label key={k} className="flex items-center justify-between gap-3 text-[15px] font-bold">
              {t(k === "roman" ? "settings.roman" : k === "en" ? "settings.english" : "settings.punjabi")}
              <Toggle label={t(k === "roman" ? "settings.roman" : k === "en" ? "settings.english" : "settings.punjabi")} checked={reader[k]} onChange={(v) => writeSettings({ [k]: v })} />
            </label>
          ))}
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="text-h3">{t("settings.app")}</h2>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[15px] font-bold">{t("settings.language")}</span>
            <Segmented<Lang>
              label={t("settings.language")}
              value={prefs.lang}
              onChange={(lang) => writePrefs({ lang })}
              options={[{ value: "en", label: "English" }, { value: "pa", label: "ਪੰਜਾਬੀ" }]}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[15px] font-bold">{t("settings.theme")}</span>
            <Segmented<Theme>
              label={t("settings.theme")}
              value={prefs.theme}
              onChange={(theme) => writePrefs({ theme })}
              options={[{ value: "system", label: t("settings.auto") }, { value: "light", label: t("settings.light") }, { value: "dark", label: t("settings.dark") }]}
            />
          </div>
          <label className="flex items-center justify-between gap-3 text-[15px] font-bold">
            {t("settings.sounds")}
            <Toggle label={t("settings.sounds")} checked={prefs.sounds} onChange={(sounds) => writePrefs({ sounds })} />
          </label>
        </Card>

        {session ? (
          <Card className="flex flex-col gap-2">
            <h2 className="text-h3">{t("settings.account")}</h2>
            <p className="text-[15px] text-ink-2">
              {t("settings.signedIn")} <strong className="text-ink">{profile?.email}</strong>
            </p>
            <ListRow icon="users" title={t("settings.switch")} href="/profiles" className="-mx-4" />
            <ListRow icon="parent" title={t("settings.parentArea")} onClick={() => setGateFor("parent")} className="-mx-4" />
            <ListRow icon="star" title={t("settings.plan")} value={tierLabel(ent)} onClick={() => setGateFor("plan")} className="-mx-4" />
            <Button variant="secondary" className="mt-2" onClick={() => setGateFor("signout")}>{t("settings.signOut")}</Button>
          </Card>
        ) : (
          <Card className="flex flex-col gap-3">
            <h2 className="text-h3">{t("settings.guestTitle")}</h2>
            <p className="text-[15px] text-ink-2">{t("settings.guestBody")}</p>
            <ButtonLink href="/signin">{t("settings.createAccount")}</ButtonLink>
            <button type="button" className="text-[14px] font-bold text-ink-3 underline" onClick={() => { local.setMode(null); router.push("/who"); }}>
              {t("settings.changeWho")}
            </button>
          </Card>
        )}

        <Card className="flex flex-col gap-1">
          <h2 className="mb-1 text-h3">{t("settings.help")}</h2>
          <ListRow icon="info" title={t("settings.helpCentre")} href="/help" className="-mx-4" />
          <ListRow icon="mail" title={t("settings.contact")} href="/parent/contact" className="-mx-4" />
          <ListRow icon="shield" title={t("settings.privacy")} href="/privacy" className="-mx-4" />
          <ListRow icon="book" title={t("settings.terms")} href="/terms" className="-mx-4" />
        </Card>
        <p className="text-center text-caption text-ink-3">{t("settings.about")}</p>
      </div>
      <ParentGate
        open={gateFor !== null}
        reason={gateFor === "signout" ? "Signing out is for grown-ups." : gateFor === "plan" ? "Plans are for grown-ups." : "This area is for grown-ups."}
        onClose={() => setGateFor(null)}
        onPass={onPass}
      />
    </>
  );
}
