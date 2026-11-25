"use client";
// N.3.4 Profile picker (D05 / U04): kids tap their tile (no login). Parent + Add child sit behind the parent gate.
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ParentGate } from "@/components/gate/ParentGate";
import { Icon } from "@/components/icons";
import { ProfileTile } from "@/components/ui/display";
import { useAuth } from "@/lib/auth";
import { avatarEmoji } from "@/lib/avatars";
import { local } from "@/lib/local";

export default function Profiles() {
  const router = useRouter();
  const { ready, session, profile, kids, signOut } = useAuth();
  const [gateFor, setGateFor] = useState<null | "parent" | "add" | "signout">(null);

  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace("/signin");
    else if (profile && !profile.setup_done) router.replace("/setup");
  }, [ready, session, profile, router]);

  if (!ready || !session) return null;

  const pick = (id: string) => {
    local.setActiveChild(id);
    local.closeGate();
    router.push("/learn");
  };

  return (
    <div className="flex flex-col items-center gap-8 pt-6 text-center">
      <h1 className="text-h1">Who&apos;s learning today?</h1>
      <div className="flex flex-wrap justify-center gap-6">
        {kids.map((k) => (
          <ProfileTile key={k.id} name={k.name} emoji={avatarEmoji(k.avatar)} colorIndex={k.color_index} onClick={() => pick(k.id)} />
        ))}
        <button type="button" onClick={() => setGateFor("add")} className="group flex flex-col items-center gap-2">
          <span className="grid size-[84px] place-items-center rounded-2xl border-2 border-dashed border-line-strong text-ink-3 transition-transform group-hover:scale-105 tab:size-[112px]">
            <Icon name="users" size={32} />
          </span>
          <span className="text-[16px] font-extrabold text-ink-2">Add child</span>
        </button>
      </div>

      <div className="flex w-full flex-col gap-2 border-t border-line pt-6">
        <button type="button" onClick={() => setGateFor("parent")} className="flex items-center justify-center gap-2 rounded-lg py-3 text-[16px] font-extrabold text-ink hover:bg-sunken">
          <Icon name="parent" size={20} /> Parent area
        </button>
        <button type="button" onClick={() => setGateFor("signout")} className="text-[14px] font-bold text-ink-3 underline">
          Sign out
        </button>
      </div>

      <ParentGate
        open={gateFor !== null}
        reason={gateFor === "add" ? "Adding a child is for grown-ups." : gateFor === "signout" ? "Signing out is for grown-ups." : "The parent area is for grown-ups."}
        onClose={() => setGateFor(null)}
        onPass={async () => {
          const g = gateFor;
          setGateFor(null);
          if (g === "parent") router.push("/parent");
          else if (g === "add") router.push("/setup?add=1");
          else if (g === "signout") {
            await signOut();
            router.replace("/welcome");
          }
        }}
      />
    </div>
  );
}
