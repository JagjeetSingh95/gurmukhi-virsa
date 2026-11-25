"use client";
// N.8.1 Entitlement: one place that answers "is this family on Family?" for every lock.
// Truth = profiles.plan / trial_ends_at (set only server-side; N.8.2 billing webhook will write them).
// Until billing is live a MOCK layer (device-local) can override it on dev + preview builds so
// the paywall, trial and locks can be tested end to end. Production ignores the mock.
import { useAuth } from "@/lib/auth";
import { resolveEntitlement, type Entitlement, type MockPlan } from "@/lib/plan";
import { useLocal } from "@/lib/useLocal";

export * from "@/lib/plan";

const MOCK_KEY = "gv.mockPlan";

/** Mock billing is allowed outside production builds, or on previews with NEXT_PUBLIC_BILLING_MOCK=1. */
export const mockAllowed = () => process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_BILLING_MOCK === "1";

export function readMock(): MockPlan {
  if (!mockAllowed()) return null;
  try {
    // Legacy dev flag from N.5–N.7 QA.
    if (localStorage.getItem("gv.devFamily") === "1") return { tier: "family" };
    const s = localStorage.getItem(MOCK_KEY);
    return s ? (JSON.parse(s) as MockPlan) : null;
  } catch {
    return null;
  }
}

export function writeMock(m: MockPlan) {
  try {
    if (m) localStorage.setItem(MOCK_KEY, JSON.stringify(m));
    else {
      localStorage.removeItem(MOCK_KEY);
      localStorage.removeItem("gv.devFamily");
    }
    window.dispatchEvent(new Event("gv-local"));
  } catch {}
}

export function useEntitlement(): Entitlement {
  const { profile } = useAuth();
  const mock = useLocal<MockPlan>(readMock, null);
  return resolveEntitlement(profile, mock);
}

/** Family plan check (plan = family, or trial still running). Shared by Learn, Culture and Parent locks. */
export function useIsFamily() {
  return useEntitlement().isFamily;
}

export const tierLabel = (e: Entitlement) =>
  e.tier === "family" ? "Family" : e.tier === "trial" ? `Trial · ${e.trialDaysLeft} day${e.trialDaysLeft === 1 ? "" : "s"} left` : "Free";

/** Where every "See plans" goes (in-app paywall, behind the parent gate). `from` = page to return to. */
export const plansHref = (from?: string) => (from ? `/parent/plans?from=${encodeURIComponent(from)}` : "/parent/plans");
