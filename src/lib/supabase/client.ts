"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const hasSupabase = Boolean(url && key);

let client: SupabaseClient<Database> | null = null;
/** Browser client (session in cookies). All data access is protected by RLS. */
export function supabase(): SupabaseClient<Database> {
  if (!hasSupabase) throw new Error("Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY).");
  client ??= createBrowserClient<Database>(url!, key!);
  return client;
}

export function siteOrigin() {
  return typeof window !== "undefined" ? window.location.origin : (process.env.SITE_URL ?? "http://localhost:3000");
}

/** Map Supabase / Postgres errors to friendly copy. */
export function friendlyError(e: unknown): string {
  const msg = (e as { message?: string; code?: string })?.message ?? String(e);
  if (/CHILD_LIMIT/.test(msg)) return "You've reached the child limit for your plan. Family allows up to 5 children.";
  if (/LOCKED/.test(msg)) return "This lesson is part of the Family plan.";
  if (/rate limit|too many|over_email_send_rate_limit/i.test(msg)) return "Too many emails sent. Please wait a minute and try again.";
  if (/expired|invalid.*(otp|token)|otp_expired/i.test(msg)) return "That code or link has expired or was already used.";
  if (/Failed to fetch|NetworkError/i.test(msg)) return "You seem to be offline. Check your connection and try again.";
  return "Something went wrong. Please try again.";
}
