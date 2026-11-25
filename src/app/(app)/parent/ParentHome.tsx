"use client";
// Parent tab — always behind the parent gate (U.5). Full dashboard arrives in N.7.1.
import Link from "next/link";
import { GatedPage } from "@/components/gate/ParentGate";
import { ButtonLink } from "@/components/ui/controls";
import { Badge, Card, ListRow, TopBar } from "@/components/ui/display";
import { useAuth } from "@/lib/auth";
import { avatarEmoji } from "@/lib/avatars";

export function ParentHome() {
  const { ready, session, profile, kids } = useAuth();
  if (!ready) return null;
  if (!session)
    return (
      <>
        <TopBar title="Parent" />
        <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <h2 className="text-h2">Teaching your kids?</h2>
          <p className="max-w-sm text-body text-ink-2">Sign in as a parent to add child profiles and follow their progress.</p>
          <ButtonLink href="/signin">Parent sign-in</ButtonLink>
        </div>
      </>
    );
  return (
    <>
      <TopBar title="Parent" />
      <GatedPage>
        <div className="flex flex-col gap-5 p-5 web:p-8">
          <Card className="flex flex-col gap-1">
            <p className="text-caption text-ink-3">Signed in as</p>
            <p className="text-[17px] font-extrabold">{profile?.email}</p>
            <div className="mt-2 flex gap-2">
              <Badge tone={profile?.plan === "family" ? "success" : "navy"}>{profile?.plan === "family" ? "Family" : "Free plan"}</Badge>
              <Badge tone={profile?.has_pin ? "success" : "reward"} icon="shield">{profile?.has_pin ? "PIN on" : "No PIN"}</Badge>
            </div>
          </Card>
          <Card className="!p-2">
            {kids.map((k) => (
              <ListRow key={k.id} title={`${avatarEmoji(k.avatar)}  ${k.name}`} subtitle={`Age ${k.age_band} · ${k.streak_days}-day streak`} />
            ))}
          </Card>
          <p className="text-caption text-ink-3">Progress dashboard and weekly summary arrive in the next update. <Link href="/profiles" className="underline">Switch profile</Link></p>
        </div>
      </GatedPage>
    </>
  );
}
