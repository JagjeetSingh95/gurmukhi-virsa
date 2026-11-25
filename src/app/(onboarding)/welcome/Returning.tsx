"use client";
// Returning visitors skip Welcome: adult guest → Paath · signed-in family → profile picker.
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { nextRoute, useAuth } from "@/lib/auth";
import { local } from "@/lib/local";

export function Returning() {
  const router = useRouter();
  const { ready, session, profile } = useAuth();
  useEffect(() => {
    if (!ready) return;
    if (session) router.replace(nextRoute(profile));
    else if (local.mode() === "adult") router.replace("/paath");
  }, [ready, session, profile, router]);
  return null;
}
