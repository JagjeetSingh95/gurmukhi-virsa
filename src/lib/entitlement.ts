"use client";
// Family plan check (plan = family, or trial still running). Shared by Learn and Culture locks.
import { useAuth } from "@/lib/auth";

export function useIsFamily() {
  const { profile } = useAuth();
  // Dev-only override (localStorage gv.devFamily = "1") to QA Family screens; ignored in production builds.
  const devFamily = process.env.NODE_ENV !== "production" && typeof window !== "undefined" && localStorage.getItem("gv.devFamily") === "1";
  return devFamily || (!!profile && (profile.plan === "family" || (!!profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date())));
}
