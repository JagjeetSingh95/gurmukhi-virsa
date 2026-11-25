// N.8.1 entitlement resolution (pure). Run: npm test
import assert from "node:assert/strict";
import { resolveEntitlement } from "../src/lib/plan.ts";

const now = Date.parse("2026-11-25T12:00:00Z");
const day = 86_400_000;
const iso = (ms: number) => new Date(ms).toISOString();
const free = { plan: "free" as const, trial_ends_at: null };

assert.equal(resolveEntitlement(null, null, now).tier, "free");
assert.equal(resolveEntitlement(free, null, now).isFamily, false);
assert.equal(resolveEntitlement({ plan: "family", trial_ends_at: null }, null, now).tier, "family");
const t = resolveEntitlement({ plan: "free", trial_ends_at: iso(now + 2.5 * day) }, null, now);
assert.equal(t.tier, "trial");
assert.equal(t.trialDaysLeft, 3);
assert.equal(resolveEntitlement({ plan: "free", trial_ends_at: iso(now - 1) }, null, now).tier, "free");
// mock overrides
assert.equal(resolveEntitlement(free, { tier: "family" }, now).isFamily, true);
assert.equal(resolveEntitlement(free, { tier: "trial", trialEndsAt: iso(now + 7 * day) }, now).trialDaysLeft, 7);
assert.equal(resolveEntitlement(free, { tier: "trial", trialEndsAt: iso(now - 1) }, now).tier, "free");
console.log("entitlement tests passed");
