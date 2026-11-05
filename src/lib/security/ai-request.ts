import { timingSafeEqual } from "node:crypto";

export const MAX_AI_REQUEST_BYTES = 16_384;

export async function readBoundedJson(request: Request): Promise<
  | { ok: true; body: Record<string, unknown> }
  | { ok: false; status: number; error: string }
> {
  if (request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() !== "application/json") {
    return { ok: false, status: 415, error: "CONTENT_TYPE_NOT_SUPPORTED" };
  }
  const statedSize = Number(request.headers.get("content-length"));
  if (Number.isFinite(statedSize) && statedSize > MAX_AI_REQUEST_BYTES) {
    return { ok: false, status: 413, error: "REQUEST_TOO_LARGE" };
  }

  const reader = request.body?.getReader();
  if (!reader) return { ok: false, status: 400, error: "INVALID_JSON" };
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  let raw = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_AI_REQUEST_BYTES) {
        await reader.cancel();
        return { ok: false, status: 413, error: "REQUEST_TOO_LARGE" };
      }
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { ok: false, status: 400, error: "INVALID_JSON_OBJECT" };
    }
    return { ok: true, body: value as Record<string, unknown> };
  } catch {
    return { ok: false, status: 400, error: "INVALID_JSON" };
  } finally {
    reader.releaseLock();
  }
}

/**
 * Live paid model calls require explicit opt-in AND a 32+ character server-side token.
 * Never pass this secret into NEXT_PUBLIC_ variables or client-side code.
 * This is an integration gate, not a replacement for user auth, tenant quotas or billing.
 */
export function isLiveAiAuthorized(
  authorization: string | null,
  env: NodeJS.ProcessEnv = process.env
): boolean {
  if (env.CODEMATT_ENABLE_LIVE_AI !== "true") return false;
  const secret = env.CODEMATT_LIVE_AI_TOKEN;
  if (!secret || secret.length < 32 || !authorization?.startsWith("Bearer ")) return false;
  const submitted = authorization.slice("Bearer ".length);
  const a = Buffer.from(submitted);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isLiveAiEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.CODEMATT_ENABLE_LIVE_AI === "true";
}
