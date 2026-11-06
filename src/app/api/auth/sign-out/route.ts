import { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, isSameOriginMutation, getAuthBackendConfig, validAccessToken, shouldUseSecureCookie } from "@/lib/auth/core";
import { authJson, supabaseAuthFetch } from "@/lib/auth/server";

export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  if (!isSameOriginMutation(req)) return authJson({ ok: false, code: "ORIGIN_REJECTED" }, 403);
  const backend = getAuthBackendConfig();
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  let upstreamRevocation: "confirmed" | "unverified" | "not-applicable" = "not-applicable";
  if (backend && validAccessToken(token)) {
    // Supabase destroys the current refresh session. Existing JWTs may remain
    // valid until their expiry, so never claim immediate access-token revocation.
    upstreamRevocation = "unverified";
    try {
      const upstream = await supabaseAuthFetch(backend, "/auth/v1/logout?scope=local", {
        method: "POST", bearer: token,
      });
      if (upstream.ok) upstreamRevocation = "confirmed";
    } catch {
      // Still clear the local cookie if upstream is temporarily unreachable.
    }
  }
  const response = authJson({ ok: true, upstreamRevocation });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true, secure: shouldUseSecureCookie(),
    sameSite: "lax", path: "/", maxAge: 0,
  });
  return response;
}
