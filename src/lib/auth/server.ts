import "server-only";
import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  getAuthBackendConfig,
  type AuthBackendConfig,
  validAccessToken,
} from "@/lib/auth/core";

export function authJson(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, private", "X-Content-Type-Options": "nosniff" },
  });
}

export async function supabaseAuthFetch(
  backend: AuthBackendConfig,
  route: "/auth/v1/token?grant_type=password" | "/auth/v1/signup" | "/auth/v1/user",
  options: { method: "GET" | "POST"; bearer?: string; body?: unknown }
): Promise<Response> {
  return fetch(backend.url + route, {
    method: options.method,
    headers: {
      apikey: backend.publishableKey,
      "Content-Type": "application/json",
      ...(options.bearer ? { Authorization: `Bearer ${options.bearer}` } : {}),
    },
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });
}

export async function getVerifiedIdentity(req: NextRequest): Promise<
  | { ok: true; id: string; email: string | null; token: string; backend: AuthBackendConfig }
  | { ok: false; status: number; code: string }
> {
  const backend = getAuthBackendConfig();
  if (!backend) return { ok: false, status: 503, code: "AUTH_NOT_CONFIGURED" };
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!validAccessToken(token)) return { ok: false, status: 401, code: "UNAUTHENTICATED" };
  try {
    // Never authorize by decoding an unverified browser cookie or trusting user_metadata.
    const response = await supabaseAuthFetch(backend, "/auth/v1/user", {
      method: "GET", bearer: token,
    });
    if (!response.ok) return { ok: false, status: 401, code: "UNAUTHENTICATED" };
    const body: unknown = await response.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return { ok: false, status: 401, code: "UNAUTHENTICATED" };
    }
    const user = body as { id?: unknown; email?: unknown };
    if (typeof user.id !== "string" || !/^[a-f0-9-]{36}$/.test(user.id)) {
      return { ok: false, status: 401, code: "UNAUTHENTICATED" };
    }
    return {
      ok: true,
      id: user.id,
      email: typeof user.email === "string" ? user.email : null,
      token,
      backend,
    };
  } catch {
    return { ok: false, status: 503, code: "AUTH_UPSTREAM_UNAVAILABLE" };
  }
}
