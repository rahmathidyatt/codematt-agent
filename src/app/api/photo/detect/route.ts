import { NextRequest, NextResponse } from "next/server";
import { gatePaidRequest, NO_STORE } from "@/lib/billing/gate";
import { consumeQuota, refundQuota, type QuotaResult, validIdempotencyKey } from "@/lib/billing/entitlements";
import { detectSensitiveText } from "@/lib/ai/image-providers";
import { ProviderError, providerKeyConfigured } from "@/lib/ai/chat-providers";
import { readImageForm, readInt } from "@/lib/security/image-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

/** Auto-detect house numbers / phone numbers / plates. Costs 1 chat unit (Gemini, all plans). */
export async function POST(req: NextRequest) {
  const gate = await gatePaidRequest(req);
  if (gate.mode === "error") return json({ ok: false, code: gate.code }, gate.status);

  const upload = await readImageForm(req);
  if (!upload.ok) return json({ ok: false, code: upload.code }, upload.status);
  const { form, image } = upload;
  const key = form.get("idempotencyKey");
  const width = readInt(form, "width", 16, 8_192);
  const height = readInt(form, "height", 16, 8_192);
  if (!validIdempotencyKey(key) || !width || !height) return json({ ok: false, code: "INVALID_REQUEST" }, 400);

  if (gate.mode === "demo") return json({ ok: false, mode: "demo", code: "LIVE_AI_DISABLED" }, 503);
  if (!providerKeyConfigured("google")) return json({ ok: false, code: "PROVIDER_NOT_CONFIGURED" }, 503);

  const { plan } = gate.active;
  let quota: QuotaResult;
  try {
    quota = await consumeQuota(gate.userId, "chat", plan.quotas.chat, key, "google");
  } catch {
    return json({ ok: false, code: "BILLING_UNAVAILABLE" }, 503);
  }
  if (!quota.allowed) return json({ ok: false, code: "QUOTA_EXHAUSTED", usage: { used: quota.used, limit: quota.limit } }, 429);

  try {
    const boxes = await detectSensitiveText({ image, mimeType: image.type, width, height });
    return json({ ok: true, mode: "live", boxes, usage: { used: quota.used, limit: quota.limit } });
  } catch (error) {
    await refundQuota(gate.userId, key);
    const code = error instanceof ProviderError ? error.code : "PROVIDER_FAILED";
    return json({ ok: false, code }, 502);
  }
}
