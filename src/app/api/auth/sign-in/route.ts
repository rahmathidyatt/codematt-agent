import { NextRequest } from "next/server";
import { z } from "zod";
import { readBoundedJson } from "@/lib/security/ai-request";
import { getAuthBackendConfig, isSameOriginMutation, validAccessToken, authCookieMaxAge, AUTH_COOKIE_NAME } from "@/lib/auth/core";
import { authJson, supabaseAuthFetch } from "@/lib/auth/server";

export const runtime = "nodejs";
const schema = z.object({
  email: z.email().max(254),
  password: z.string().min(8).max(128),
}).strict();

export async function POST(req: NextRequest) {
  if (!isSameOriginMutation(req)) return authJson({ ok: false, code: "ORIGIN_REJECTED" }, 403);
  const backend = getAuthBackendConfig();
  if (!backend) return authJson({ ok: false, code: "AUTH_NOT_CONFIGURED" }, 503);
  const incoming = await readBoundedJson(req);
  if (!incoming.ok) return authJson({ ok: false, code: incoming.error }, incoming.status);
  const body = schema.safeParse(incoming.body);
  if (!body.success) return authJson({ ok: false, code: "INVALID_CREDENTIAL_FORMAT" }, 400);

  try {
    const upstream = await supabaseAuthFetch(backend, "/auth/v1/token?grant_type=password", {
      method: "POST", body: body.data,
    });
    if (!upstream.ok) return authJson({ ok: false, code: "INVALID_CREDENTIALS" }, 401);
    const data: unknown = await upstream.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return authJson({ ok: false, code: "AUTH_UPSTREAM_INVALID" }, 502);
    }
    const auth = data as { access_token?: unknown; expires_in?: unknown };
    if (!validAccessToken(auth.access_token) || authCookieMaxAge(auth.expires_in) <= 0) {
      return authJson({ ok: false, code: "AUTH_UPSTREAM_INVALID" }, 502);
    }
    const response = authJson({ ok: true, expiresIn: authCookieMaxAge(auth.expires_in) });
    response.cookies.set(AUTH_COOKIE_NAME, auth.access_token, {
      httpOnly: true,
      secure: req.nextUrl.protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: authCookieMaxAge(auth.expires_in),
    });
    return response;
  } catch {
    return authJson({ ok: false, code: "AUTH_UPSTREAM_UNAVAILABLE" }, 503);
  }
}
