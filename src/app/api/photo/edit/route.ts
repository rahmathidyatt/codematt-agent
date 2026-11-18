import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { planAllowsProvider, cheapestPlanFor } from "@/config/plans";
import { gatePaidRequest, NO_STORE } from "@/lib/billing/gate";
import { consumeQuota, refundQuota, type QuotaResult, validIdempotencyKey } from "@/lib/billing/entitlements";
import { editImage, type ImageProvider } from "@/lib/ai/image-providers";
import { ProviderError, providerKeyConfigured } from "@/lib/ai/chat-providers";
import { readImageForm, readInt } from "@/lib/security/image-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const regionsSchema = z.array(z.object({
  x: z.number().int().min(0).max(20_000),
  y: z.number().int().min(0).max(20_000),
  width: z.number().int().min(2).max(20_000),
  height: z.number().int().min(2).max(20_000),
}).strict()).min(1).max(8);

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

/**
 * AI edit of selected regions (remove house number, phone number, banner...).
 * The browser composites ONLY the selected regions from the AI result back onto
 * the original photo, so the rest of the picture stays pixel-identical.
 */
export async function POST(req: NextRequest) {
  const gate = await gatePaidRequest(req);
  if (gate.mode === "error") return json({ ok: false, code: gate.code }, gate.status);

  const upload = await readImageForm(req);
  if (!upload.ok) return json({ ok: false, code: upload.code }, upload.status);
  const { form, image } = upload;

  const provider = form.get("provider");
  const instruction = form.get("instruction");
  const key = form.get("idempotencyKey");
  const width = readInt(form, "width", 16, 8_192);
  const height = readInt(form, "height", 16, 8_192);
  let regions: z.infer<typeof regionsSchema>;
  try {
    regions = regionsSchema.parse(JSON.parse(String(form.get("regions") ?? "")));
  } catch {
    return json({ ok: false, code: "INVALID_REGIONS" }, 400);
  }
  if ((provider !== "google" && provider !== "openai") || typeof instruction !== "string" ||
    instruction.trim().length < 5 || instruction.length > 300 || !validIdempotencyKey(key) || !width || !height) {
    return json({ ok: false, code: "INVALID_REQUEST" }, 400);
  }
  const mask = form.get("mask");
  const maskBlob = mask instanceof File && mask.size > 0 && mask.size <= 7 * 1024 * 1024 && mask.type === "image/png" ? mask : null;

  if (gate.mode === "demo") {
    return json({ ok: false, mode: "demo", code: "LIVE_AI_DISABLED" }, 503);
  }

  const imageProvider = provider as ImageProvider;
  const { plan } = gate.active;
  if (!planAllowsProvider(plan.id, imageProvider)) {
    return json({ ok: false, code: "PLAN_UPGRADE_REQUIRED", requiredPlan: cheapestPlanFor(imageProvider)?.id ?? null }, 402);
  }
  if (!providerKeyConfigured(imageProvider)) return json({ ok: false, code: "PROVIDER_NOT_CONFIGURED" }, 503);

  let quota: QuotaResult;
  try {
    quota = await consumeQuota(gate.userId, "ai_photo", plan.quotas.ai_photo, key, imageProvider);
  } catch {
    return json({ ok: false, code: "BILLING_UNAVAILABLE" }, 503);
  }
  if (!quota.allowed) return json({ ok: false, code: "QUOTA_EXHAUSTED", usage: { used: quota.used, limit: quota.limit } }, 429);

  try {
    const out = await editImage({
      provider: imageProvider,
      image,
      mimeType: image.type,
      mask: maskBlob,
      instruction: instruction.trim(),
      regions,
      width,
      height,
    });
    return json({
      ok: true,
      mode: "live",
      model: out.model,
      mimeType: out.mimeType,
      imageBase64: out.base64,
      usage: { used: quota.used, limit: quota.limit },
    });
  } catch (error) {
    await refundQuota(gate.userId, key);
    const code = error instanceof ProviderError ? error.code : "PROVIDER_FAILED";
    return json({ ok: false, code }, code === "PROVIDER_NOT_CONFIGURED" ? 503 : 502);
  }
}
