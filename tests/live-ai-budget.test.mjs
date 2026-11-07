import assert from "node:assert/strict";
import test from "node:test";
import { reserveLiveAiCalls } from "../src/lib/security/live-ai-budget.ts";

test("live budget fails closed without a validated per-process ceiling", () => {
  for (const raw of [undefined, "", "0", "101", "-1", "1.5", "Infinity", "9999", "a"]) {
    const result = reserveLiveAiCalls(1, { CODEMATT_LIVE_AI_MAX_CALLS_PER_INSTANCE: raw });
    assert.equal(result.ok, false, String(raw));
    assert.equal(result.code, "LIVE_AI_BUDGET_NOT_CONFIGURED");
  }
});
test("live budget counts comparison calls in advance and cannot be overdrawn", () => {
  const env = { CODEMATT_LIVE_AI_MAX_CALLS_PER_INSTANCE: "3" };
  const first = reserveLiveAiCalls(2, env);
  assert.equal(first.ok, true);
  assert.equal(first.remainingCalls, 1);
  const second = reserveLiveAiCalls(2, env);
  assert.equal(second.ok, false);
  assert.equal(second.code, "LIVE_AI_INSTANCE_BUDGET_EXHAUSTED");
  const third = reserveLiveAiCalls(1, env);
  assert.equal(third.ok, true);
  assert.equal(third.remainingCalls, 0);
  assert.equal(reserveLiveAiCalls(1, env).ok, false);
});
test("live budget rejects zero, negative and excessive reservations", () => {
  const env = { CODEMATT_LIVE_AI_MAX_CALLS_PER_INSTANCE: "4" };
  for (const count of [0, -1, 3, 2.2, Infinity]) {
    assert.equal(reserveLiveAiCalls(count, env).ok, false);
  }
});
