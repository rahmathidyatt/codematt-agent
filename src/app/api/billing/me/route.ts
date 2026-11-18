import { NextRequest, NextResponse } from "next/server";
import { getVerifiedIdentity } from "@/lib/auth/server";
import { getAdminDbConfig } from "@/lib/db/admin";
import { getActivePlan, getUsageSummary } from "@/lib/billing/entitlements";
import { isLiveAiEnabled } from "@/lib/security/ai-request";
import { isMidtransConfigured } from "@/lib/billing/midtrans";
import { NO_STORE } from "@/lib/billing/gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** What the UI needs to show plan, remaining quota and locked providers. */
export async function GET(req: NextRequest) {
  const flags = {
    liveAi: isLiveAiEnabled(),
    billing: Boolean(getAdminDbConfig()),
    checkout: isMidtransConfigured(),
  };
  if (!flags.billing) {
    return NextResponse.json({ ok: true, mode: "demo", flags, planId: "free", usage: null }, { headers: NO_STORE });
  }
  const identity = await getVerifiedIdentity(req);
  if (!identity.ok) {
    return NextResponse.json({ ok: false, code: identity.code, flags }, { status: identity.status, headers: NO_STORE });
  }
  try {
    const [active, usage] = await Promise.all([getActivePlan(identity.id), getUsageSummary(identity.id)]);
    return NextResponse.json({
      ok: true,
      mode: "live",
      flags,
      planId: active.plan.id,
      periodEnd: active.periodEnd,
      usage,
      limits: active.plan.quotas,
      providers: active.plan.providers,
    }, { headers: NO_STORE });
  } catch {
    return NextResponse.json({ ok: false, code: "BILLING_UNAVAILABLE", flags }, { status: 503, headers: NO_STORE });
  }
}
