import test from "node:test";
import assert from "node:assert/strict";
import {
  generateIdempotencyKey,
  isIdempotencyKeyDuplicate,
  calculateUsagePercentage,
  reconcileLedgerDelta,
  getTierLimits,
} from "../src/features/ledger/ledger-utils.ts";

test("generateIdempotencyKey produces distinct unique keys with service prefix", () => {
  const key1 = generateIdempotencyKey("ai_task");
  const key2 = generateIdempotencyKey("ai_task");
  assert.ok(key1.startsWith("idemp_ai_task_"));
  assert.notEqual(key1, key2);
});

test("isIdempotencyKeyDuplicate accurately flags duplicates", () => {
  const entries = [
    {
      id: "1",
      idempotencyKey: "key-123",
      timestamp: "2026-10-28T00:00:00Z",
      action: "RESERVE",
      service: "AI_GENERATION",
      units: 1,
      status: "COMMITTED",
      balanceAfter: 10,
      note: "test",
    },
  ];

  assert.equal(isIdempotencyKeyDuplicate(entries, "key-123"), true);
  assert.equal(isIdempotencyKeyDuplicate(entries, "key-456"), false);
});

test("calculateUsagePercentage clamps between 0 and 100", () => {
  assert.equal(calculateUsagePercentage(25, 100), 25);
  assert.equal(calculateUsagePercentage(150, 100), 100);
  assert.equal(calculateUsagePercentage(-5, 100), 0);
  assert.equal(calculateUsagePercentage(0, 0), 0);
});

test("reconcileLedgerDelta accounts for commits and refunds without leaks", () => {
  const entries = [
    {
      id: "1",
      idempotencyKey: "k1",
      timestamp: "",
      action: "COMMIT",
      service: "AI_GENERATION",
      units: 5,
      status: "COMMITTED",
      balanceAfter: 5,
      note: "",
    },
    {
      id: "2",
      idempotencyKey: "k2",
      timestamp: "",
      action: "COMMIT",
      service: "FLYER_EXPORT",
      units: 2,
      status: "COMMITTED",
      balanceAfter: 7,
      note: "",
    },
    {
      id: "3",
      idempotencyKey: "k3",
      timestamp: "",
      action: "REFUND",
      service: "AI_GENERATION",
      units: 1,
      status: "REFUNDED",
      balanceAfter: 6,
      note: "network abort",
    },
  ];

  const delta = reconcileLedgerDelta(entries);
  assert.equal(delta.totalCommittedUnits, 7);
  assert.equal(delta.totalRefundedUnits, 1);
  assert.equal(delta.netUnitsUsed, 6);
});

test("getTierLimits returns correct quotas per tier", () => {
  const freeLimits = getTierLimits("free");
  assert.equal(freeLimits.aiRequestsLimit, 25);
  assert.equal(freeLimits.flyerExportsLimit, 5);

  const proLimits = getTierLimits("pro");
  assert.equal(proLimits.aiRequestsLimit, 500);
  assert.equal(proLimits.flyerExportsLimit, 200);
});
