import { NextRequest } from "next/server";
import { z } from "zod";
import { readBoundedJson } from "@/lib/security/ai-request";
import { getAuthBackendConfig, isSameOriginMutation } from "@/lib/auth/core";
import { authJson, supabaseAuthFetch } from "@/lib/auth/server";
import { takeAuthAttempt } from "@/lib/security/auth-throttle";

export const runtime = "nodejs";
const schema = z.object({
  name: z.string().trim().min(2).max(120),
  agency: z.string().trim().min(2).max(120),
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
  if (!body.success) return authJson({ ok: false, code: "INVALID_SIGNUP_FORMAT" }, 400);
  const limit = takeAuthAttempt("sign-up", body.data.email);
  if (!limit.allowed) {
    const response = authJson({ ok: false, code: "AUTH_RATE_LIMITED" }, 429);
    response.headers.set("Retry-After", String(limit.retryAfterSeconds));
    return response;
  }

  try {
    const upstream = await supabaseAuthFetch(backend, "/auth/v1/signup", {
      method: "POST",
      body: {
        email: body.data.email,
        password: body.data.password,
        data: { full_name: body.data.name, agency_name: body.data.agency },
      },
    });
    if (upstream.status === 429) return authJson({ ok: false, code: "AUTH_RATE_LIMITED" }, 429);
    if (upstream.status >= 500) return authJson({ ok: false, code: "AUTH_UPSTREAM_UNAVAILABLE" }, 503);
    if (!upstream.ok) return authJson({ ok: false, code: "SIGNUP_NOT_ACCEPTED" }, 400);
    // Do not create a local session from signup results. Require explicit sign-in,
    // and respect the email-confirmation policy of the selected Supabase project.
    return authJson({
      ok: true,
      message: "Jika pendaftaran diterima, periksa email verifikasi dan masuk menggunakan akun Anda.",
    });
  } catch {
    return authJson({ ok: false, code: "AUTH_UPSTREAM_UNAVAILABLE" }, 503);
  }
}
