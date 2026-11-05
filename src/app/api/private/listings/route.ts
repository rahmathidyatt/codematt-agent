import { NextRequest } from "next/server";
import { z } from "zod";
import { readBoundedJson } from "@/lib/security/ai-request";
import { isSameOriginMutation } from "@/lib/auth/core";
import { authJson, getVerifiedIdentity } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const listingSchema = z.object({
  name: z.string().trim().min(2).max(180),
  location: z.string().trim().min(2).max(250),
  price: z.number().finite().min(0).max(1_000_000_000_000).nullable().optional(),
}).strict();

function allowed(): boolean {
  return process.env.CODEMATT_DATABASE_ENABLED === "true";
}

export async function GET(req: NextRequest) {
  if (!allowed()) return authJson({ ok: false, code: "DATABASE_NOT_CONFIGURED" }, 503);
  const actor = await getVerifiedIdentity(req);
  if (!actor.ok) return authJson({ ok: false, code: actor.code }, actor.status);

  const endpoint = new URL(actor.backend.url + "/rest/v1/codematt_listings");
  endpoint.searchParams.set("select", "id,name,location,price,created_at");
  endpoint.searchParams.set("user_id", `eq.${actor.id}`);
  endpoint.searchParams.set("order", "created_at.desc");
  endpoint.searchParams.set("limit", "50");

  try {
    const response = await fetch(endpoint.toString(), {
      headers: {
        apikey: actor.backend.publishableKey,
        Authorization: `Bearer ${actor.token}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return authJson({ ok: false, code: "DATABASE_READ_FAILED" }, 502);
    const records: unknown = await response.json();
    if (!Array.isArray(records)) return authJson({ ok: false, code: "DATABASE_INVALID_RESPONSE" }, 502);
    return authJson({ ok: true, listings: records });
  } catch {
    return authJson({ ok: false, code: "DATABASE_UNAVAILABLE" }, 503);
  }
}

export async function POST(req: NextRequest) {
  if (!isSameOriginMutation(req)) return authJson({ ok: false, code: "ORIGIN_REJECTED" }, 403);
  if (!allowed()) return authJson({ ok: false, code: "DATABASE_NOT_CONFIGURED" }, 503);
  const actor = await getVerifiedIdentity(req);
  if (!actor.ok) return authJson({ ok: false, code: actor.code }, actor.status);
  const incoming = await readBoundedJson(req);
  if (!incoming.ok) return authJson({ ok: false, code: incoming.error }, incoming.status);
  const parsed = listingSchema.safeParse(incoming.body);
  if (!parsed.success) return authJson({ ok: false, code: "INVALID_LISTING" }, 400);

  try {
    const response = await fetch(actor.backend.url + "/rest/v1/codematt_listings", {
      method: "POST",
      headers: {
        apikey: actor.backend.publishableKey,
        Authorization: `Bearer ${actor.token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ ...parsed.data, user_id: actor.id }),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return authJson({ ok: false, code: "DATABASE_WRITE_FAILED" }, 502);
    const result: unknown = await response.json();
    if (!Array.isArray(result) || result.length !== 1) {
      return authJson({ ok: false, code: "DATABASE_INVALID_RESPONSE" }, 502);
    }
    return authJson({ ok: true, listing: result[0] }, 201);
  } catch {
    return authJson({ ok: false, code: "DATABASE_UNAVAILABLE" }, 503);
  }
}
