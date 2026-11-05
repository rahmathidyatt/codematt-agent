import { NextRequest } from "next/server";
import { authJson, getVerifiedIdentity } from "@/lib/auth/server";

export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  const identity = await getVerifiedIdentity(req);
  if (!identity.ok) return authJson({ authenticated: false, code: identity.code }, identity.status);
  return authJson({ authenticated: true, user: { id: identity.id, email: identity.email } });
}
