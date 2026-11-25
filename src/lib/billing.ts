"use client";
// N.8.1 Billing adapter. The paywall only talks to this interface; N.8.2 swaps the mock for the
// real provider (decision open) without touching UI. Prices stay placeholders until [PRICE] is set.
import { TRIAL_DAYS, mockAllowed, writeMock } from "@/lib/entitlement";

export type Cycle = "monthly" | "yearly";
export type BillingResult = { ok: true } | { ok: false; reason: "not_live" | "error"; message: string };

export interface BillingProvider {
  /** Shown on the paywall (null = price not decided yet). */
  price(cycle: Cycle): string | null;
  startTrial(cycle: Cycle): Promise<BillingResult>;
  subscribe(cycle: Cycle): Promise<BillingResult>;
  /** Manage / cancel. */
  manage(): Promise<BillingResult>;
  cancel(): Promise<BillingResult>;
  live: boolean;
}

const NOT_LIVE: BillingResult = { ok: false, reason: "not_live", message: "Payments aren't live yet. Family is coming soon — Paath stays free for everyone." };

const mockProvider: BillingProvider = {
  live: true,
  price: () => null,
  async startTrial() {
    writeMock({ tier: "trial", trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 86_400_000).toISOString() });
    return { ok: true };
  },
  async subscribe() {
    writeMock({ tier: "family" });
    return { ok: true };
  },
  async manage() {
    return { ok: true };
  },
  async cancel() {
    writeMock(null);
    return { ok: true };
  },
};

const unavailable: BillingProvider = {
  live: false,
  price: () => null,
  startTrial: async () => NOT_LIVE,
  subscribe: async () => NOT_LIVE,
  manage: async () => NOT_LIVE,
  cancel: async () => NOT_LIVE,
};

export const billing = (): BillingProvider => (mockAllowed() ? mockProvider : unavailable);
