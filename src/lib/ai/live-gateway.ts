import "server-only";
import { GoogleGenAI } from "@google/genai";
import { getLiveModel, readOpenAIResponse } from "@/lib/ai/provider-routing";

export class LiveGatewayError extends Error {
  constructor(public readonly code: "MODEL_ADAPTER_NOT_CONNECTED" | "PROVIDER_NOT_CONFIGURED" | "PROVIDER_FAILED") {
    super(code);
  }
}

export async function executeLiveGateway(
  modelId: string,
  prompt: string,
  systemInstruction: string
): Promise<{
  modelName: string;
  provider: string;
  content: string;
  tokensUsed: number;
  inputTokens: number;
  outputTokens: number;
  costStatus: "unavailable";
}> {
  const model = getLiveModel(modelId);
  if (!model) throw new LiveGatewayError("MODEL_ADAPTER_NOT_CONNECTED");
  const output = await (async () => {
    if (model.providerId === "google") {
      const key = process.env.GEMINI_API_KEY;
      if (!key) throw new LiveGatewayError("PROVIDER_NOT_CONFIGURED");
      try {
        const ai = new GoogleGenAI({ apiKey: key });
        const result = await ai.models.generateContent({
          model: model.slug,
          contents: prompt,
          config: { systemInstruction, maxOutputTokens: 768 },
        });
        const text = result.text?.trim();
        if (!text) throw new Error("EMPTY_PROVIDER_RESPONSE");
        return {
          text,
          inputTokens: result.usageMetadata?.promptTokenCount ?? 0,
          outputTokens: result.usageMetadata?.candidatesTokenCount ?? 0,
        };
      } catch {
        throw new LiveGatewayError("PROVIDER_FAILED");
      }
    }
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new LiveGatewayError("PROVIDER_NOT_CONFIGURED");
    try {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model.slug,
          input: prompt,
          instructions: systemInstruction,
          store: false,
          max_output_tokens: 768,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) throw new Error("PROVIDER_HTTP_ERROR");
      const data: unknown = await response.json();
      const parsed = readOpenAIResponse(data);
      if (!parsed) throw new Error("INVALID_PROVIDER_RESPONSE");
      return parsed;
    } catch {
      throw new LiveGatewayError("PROVIDER_FAILED");
    }
  })();

  const safeNumber = (count: number) => Number.isSafeInteger(count) && count >= 0 ? count : 0;
  const inputTokens = safeNumber(output.inputTokens);
  const outputTokens = safeNumber(output.outputTokens);
  return {
    modelName: model.displayName,
    provider: model.provider,
    content: output.text,
    tokensUsed: inputTokens + outputTokens,
    inputTokens,
    outputTokens,
    costStatus: "unavailable",
  };
}
