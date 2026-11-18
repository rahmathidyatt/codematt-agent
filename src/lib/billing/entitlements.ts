import "server-only";
import { getPlan, isPlanId, type PlanDefinition, type ProviderId, type QuotaMetric } from "@/config/plans";
import { adminGetSubscription, adminRpc, AdminDbError } from "@/lib/db/admin";

export interface ActivePlan {
  plan: PlanDefinition;
  /** ISO timestamp; null for Free. */
  periodEnd: string | null;
}

/** Resolves the effective plan. Any expired / unknown row falls back to Free. */
export async function getActivePlan(userId: string, now: Date = new Date()): Promise<ActivePlan> {
  const row = await adminGetSubscription(userId);
  if (!row || typeof row !== "object") return { plan: getPlan("free"), periodEnd: null };
  const sub = row as { plan_id?: unknown; status?: unknown; current_period_end?: unknown };
  const end = typeof sub.current_period_end === "string" ? new Date(sub.current_period_end) : null;
  if (sub.status !== "active" || !isPlanId(sub.plan_id) || !end || Number.isNaN(end.getTime()) || end <= now) {
    return { plan: getPlan("free"), periodEnd: null };
  }
  return { plan: getPlan(sub.plan_id), periodEnd: end.toISOString() };
}

export type QuotaResult =
  | { allowed: true; used: number; limit: number }
  | { allowed: false; used: number; limit: number };

/**
 * Atomically records one unit of usage unless the monthly limit is reached.
 * Idempotent per (user, idempotencyKey): retries of the same request never
 * count twice. Enforcement happens inside Postgres (advisory lock + count).
 */
export async function consumeQuota(
  userId: string,
  metric: QuotaMetric,
  limit: number,
  idempotencyKey: string,
  provider: ProviderId | null
): Promise<QuotaResult> {
  const out = await adminRpc("codematt_consume_quota", {
    p_user: userId,
    p_metric: metric,
    p_limit: limit,
    p_key: idempotencyKey,
    p_provider: provider,
  });
  if (!out || typeof out !== "object") throw new AdminDbError("DB_FAILED");
  const res = out as { allowed?: unknown; used?: unknown; limit?: unknown };
  const used = typeof res.used === "number" ? res.used : 0;
  return res.allowed === true
    ? { allowed: true, used, limit }
    : { allowed: false, used, limit };
}

/** Gives the unit back when the provider call failed, so users are not charged. */
export async function refundQuota(userId: string, idempotencyKey: string): Promise<void> {
  try {
    await adminRpc("codematt_refund_quota", { p_user: userId, p_key: idempotencyKey });
  } catch {
    // Best effort: a failed refund over-counts by one, it never under-counts.
  }
}

export async function getUsageSummary(userId: string): Promise<Record<QuotaMetric, number>> {
  const out = await adminRpc("codematt_usage_summary", { p_user: userId });
  const res = (out && typeof out === "object" ? out : {}) as Record<string, unknown>;
  return {
    chat: typeof res.chat === "number" ? res.chat : 0,
    ai_photo: typeof res.ai_photo === "number" ? res.ai_photo : 0,
  };
}

const KEY = /^[A-Za-z0-9_-]{16,80}$/;
export function validIdempotencyKey(value: unknown): value is string {
  return typeof value === "string" && KEY.test(value);
}
