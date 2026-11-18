import "server-only";
import { getAuthBackendConfig } from "@/lib/auth/core";

/**
 * Minimal server-only PostgREST client that uses the Supabase SECRET key.
 * It bypasses RLS, so it is used ONLY for:
 *   - SECURITY DEFINER RPCs that enforce quotas and activate subscriptions
 *   - reading the caller's own subscription row after the user id has been
 *     verified with Supabase Auth (never from a client-supplied id).
 * The secret key must never be exposed with a NEXT_PUBLIC_ prefix.
 */

export interface AdminDbConfig {
  url: string;
  secretKey: string;
}

export function getAdminDbConfig(env: NodeJS.ProcessEnv = process.env): AdminDbConfig | null {
  const backend = getAuthBackendConfig(env);
  if (!backend) return null;
  const secretKey = env.CODEMATT_SUPABASE_SECRET_KEY?.trim();
  if (!secretKey || !secretKey.startsWith("sb_secret_") || secretKey.length < 30) return null;
  return { url: backend.url, secretKey };
}

export class AdminDbError extends Error {
  constructor(public readonly code: "DB_NOT_CONFIGURED" | "DB_FAILED") {
    super(code);
  }
}

async function request(path: string, init: { method: "GET" | "POST"; body?: unknown }): Promise<unknown> {
  const config = getAdminDbConfig();
  if (!config) throw new AdminDbError("DB_NOT_CONFIGURED");
  let response: Response;
  try {
    response = await fetch(config.url + path, {
      method: init.method,
      headers: {
        apikey: config.secretKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    throw new AdminDbError("DB_FAILED");
  }
  if (!response.ok) throw new AdminDbError("DB_FAILED");
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new AdminDbError("DB_FAILED");
  }
}

const RPC_NAME = /^codematt_[a-z_]{3,60}$/;

export function adminRpc(name: string, args: Record<string, unknown>): Promise<unknown> {
  if (!RPC_NAME.test(name)) throw new AdminDbError("DB_FAILED");
  return request(`/rest/v1/rpc/${name}`, { method: "POST", body: args });
}

const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

/** Reads one subscription row for an already-verified user id. */
export async function adminGetSubscription(userId: string): Promise<unknown> {
  if (!UUID.test(userId)) throw new AdminDbError("DB_FAILED");
  const rows = await request(
    `/rest/v1/codematt_subscriptions?user_id=eq.${userId}&select=plan_id,status,current_period_end&limit=1`,
    { method: "GET" }
  );
  return Array.isArray(rows) ? rows[0] ?? null : null;
}
