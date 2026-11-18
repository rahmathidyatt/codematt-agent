/**
 * Pure, dependency-free parsers for provider responses. Every provider payload
 * is treated as untrusted input: unknown shapes return null instead of throwing.
 */

export interface ParsedText {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

const MAX_TEXT = 30_000;

function safeCount(value: unknown): number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Anthropic Messages API: { content: [{ type: "text", text }], usage: { input_tokens, output_tokens } } */
export function readAnthropicResponse(payload: unknown): ParsedText | null {
  if (!isRecord(payload) || !Array.isArray(payload.content)) return null;
  const text = payload.content
    .filter((part): part is { type: string; text: string } =>
      isRecord(part) && part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim();
  if (!text || text.length > MAX_TEXT) return null;
  const usage = isRecord(payload.usage) ? payload.usage : {};
  return {
    text,
    inputTokens: safeCount(usage.input_tokens),
    outputTokens: safeCount(usage.output_tokens),
  };
}

/** OpenAI Responses API: output[].type === "message" → content[].type === "output_text". */
export function readOpenAIText(payload: unknown): ParsedText | null {
  if (!isRecord(payload) || !Array.isArray(payload.output)) return null;
  const text = payload.output
    .filter((item): item is { type: string; content?: unknown } => isRecord(item) && item.type === "message")
    .flatMap((item) => (Array.isArray(item.content) ? item.content : []))
    .filter((part): part is { type: string; text: string } =>
      isRecord(part) && part.type === "output_text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim();
  if (!text || text.length > MAX_TEXT) return null;
  const usage = isRecord(payload.usage) ? payload.usage : {};
  return {
    text,
    inputTokens: safeCount(usage.input_tokens),
    outputTokens: safeCount(usage.output_tokens),
  };
}

/** OpenAI Images API (generations/edits): { data: [{ b64_json }] } */
export function readOpenAIImage(payload: unknown): { base64: string; mimeType: string } | null {
  if (!isRecord(payload) || !Array.isArray(payload.data) || payload.data.length === 0) return null;
  const first = payload.data[0];
  if (!isRecord(first) || typeof first.b64_json !== "string" || first.b64_json.length < 100) return null;
  return { base64: first.b64_json, mimeType: "image/png" };
}

/** Gemini generateContent: candidates[0].content.parts[] with inlineData { mimeType, data }. */
export function readGeminiImage(payload: unknown): { base64: string; mimeType: string } | null {
  if (!isRecord(payload) || !Array.isArray(payload.candidates)) return null;
  for (const candidate of payload.candidates) {
    if (!isRecord(candidate) || !isRecord(candidate.content) || !Array.isArray(candidate.content.parts)) continue;
    for (const part of candidate.content.parts) {
      if (!isRecord(part) || !isRecord(part.inlineData)) continue;
      const { mimeType, data } = part.inlineData;
      if (typeof mimeType === "string" && /^image\/(png|jpeg|webp)$/.test(mimeType) &&
        typeof data === "string" && data.length >= 100) {
        return { base64: data, mimeType };
      }
    }
  }
  return null;
}

export interface DetectedBox {
  label: string;
  /** Pixel coordinates in the source image. */
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Gemini object detection returns JSON like
 * [{ "label": "phone number", "box_2d": [ymin, xmin, ymax, xmax] }] with values normalised to 0..1000.
 * Converts to pixel boxes, discards anything malformed, and caps the count.
 */
export function parseGeminiBoxes(raw: unknown, imageWidth: number, imageHeight: number): DetectedBox[] {
  let value: unknown = raw;
  if (typeof raw === "string") {
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    try {
      value = JSON.parse(cleaned);
    } catch {
      return [];
    }
  }
  if (isRecord(value) && Array.isArray(value.boxes)) value = value.boxes;
  if (!Array.isArray(value)) return [];
  const boxes: DetectedBox[] = [];
  for (const item of value.slice(0, 20)) {
    if (!isRecord(item) || !Array.isArray(item.box_2d) || item.box_2d.length !== 4) continue;
    const nums = item.box_2d.map(Number);
    if (nums.some((n) => !Number.isFinite(n))) continue;
    const [ymin, xmin, ymax, xmax] = nums.map((n) => Math.min(1000, Math.max(0, n)));
    if (xmax <= xmin || ymax <= ymin) continue;
    const x = Math.round((xmin / 1000) * imageWidth);
    const y = Math.round((ymin / 1000) * imageHeight);
    const width = Math.round(((xmax - xmin) / 1000) * imageWidth);
    const height = Math.round(((ymax - ymin) / 1000) * imageHeight);
    if (width < 2 || height < 2) continue;
    const label = typeof item.label === "string" ? item.label.slice(0, 60) : "teks";
    boxes.push({ label, x, y, width, height });
  }
  return boxes;
}
