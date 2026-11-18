import { NextRequest, NextResponse } from "next/server";
import { gatePaidRequest, NO_STORE } from "@/lib/billing/gate";
import { consumeQuota, refundQuota, type QuotaResult, validIdempotencyKey } from "@/lib/billing/entitlements";
import { enhanceImage } from "@/lib/ai/image-providers";
import { ProviderError, providerKeyConfigured } from "@/lib/ai/chat-providers";
import { readImageForm } from "@/lib/security/image-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

/** HD with AI (Gemini, every plan). Costs 1 "edit foto AI" unit; refunded on failure. */
export async function POST(req: NextRequest) {
  const gate = await gatePaidRequest(req);
  if (gate.mode === "error") return json({ ok: false, code: gate.code }, gate.status);

  const upload = await readImageForm(req);
  if (!upload.ok) return json({ ok: false, code: upload.code }, upload.status);
  const key = upload.form.get("idempotencyKey");
  if (!validIdempotencyKey(key)) return json({ ok: false, code: "INVALID_REQUEST" }, 400);

  if (gate.mode === "demo") return json({ ok: false, mode: "demo", code: "LIVE_AI_DISABLED" }, 503);
  if (!providerKeyConfigured("google")) return json({ ok: false, code: "PROVIDER_NOT_CONFIGURED" }, 503);

  const { plan } = gate.active;
  let quota: QuotaResult;
  try {
    quota = await consumeQuota(gate.userId, "ai_photo", plan.quotas.ai_photo, key, "google");
  } catch {
    return json({ ok: false, code: "BILLING_UNAVAILABLE" }, 503);
  }
  if (!quota.allowed) return json({ ok: false, code: "QUOTA_EXHAUSTED", usage: { used: quota.used, limit: quota.limit } }, 429);

  try {
    const out = await enhanceImage({ image: upload.image, mimeType: upload.image.type });
    return json({ ok: true, mode: "live", mimeType: out.mimeType, imageBase64: out.base64, usage: { used: quota.used, limit: quota.limit } });
  } catch (error) {
    await refundQuota(gate.userId, key);
    const code = error instanceof ProviderError ? error.code : "PROVIDER_FAILED";
    return json({ ok: false, code }, code === "PROVIDER_NOT_CONFIGURED" ? 503 : 502);
  }
}
