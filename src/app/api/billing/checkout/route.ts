import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PLANS } from "@/config/plans";
import { getTrustedAppOrigin, isSameOriginMutation } from "@/lib/auth/core";
import { getVerifiedIdentity } from "@/lib/auth/server";
import { adminRpc, getAdminDbConfig } from "@/lib/db/admin";
import { createSnapTransaction, isMidtransConfigured } from "@/lib/billing/midtrans";
import { newOrderId } from "@/lib/billing/midtrans-signature";
import { readBoundedJson } from "@/lib/security/ai-request";
import { NO_STORE } from "@/lib/billing/gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ planId: z.enum(["starter", "pro"]) }).strict();

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

/** Creates a pending order and returns the Midtrans Snap payment page URL. */
export async function POST(req: NextRequest) {
  if (!isSameOriginMutation(req)) return json({ ok: false, code: "ORIGIN_REJECTED" }, 403);
  const origin = getTrustedAppOrigin();
  if (!getAdminDbConfig() || !isMidtransConfigured() || !origin) {
    return json({ ok: false, code: "CHECKOUT_NOT_CONFIGURED" }, 503);
  }
  const identity = await getVerifiedIdentity(req);
  if (!identity.ok) return json({ ok: false, code: identity.code }, identity.status);

  const incoming = await readBoundedJson(req);
  if (!incoming.ok) return json({ ok: false, code: incoming.error }, incoming.status);
  const parsed = schema.safeParse(incoming.body);
  if (!parsed.success) return json({ ok: false, code: "INVALID_REQUEST" }, 400);

  // Price comes from server config only, never from the browser.
  const plan = PLANS[parsed.data.planId];
  const orderId = newOrderId(plan.id, randomBytes(12).toString("hex"));

  try {
    await adminRpc("codematt_create_order", {
      p_order_id: orderId,
      p_user: identity.id,
      p_plan: plan.id,
      p_amount: plan.priceIdr,
    });
  } catch {
    return json({ ok: false, code: "BILLING_UNAVAILABLE" }, 503);
  }

  try {
    const snap = await createSnapTransaction({
      orderId,
      amount: plan.priceIdr,
      itemName: `Codematt ${plan.name} 30 hari`,
      email: identity.email,
      finishUrl: `${origin}/pricing?order=${encodeURIComponent(orderId)}`,
    });
    return json({ ok: true, orderId, redirectUrl: snap.redirectUrl });
  } catch {
    try {
      await adminRpc("codematt_mark_order_failed", { p_order_id: orderId });
    } catch {
      // Order stays pending and simply expires; it can never activate a plan without a verified payment.
    }
    return json({ ok: false, code: "PAYMENT_GATEWAY_FAILED" }, 502);
  }
}
