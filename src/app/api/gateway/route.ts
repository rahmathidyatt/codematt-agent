import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { INITIAL_MODELS, AGENT_PERSONAS } from "@/features/platform/model-gateway";
import { readBoundedJson, isLiveAiEnabled, isLiveAiAuthorized } from "@/lib/security/ai-request";

export const runtime = "nodejs";

const gatewaySchema = z.object({
  prompt: z.string().trim().min(1).max(4_000),
  modelId: z.string().min(1).max(100),
  compareModelId: z.string().max(100).nullable().optional(),
  agentId: z.string().min(1).max(100),
  customSystemPrompt: z.string().max(2_000).optional(),
}).strict();

/**
 * The model catalogue is currently a UI prototype, not a set of connected
 * vendor adapters. Do not send requests to Gemini while claiming a response
 * came from OpenAI, Anthropic, DeepSeek, or Meta.
 */
export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  const parsedJson = await readBoundedJson(req);
  if (!parsedJson.ok) {
    return NextResponse.json({ ok: false, error: parsedJson.error }, { status: parsedJson.status });
  }

  const parsed = gatewaySchema.safeParse(parsedJson.body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_REQUEST" }, { status: 400 });
  }
  const { prompt, modelId, compareModelId, agentId } = parsed.data;
  const primary = INITIAL_MODELS.find((m) => m.id === modelId && m.enabled);
  const secondary = compareModelId
    ? INITIAL_MODELS.find((m) => m.id === compareModelId && m.enabled)
    : null;
  const persona = AGENT_PERSONAS.find((a) => a.id === agentId);
  if (!primary || !persona || (compareModelId && !secondary)) {
    return NextResponse.json({ ok: false, error: "UNKNOWN_MODEL_OR_AGENT" }, { status: 400 });
  }

  if (isLiveAiEnabled()) {
    if (!isLiveAiAuthorized(req.headers.get("authorization"))) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    // Integration with each named vendor requires a real adapter, accounting,
    // authenticated users and durable rate limits. Never bill demo estimates.
    return NextResponse.json(
      { ok: false, error: "MODEL_ADAPTER_NOT_CONNECTED" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const createDemo = (model: typeof primary) => ({
    modelId: model.id,
    modelName: model.name,
    provider: model.provider,
    content: [
      "⚠️ **MODE DEMO. Bukan respons langsung dari " + model.provider + ".**",
      "",
      "Model yang dipilih: **" + model.name + "**.",
      "Peran agen: **" + persona.name + "**.",
      "",
      "Instruksi Anda diterima (pratinjau):",
      "> " + prompt.replace(/\n/g, "\n> "),
      "",
      "Integrasi API untuk model ini belum diaktifkan. Tidak ada pemanggilan provider, penggunaan token berbayar, atau tagihan yang terjadi.",
    ].join("\n"),
    tokensUsed: 0,
    wholesaleCostUsd: 0,
    retailChargeUsd: 0,
    grossMarginPercent: 0,
    latencyMs: Date.now() - startedAt,
    mode: "demo" as const,
  });

  return NextResponse.json(
    {
      ok: true,
      mode: "demo",
      primary: createDemo(primary),
      comparison: secondary && secondary.id !== primary.id ? createDemo(secondary) : null,
      totalElapsedMs: Date.now() - startedAt,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
