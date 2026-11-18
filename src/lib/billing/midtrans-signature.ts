import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Pure Midtrans helpers (no "@/..." imports, unit-tested with node --test).
 * Notification signature = SHA512(order_id + status_code + gross_amount + server_key).
 */

export function midtransSignature(orderId: string, statusCode: string, grossAmount: string, serverKey: string): string {
  return createHash("sha512").update(orderId + statusCode + grossAmount + serverKey).digest("hex");
}

export function verifyMidtransSignature(
  payload: { order_id?: unknown; status_code?: unknown; gross_amount?: unknown; signature_key?: unknown },
  serverKey: string
): boolean {
  const { order_id, status_code, gross_amount, signature_key } = payload;
  if (typeof order_id !== "string" || typeof status_code !== "string" ||
    typeof gross_amount !== "string" || typeof signature_key !== "string") return false;
  if (!serverKey || !/^[a-f0-9]{128}$/i.test(signature_key)) return false;
  const expected = Buffer.from(midtransSignature(order_id, status_code, gross_amount, serverKey), "hex");
  const supplied = Buffer.from(signature_key.toLowerCase(), "hex");
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

/** "149000.00" → 149000. Rejects fractions of a rupiah and anything malformed. */
export function parseGrossAmount(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d{1,12}(\.00?)?$/.test(value)) return null;
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

export type PaymentOutcome = "paid" | "failed" | "pending" | "ignore";

/**
 * Maps a Midtrans transaction status to what we do with the order.
 * Card "capture" counts only when fraud_status is "accept".
 */
export function classifyMidtransStatus(transactionStatus: unknown, fraudStatus: unknown): PaymentOutcome {
  switch (transactionStatus) {
    case "settlement":
      return "paid";
    case "capture":
      return fraudStatus === "accept" ? "paid" : "pending";
    case "pending":
    case "authorize":
      return "pending";
    case "deny":
    case "cancel":
    case "expire":
    case "failure":
      return "failed";
    default:
      return "ignore";
  }
}

export const ORDER_ID_PATTERN = /^CM-[A-Z0-9-]{8,60}$/;

export function newOrderId(planId: string, random: string): string {
  return `CM-${planId.toUpperCase()}-${random.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 24)}`;
}
