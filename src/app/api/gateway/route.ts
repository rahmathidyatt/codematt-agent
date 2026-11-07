import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { INITIAL_MODELS, AGENT_PERSONAS } from "@/features/platform/model-gateway";
import { readBoundedJson, isLiveAiEnabled, isLiveAiAuthorized } from "@/lib/security/ai-request";
import { getLiveModel } from "@/lib/ai/provider-routing";
import { executeLiveGateway, LiveGatewayError } from "@/lib/ai/live-gateway";
import { reserveLiveAiCalls } from "@/lib/security/live-ai-budget";

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
      return NextResponse.json(
        { ok: false, error: "UNAUTHORIZED" },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const chosen = [primary, secondary].filter((m): m is typeof primary => Boolean(m));
    // Preflight every provider before generating output, so an unsupported
    // comparison model does not cause a partial paid run and a misleading error.
    if (chosen.some((model) => !getLiveModel(model.id))) {
      return NextResponse.json(
        { ok: false, error: "MODEL_ADAPTER_NOT_CONNECTED" },
        { status: 501, headers: { "Cache-Control": "no-store" } }
      );
    }
    if (chosen.some((model) => {
      const provider = getLiveModel(model.id)?.providerId;
      return provider === "google" ? !process.env.GEMINI_API_KEY : !process.env.OPENAI_API_KEY;
    })) {
      return NextResponse.json(
        { ok: false, error: "PROVIDER_NOT_CONFIGURED" },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Reserve both provider calls conservatively before any outbound request.
    // Per-process limits are a safety net, NOT global billing enforcement.
    const calls = secondary && secondary.id !== primary.id ? 2 : 1;
    const budget = reserveLiveAiCalls(calls);
    if (!budget.ok) {
      return NextResponse.json(
        { ok: false, error: budget.code },
        { status: budget.status, headers: { "Cache-Control": "no-store" } }
      );
    }

    const systemInstruction = parsed.data.customSystemPrompt?.trim() || persona.systemPrompt;
    const run = async (model: typeof primary) => {
      const t0 = Date.now();
      const result = await executeLiveGateway(model.id, prompt, systemInstruction);
      return {
        modelId: model.id,
        modelName: result.modelName,
        provider: result.provider,
        content: result.content,
        tokensUsed: result.tokensUsed,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        wholesaleCostUsd: 0,
        retailChargeUsd: 0,
        grossMarginPercent: 0,
        costStatus: result.costStatus,
        latencyMs: Date.now() - t0,
        mode: "live" as const,
      };
    };
    try {
      const primaryResponse = await run(primary);
      let comparisonResponse: Awaited<ReturnType<typeof run>> | null = null;
      let comparisonError: string | null = null;
      if (secondary && secondary.id !== primary.id) {
        try {
          comparisonResponse = await run(secondary);
        } catch {
          // Preserve successful primary output and acknowledge partial failure.
          comparisonError = "COMPARISON_PROVIDER_FAILED";
        }
      }
      return NextResponse.json({
        ok: true,
        mode: "live",
        primary: primaryResponse,
        comparison: comparisonResponse,
        comparisonError,
        costStatus: "unavailable",
        totalElapsedMs: Date.now() - startedAt,
      }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      const code = error instanceof LiveGatewayError ? error.code : "PROVIDER_FAILED";
      return NextResponse.json(
        { ok: false, error: code },
        { status: code === "PROVIDER_NOT_CONFIGURED" ? 503 : 502,
          headers: { "Cache-Control": "no-store" } }
      );
    }
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
