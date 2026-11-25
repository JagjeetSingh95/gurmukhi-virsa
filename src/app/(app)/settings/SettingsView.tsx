"use client";
// Settings (minimal until N.9.1): account, profile switch, theme, sign out. Family settings sit behind the gate.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ParentGate } from "@/components/gate/ParentGate";
import { Button, ButtonLink, Segmented } from "@/components/ui/controls";
import { Card, ListRow, TopBar } from "@/components/ui/display";
import { useAuth } from "@/lib/auth";
import { local } from "@/lib/local";

export function SettingsView() {
  const router = useRouter();
  const { session, profile, signOut } = useAuth();
  const [gate, setGate] = useState(false);
  const [theme, setTheme] = useState<"system" | "light" | "dark">(() => {
    if (typeof document === "undefined") return "system";
    return (document.documentElement.dataset.theme as "light" | "dark") ?? "system";
  });

  return (
    <>
      <TopBar title="Settings" />
      <div className="flex flex-col gap-5 p-5 web:p-8">
        <Card className="flex flex-col gap-3">
          <h2 className="text-h3">Theme</h2>
          <Segmented
            label="Theme"
            value={theme}
            onChange={(t) => {
              setTheme(t);
              if (t === "system") delete document.documentElement.dataset.theme;
              else document.documentElement.dataset.theme = t;
            }}
            options={[{ value: "system", label: "Auto" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]}
          />
        </Card>
        {session ? (
          <Card className="flex flex-col gap-3">
            <h2 className="text-h3">Account</h2>
            <p className="text-[15px] text-ink-2">Signed in as <strong className="text-ink">{profile?.email}</strong></p>
            <ListRow icon="users" title="Switch profile" href="/profiles" className="-mx-4" />
            <Button variant="secondary" onClick={() => setGate(true)}>Sign out</Button>
          </Card>
        ) : (
          <Card className="flex flex-col gap-3">
            <h2 className="text-h3">Save your bookmarks</h2>
            <p className="text-[15px] text-ink-2">You&apos;re reading as a guest. Create a free account to keep bookmarks and settings across devices.</p>
            <ButtonLink href="/signin">Create free account</ButtonLink>
            <button type="button" className="text-[14px] font-bold text-ink-3 underline" onClick={() => { local.setMode(null); router.push("/who"); }}>
              Change who&apos;s using the app
            </button>
          </Card>
        )}
      </div>
      <ParentGate
        open={gate}
        reason="Signing out is for grown-ups."
        onClose={() => setGate(false)}
        onPass={async () => {
          setGate(false);
          await signOut();
          router.replace("/welcome");
        }}
      />
    </>
  );
}
