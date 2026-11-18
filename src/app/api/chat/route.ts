import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cheapestPlanFor, PROVIDER_LABELS, planAllowsProvider } from "@/config/plans";
import { readBoundedJson } from "@/lib/security/ai-request";
import { gatePaidRequest, NO_STORE } from "@/lib/billing/gate";
import { consumeQuota, refundQuota, type QuotaResult } from "@/lib/billing/entitlements";
import { PROPERTY_ASSISTANT_SYSTEM, ProviderError, providerKeyConfigured, runChat } from "@/lib/ai/chat-providers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  provider: z.enum(["google", "openai", "anthropic"]),
  idempotencyKey: z.string().regex(/^[A-Za-z0-9_-]{16,80}$/),
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(4_000),
  }).strict()).min(1).max(12),
}).strict();

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export async function POST(req: NextRequest) {
  const gate = await gatePaidRequest(req);
  if (gate.mode === "error") return json({ ok: false, code: gate.code }, gate.status);

  const incoming = await readBoundedJson(req, 64_000);
  if (!incoming.ok) return json({ ok: false, code: incoming.error }, incoming.status);
  const parsed = schema.safeParse(incoming.body);
  if (!parsed.success) return json({ ok: false, code: "INVALID_REQUEST" }, 400);
  const { provider, idempotencyKey, messages } = parsed.data;
  if (messages[messages.length - 1].role !== "user") return json({ ok: false, code: "INVALID_REQUEST" }, 400);

  if (gate.mode === "demo") {
    return json({
      ok: true,
      mode: "demo",
      provider,
      model: "demo",
      reply:
        `[MODE DEMO] Live AI belum diaktifkan di server, jadi pesan ini tidak dikirim ke ${PROVIDER_LABELS[provider]}. ` +
        "Admin perlu mengisi API key, Supabase Auth, dan CODEMATT_ENABLE_LIVE_AI=true. Lihat docs/BILLING.md.",
      usage: { used: 0, limit: 0 },
    });
  }

  const { plan } = gate.active;
  if (!planAllowsProvider(plan.id, provider)) {
    const upgrade = cheapestPlanFor(provider);
    return json({ ok: false, code: "PLAN_UPGRADE_REQUIRED", requiredPlan: upgrade?.id ?? null }, 402);
  }
  if (!providerKeyConfigured(provider)) return json({ ok: false, code: "PROVIDER_NOT_CONFIGURED" }, 503);

  let quota: QuotaResult;
  try {
    quota = await consumeQuota(gate.userId, "chat", plan.quotas.chat, idempotencyKey, provider);
  } catch {
    return json({ ok: false, code: "BILLING_UNAVAILABLE" }, 503);
  }
  if (!quota.allowed) {
    return json({ ok: false, code: "QUOTA_EXHAUSTED", usage: { used: quota.used, limit: quota.limit } }, 429);
  }

  try {
    const out = await runChat(provider, PROPERTY_ASSISTANT_SYSTEM, messages);
    return json({
      ok: true,
      mode: "live",
      provider,
      model: out.model,
      reply: out.text,
      tokens: { input: out.inputTokens, output: out.outputTokens },
      usage: { used: quota.used, limit: quota.limit },
    });
  } catch (error) {
    await refundQuota(gate.userId, idempotencyKey);
    const code = error instanceof ProviderError ? error.code : "PROVIDER_FAILED";
    return json({ ok: false, code }, code === "PROVIDER_NOT_CONFIGURED" ? 503 : 502);
  }
}
