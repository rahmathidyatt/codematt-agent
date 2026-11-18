import "server-only";
import type { NextRequest } from "next/server";
import { isSameOriginMutation } from "@/lib/auth/core";
import { getVerifiedIdentity } from "@/lib/auth/server";
import { getAdminDbConfig } from "@/lib/db/admin";
import { getActivePlan, type ActivePlan } from "@/lib/billing/entitlements";
import { isLiveAiEnabled } from "@/lib/security/ai-request";

export type GateResult =
  | { mode: "demo" }
  | { mode: "live"; userId: string; email: string | null; active: ActivePlan }
  | { mode: "error"; status: number; code: string };

/**
 * Shared entry check for paid AI routes.
 * - Live AI off        → demo mode (no provider call, no charge).
 * - Live AI on         → requires same-origin request, a verified Supabase
 *                        user and the admin DB for quota enforcement. It fails
 *                        closed if any of those is missing.
 */
export async function gatePaidRequest(req: NextRequest): Promise<GateResult> {
  if (!isSameOriginMutation(req)) return { mode: "error", status: 403, code: "ORIGIN_REJECTED" };
  if (!isLiveAiEnabled()) return { mode: "demo" };
  if (!getAdminDbConfig()) return { mode: "error", status: 503, code: "BILLING_NOT_CONFIGURED" };
  const identity = await getVerifiedIdentity(req);
  if (!identity.ok) return { mode: "error", status: identity.status, code: identity.code };
  try {
    const active = await getActivePlan(identity.id);
    return { mode: "live", userId: identity.id, email: identity.email, active };
  } catch {
    return { mode: "error", status: 503, code: "BILLING_UNAVAILABLE" };
  }
}

export const NO_STORE = { "Cache-Control": "no-store, private" } as const;
