"use client";
// N.9.5: supabase-js (~70 KB) is loaded on demand — guests reading Paath never download it.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const hasSupabase = Boolean(url && key);

let client: SupabaseClient<Database> | null = null;
let loading: Promise<SupabaseClient<Database>> | null = null;

/** Load + create the browser client (session in cookies). All data access is protected by RLS. */
export function loadSupabase(): Promise<SupabaseClient<Database>> {
  if (!hasSupabase) return Promise.reject(new Error("Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY)."));
  if (client) return Promise.resolve(client);
  loading ??= import("@supabase/ssr").then((m) => (client = m.createBrowserClient<Database>(url!, key!)));
  return loading;
}

/** Sync access once loaded. AuthProvider loads it whenever there is (or may soon be) a session;
 *  code that can run without a session (contact form, join) must `await loadSupabase()` instead. */
export function supabase(): SupabaseClient<Database> {
  if (!client) throw new Error("Supabase client not loaded yet — call loadSupabase() first.");
  return client;
}

/** A Supabase auth cookie exists → this device has (or had) a parent session. */
export const hasAuthCookie = () => typeof document !== "undefined" && /(?:^|;\s*)sb-[^=]+-auth-token/.test(document.cookie);

/** Public site URL used for sign-in / email redirects (always the deployed site, even from localhost). */
export function siteOrigin() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://gurmukhi-virsa.sjagjeet528.workers.dev").replace(/\/$/, "");
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
