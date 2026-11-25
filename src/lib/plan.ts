// N.8.1 Pure plan logic (no imports) — shared by entitlement hooks and node tests.
export type Tier = "free" | "trial" | "family";
export type Entitlement = { tier: Tier; isFamily: boolean; trialDaysLeft: number; trialEndsAt: string | null; mock: boolean };
export type MockPlan = { tier: "trial" | "family"; trialEndsAt?: string } | null;

export const TRIAL_DAYS = 7;
export const TRIAL_REMINDER_DAY = 5;

const daysLeft = (iso: string | null | undefined, now: number) => (iso ? Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 86_400_000)) : 0);

/** Pure: profile + mock → entitlement. Exported for tests. */
export function resolveEntitlement(
  profile: { plan: "free" | "family"; trial_ends_at: string | null } | null,
  mock: MockPlan,
  nowMs?: number,
): Entitlement {
  // Read the clock only when a trial date must be checked (prerender forbids Date.now() otherwise).
  const now = () => nowMs ?? Date.now();
  if (mock?.tier === "family") return { tier: "family", isFamily: true, trialDaysLeft: 0, trialEndsAt: null, mock: true };
  if (mock?.tier === "trial" && mock.trialEndsAt && new Date(mock.trialEndsAt).getTime() > now())
    return { tier: "trial", isFamily: true, trialDaysLeft: daysLeft(mock.trialEndsAt, now()), trialEndsAt: mock.trialEndsAt, mock: true };
  if (profile?.plan === "family") return { tier: "family", isFamily: true, trialDaysLeft: 0, trialEndsAt: null, mock: false };
  if (profile?.trial_ends_at && new Date(profile.trial_ends_at).getTime() > now())
    return { tier: "trial", isFamily: true, trialDaysLeft: daysLeft(profile.trial_ends_at, now()), trialEndsAt: profile.trial_ends_at, mock: false };
  return { tier: "free", isFamily: false, trialDaysLeft: 0, trialEndsAt: null, mock: false };
}

