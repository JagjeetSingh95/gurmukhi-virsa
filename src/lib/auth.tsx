"use client";
// Parent session + profile + children. Adult guests never sign in.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { hasAuthCookie, hasSupabase, loadSupabase, supabase } from "@/lib/supabase/client";
import type { Child, Json, Profile } from "@/lib/supabase/types";
import { local } from "@/lib/local";

type AuthState = {
  ready: boolean;
  configured: boolean;
  session: Session | null;
  profile: Profile | null;
  kids: Child[];
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

// pin_hash is not readable by clients (column grant); has_pin is.
const PROFILE_COLS =
  "id,email,consent_at,has_pin,pin_failed_count,pin_locked_until,plan,trial_ends_at,weekly_email,setup_done,created_at,weekly_day,reminder_on,reminder_hour,timezone,gurpurab_reminders";

const Ctx = createContext<AuthState | null>(null);

/** `eager`: load Supabase even without a session cookie (sign-in / onboarding screens). */
export function AuthProvider({ children, eager = false }: { children: ReactNode; eager?: boolean }) {
  const [ready, setReady] = useState(!hasSupabase);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [kids, setKids] = useState<Child[]>([]);

  const load = useCallback(async (s: Session | null) => {
    if (!s) {
      setProfile(null);
      setKids([]);
      return;
    }
    const sb = supabase();
    const [p, c] = await Promise.all([
      sb.from("profiles").select(PROFILE_COLS).eq("id", s.user.id).maybeSingle(),
      sb.from("children").select("*").order("created_at"),
    ]);
    const prof = (p.data as Profile) ?? null;
    setProfile(prof);
    local.setPlan(prof ? { plan: prof.plan, trial_ends_at: prof.trial_ends_at } : null);
    setKids((c.data as Child[]) ?? []);
  }, []);

  useEffect(() => {
    if (!hasSupabase) return;
    // Guests (no auth cookie) never need Supabase on app screens: skip the download entirely (N.9.5).
    if (!eager && !hasAuthCookie()) {
      setReady(true); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    let alive = true;
    let unsub = () => {};
    loadSupabase().then((sb) => {
      if (!alive) return;
      sb.auth.getSession().then(async ({ data }) => {
        if (!alive) return;
        setSession(data.session);
        await load(data.session);
        setReady(true);
      });
      const { data: sub } = sb.auth.onAuthStateChange((event, s) => {
        setSession(s);
        // Defer DB calls out of the auth callback (supabase-js recommendation).
        setTimeout(async () => {
          if (event === "SIGNED_IN" && s) {
            const bookmarks = local.guestBookmarks();
            const settings = local.guestSettings();
            if (bookmarks.length || settings) {
              const { error } = await sb.rpc("merge_guest", {
                p_bookmarks: bookmarks as unknown as Json,
                p_settings: (settings ?? undefined) as Json | undefined,
              });
              if (!error) local.clearGuest();
            }
            local.setMode("family");
          }
          await load(s);
        }, 0);
      });
      unsub = () => sub.subscription.unsubscribe();
    });
    return () => {
      alive = false;
      unsub();
    };
  }, [load, eager]);

  const value = useMemo<AuthState>(
    () => ({
      ready,
      configured: hasSupabase,
      session,
      profile,
      kids,
      refresh: () => load(session),
      signOut: async () => {
        await (await loadSupabase()).auth.signOut();
        local.setActiveChild(null);
        local.setPlan(null);
        local.setMode(null); // deliberate sign-out ≠ "session expired" banner (N.9.3)
        local.closeGate();
      },
    }),
    [ready, session, profile, kids, load],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be inside <AuthProvider>");
  return v;
}

/** Where a signed-in parent should go next. */
export function nextRoute(profile: Profile | null) {
  if (!profile || !profile.setup_done) return "/setup";
  return "/profiles";
}
