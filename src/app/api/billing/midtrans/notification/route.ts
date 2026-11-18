import { NextRequest, NextResponse } from "next/server";
import { adminRpc, getAdminDbConfig } from "@/lib/db/admin";
import { getTransactionStatus, isMidtransConfigured } from "@/lib/billing/midtrans";
import {
  classifyMidtransStatus,
  ORDER_ID_PATTERN,
  parseGrossAmount,
  verifyMidtransSignature,
} from "@/lib/billing/midtrans-signature";
import { readBoundedJson } from "@/lib/security/ai-request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function reply(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * Midtrans HTTP notification (set as Payment Notification URL in the Midtrans dashboard).
 * 1. verify SHA512 signature with the server key
 * 2. re-read the status from the Midtrans Status API (source of truth)
 * 3. activate / extend the plan through an idempotent SECURITY DEFINER RPC that
 *    also checks the paid amount equals the stored order amount.
 * Non-2xx makes Midtrans retry, so DB failures return 500 on purpose.
 */
export async function POST(req: NextRequest) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim();
  if (!serverKey || !isMidtransConfigured() || !getAdminDbConfig()) return reply({ ok: false }, 503);

  const incoming = await readBoundedJson(req);
  if (!incoming.ok) return reply({ ok: false }, incoming.status);
  if (!verifyMidtransSignature(incoming.body, serverKey)) return reply({ ok: false, code: "BAD_SIGNATURE" }, 403);

  const orderId = String(incoming.body.order_id);
  // Orders from other apps sharing the same merchant account are acknowledged and ignored.
  if (!ORDER_ID_PATTERN.test(orderId)) return reply({ ok: true, ignored: true });

  let status;
  try {
    status = await getTransactionStatus(orderId);
  } catch {
    return reply({ ok: false, code: "STATUS_CHECK_FAILED" }, 502);
  }
  if (status.order_id !== orderId) return reply({ ok: false, code: "STATUS_MISMATCH" }, 502);

  const outcome = classifyMidtransStatus(status.transaction_status, status.fraud_status);
  try {
    if (outcome === "paid") {
      const amount = parseGrossAmount(status.gross_amount);
      if (amount === null) return reply({ ok: false, code: "BAD_AMOUNT" }, 400);
      await adminRpc("codematt_mark_order_paid", {
        p_order_id: orderId,
        p_amount: amount,
        p_transaction_id: typeof status.transaction_id === "string" ? status.transaction_id.slice(0, 80) : null,
      });
    } else if (outcome === "failed") {
      await adminRpc("codematt_mark_order_failed", { p_order_id: orderId });
    }
  } catch {
    return reply({ ok: false, code: "DB_FAILED" }, 500);
  }
  return reply({ ok: true, outcome });
}
