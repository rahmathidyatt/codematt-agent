// Contracts only. No provider calls are implemented in Phase 0.
export type AiTask = "assistant" | "listing" | "followup" | "content" | "flyer-copy";
export type AiFailure = "not-configured" | "unauthorized" | "quota-exceeded" | "rate-limited" | "timeout" | "invalid-output" | "provider-error";
export type AiResult<T> =
  | { ok: true; data: T; generationId: string; usage: { inputTokens: number; outputTokens: number } | null }
  | { ok: false; code: AiFailure; requestId: string };
export interface AiRequest {
  task: AiTask;
  locale: "id" | "en";
  instructions: string;
  facts: Readonly<Record<string, string | number | null>>;
}
export interface AiService {
  // actorId must come from verified server identity, never the request body.
  generate(request: AiRequest, context: { actorId: string; requestId: string; signal: AbortSignal }): Promise<AiResult<unknown>>;
}
