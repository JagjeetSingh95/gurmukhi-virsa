"use client";
// U.1: "Teaching my kids?" card for adult guests after their 3rd session. No mascot here (Paath area).
import { useState } from "react";
import { ButtonLink } from "@/components/ui/controls";
import { useAuth } from "@/lib/auth";
import { local } from "@/lib/local";
import { useLocal } from "@/lib/useLocal";

export function TeachingKidsCard() {
  const { session } = useAuth();
  const sessions = useLocal(() => { try { return Number(localStorage.getItem("gv.sessions") ?? 0); } catch { return 0; } }, 0);
  const mode = useLocal(local.mode, null);
  const [hidden, setHidden] = useState(false);
  if (session || hidden || mode === "family" || sessions < 3) return null;
  return (
    <div className="mx-5 mb-8 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 web:mx-8">
      <h2 className="text-h3">Teaching your kids?</h2>
      <p className="text-[15px] text-ink-2">Add child profiles so they can learn letters and stories at their own pace.</p>
      <div className="flex gap-3">
        <ButtonLink href="/signin" size="sm">Set up family</ButtonLink>
        <button type="button" className="text-[14px] font-bold text-ink-3" onClick={() => setHidden(true)}>Not now</button>
      </div>
    </div>
  );
}
