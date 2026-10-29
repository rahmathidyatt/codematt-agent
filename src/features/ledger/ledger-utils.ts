import type { PlanTierId, LedgerEntry } from "./contracts.ts";
import { PLAN_CONFIGS } from "./contracts.ts";

export function generateIdempotencyKey(service: string, userId: string = "usr"): string {
  const nonce = Math.random().toString(36).substring(2, 9);
  return `idemp_${service}_${userId}_${Date.now()}_${nonce}`;
}

export function isIdempotencyKeyDuplicate(existingEntries: LedgerEntry[], key: string): boolean {
  return existingEntries.some((e) => e.idempotencyKey === key);
}

export function calculateUsagePercentage(used: number, limit: number): number {
  if (limit <= 0) return 0;
  const pct = Math.round((used / limit) * 100);
  return Math.min(100, Math.max(0, pct));
}

export function reconcileLedgerDelta(entries: LedgerEntry[]): {
  totalCommittedUnits: number;
  totalRefundedUnits: number;
  netUnitsUsed: number;
} {
  let committed = 0;
  let refunded = 0;

  for (const entry of entries) {
    if (entry.status === "COMMITTED") {
      committed += entry.units;
    } else if (entry.status === "REFUNDED") {
      refunded += entry.units;
    }
  }

  return {
    totalCommittedUnits: committed,
    totalRefundedUnits: refunded,
    netUnitsUsed: Math.max(0, committed - refunded),
  };
}

export function getTierLimits(tierId: PlanTierId) {
  const config = PLAN_CONFIGS[tierId] || PLAN_CONFIGS.starter;
  return {
    aiRequestsLimit: config.aiLimit,
    flyerExportsLimit: config.flyerLimit,
    storageBytesLimit: config.storageMb * 1024 * 1024,
  };
}
