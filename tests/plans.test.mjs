import test from "node:test";
import assert from "node:assert/strict";
import { PLANS, getPlan, planAllowsProvider, cheapestPlanFor, isPlanId, formatRupiah } from "../src/config/plans.ts";

test("Free only unlocks Gemini; Claude needs Pro", () => {
  assert.equal(planAllowsProvider("free", "google"), true);
  assert.equal(planAllowsProvider("free", "openai"), false);
  assert.equal(planAllowsProvider("starter", "openai"), true);
  assert.equal(planAllowsProvider("starter", "anthropic"), false);
  assert.equal(planAllowsProvider("pro", "anthropic"), true);
  assert.equal(cheapestPlanFor("anthropic")?.id, "pro");
  assert.equal(cheapestPlanFor("openai")?.id, "starter");
});

test("unknown plan ids fall back to Free, prototype keys are rejected", () => {
  assert.equal(getPlan("enterprise").id, "free");
  assert.equal(getPlan("__proto__").id, "free");
  assert.equal(isPlanId("constructor"), false);
});

test("purchasable plans have a price and growing quotas", () => {
  for (const plan of Object.values(PLANS)) {
    if (plan.purchasable) assert.ok(plan.priceIdr > 0);
  }
  assert.ok(PLANS.pro.quotas.chat > PLANS.starter.quotas.chat);
  assert.ok(PLANS.starter.quotas.ai_photo > PLANS.free.quotas.ai_photo);
  assert.match(formatRupiah(149000), /^Rp149.000$/);
});
