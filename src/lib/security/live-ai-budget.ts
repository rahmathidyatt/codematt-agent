/**
 * Conservative per-process ceiling for live AI calls. No expiration or refund:
 * an attempted upstream call consumes one reservation even if the provider fails.
 *
 * A serverless platform can launch more than one process, so this limit is NOT
 * a replacement for centrally persisted quotas or provider spending limits.
 * Never present this mechanism as production-wide billing enforcement.
 */
let attemptedCalls = 0;

export type LiveAiBudgetResult =
  | { ok: true; reservedCalls: number; remainingCalls: number }
  | { ok: false; status: 503 | 429; code: "LIVE_AI_BUDGET_NOT_CONFIGURED" | "LIVE_AI_INSTANCE_BUDGET_EXHAUSTED" };

export function reserveLiveAiCalls(
  count: number,
  env: NodeJS.ProcessEnv = process.env
): LiveAiBudgetResult {
  const raw = env.CODEMATT_LIVE_AI_MAX_CALLS_PER_INSTANCE;
  // Explicitly demand a small integer. No implicit infinite budget.
  if (!raw || !/^[1-9][0-9]{0,2}$/.test(raw) || Number(raw) > 100) {
    return { ok: false, status: 503, code: "LIVE_AI_BUDGET_NOT_CONFIGURED" };
  }
  if (!Number.isSafeInteger(count) || count < 1 || count > 2) {
    return { ok: false, status: 503, code: "LIVE_AI_BUDGET_NOT_CONFIGURED" };
  }
  const max = Number(raw);
  if (attemptedCalls + count > max) {
    return { ok: false, status: 429, code: "LIVE_AI_INSTANCE_BUDGET_EXHAUSTED" };
  }
  // JS event loop updates this synchronously, before awaiting provider calls.
  attemptedCalls += count;
  return { ok: true, reservedCalls: count, remainingCalls: max - attemptedCalls };
}
