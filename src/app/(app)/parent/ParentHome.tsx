"use client";
// Parent tab — always behind the parent gate (U.5). Dashboard = N.7.1.
import { GatedPage } from "@/components/gate/ParentGate";
import { ButtonLink } from "@/components/ui/controls";
import { TopBar } from "@/components/ui/display";
import { ParentDashboard } from "@/features/parent/Dashboard";
import { useAuth } from "@/lib/auth";

export function ParentHome() {
  const { ready, session } = useAuth();
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
        <ParentDashboard />
      </GatedPage>
    </>
  );
}
