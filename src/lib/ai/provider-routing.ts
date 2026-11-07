/** Only these model IDs have actual server-side adapters. Others stay DEMO-only. */
export const LIVE_MODEL_ROUTING = {
  "gemini-3.8-flash": {
    slug: "gemini-3.8-flash",
    provider: "Google DeepMind",
    displayName: "Gemini 3.8 Flash",
    providerId: "google",
  },
  "chatgpt-4o": {
    slug: "gpt-4o",
    provider: "OpenAI",
    displayName: "GPT-4o",
    providerId: "openai",
  },
} as const;

export type LiveModelId = keyof typeof LIVE_MODEL_ROUTING;

export function getLiveModel(id: string) {
  return Object.prototype.hasOwnProperty.call(LIVE_MODEL_ROUTING, id)
    ? LIVE_MODEL_ROUTING[id as LiveModelId]
    : null;
}

export function readOpenAIResponse(payload: unknown):
  { text: string; inputTokens: number; outputTokens: number } | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const response = payload as {
    output?: unknown;
    usage?: { input_tokens?: unknown; output_tokens?: unknown };
  };
  if (!Array.isArray(response.output)) return null;
  const text = response.output
    .filter((part): part is { type: string; content?: unknown } =>
      typeof part === "object" && part !== null &&
      (part as { type?: unknown }).type === "message")
    .flatMap((part) => Array.isArray(part.content) ? part.content : [])
    .filter((part): part is { type: string; text: string } =>
      typeof part === "object" && part !== null &&
      (part as { type?: unknown }).type === "output_text" &&
      typeof (part as { text?: unknown }).text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim();
  if (!text || text.length > 30_000) return null;
  const safeCount = (value: unknown) =>
    typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : 0;
  return {
    text,
    inputTokens: safeCount(response.usage?.input_tokens),
    outputTokens: safeCount(response.usage?.output_tokens),
  };
}
