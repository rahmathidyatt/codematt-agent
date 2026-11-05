import { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, isSameOriginMutation } from "@/lib/auth/core";
import { authJson } from "@/lib/auth/server";

export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  if (!isSameOriginMutation(req)) return authJson({ ok: false, code: "ORIGIN_REJECTED" }, 403);
  // Access token is short-lived and never stored in JS-accessible storage. No refresh
  // token is issued to this browser, so clearing cookie terminates local session.
  const response = authJson({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true, secure: req.nextUrl.protocol === "https:",
    sameSite: "lax", path: "/", maxAge: 0,
  });
  return response;
}
