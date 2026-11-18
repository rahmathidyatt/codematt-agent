import "server-only";
import { ORDER_ID_PATTERN } from "@/lib/billing/midtrans-signature";

/**
 * Midtrans Snap (hosted payment page) for monthly prepaid plans.
 * Each payment buys 30 days; nothing is auto-debited. Sandbox is the default.
 */

export function isMidtransConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.MIDTRANS_SERVER_KEY?.trim());
}

function hosts(env: NodeJS.ProcessEnv = process.env) {
  const prod = env.MIDTRANS_IS_PRODUCTION === "true";
  return {
    snap: prod ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com",
    api: prod ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com",
  };
}

function authHeader(): string {
  const key = process.env.MIDTRANS_SERVER_KEY?.trim();
  if (!key) throw new Error("MIDTRANS_NOT_CONFIGURED");
  return "Basic " + Buffer.from(key + ":").toString("base64");
}

export async function createSnapTransaction(input: {
  orderId: string;
  amount: number;
  itemName: string;
  email: string | null;
  finishUrl: string;
}): Promise<{ token: string; redirectUrl: string }> {
  const response = await fetch(hosts().snap + "/snap/v1/transactions", {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      transaction_details: { order_id: input.orderId, gross_amount: input.amount },
      item_details: [{ id: input.orderId.slice(0, 50), price: input.amount, quantity: 1, name: input.itemName.slice(0, 50) }],
      ...(input.email ? { customer_details: { email: input.email } } : {}),
      callbacks: { finish: input.finishUrl },
      expiry: { unit: "hours", duration: 24 },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("MIDTRANS_FAILED");
  const data = (await response.json()) as { token?: unknown; redirect_url?: unknown };
  if (typeof data.token !== "string" || typeof data.redirect_url !== "string" ||
    !data.redirect_url.startsWith("https://")) throw new Error("MIDTRANS_FAILED");
  return { token: data.token, redirectUrl: data.redirect_url };
}

/** Second opinion from Midtrans itself; the webhook body alone is never trusted. */
export async function getTransactionStatus(orderId: string): Promise<{
  transaction_status?: unknown;
  fraud_status?: unknown;
  gross_amount?: unknown;
  transaction_id?: unknown;
  order_id?: unknown;
}> {
  if (!ORDER_ID_PATTERN.test(orderId)) throw new Error("INVALID_ORDER_ID");
  const response = await fetch(`${hosts().api}/v2/${encodeURIComponent(orderId)}/status`, {
    method: "GET",
    headers: { Authorization: authHeader(), Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("MIDTRANS_FAILED");
  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("MIDTRANS_FAILED");
  return data as Record<string, unknown>;
}
