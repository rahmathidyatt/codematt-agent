import "server-only";
import { GoogleGenAI } from "@google/genai";
import { ProviderError, withTimeout } from "@/lib/ai/chat-providers";
import { parseGeminiBoxes, readGeminiImage, readOpenAIImage, type DetectedBox } from "@/lib/ai/provider-parsers";

export type ImageProvider = "google" | "openai";

export interface EditRegion { x: number; y: number; width: number; height: number }

const TIMEOUT_MS = 90_000;

export function imageModelFor(provider: ImageProvider, env: NodeJS.ProcessEnv = process.env): string {
  return provider === "openai"
    ? env.CODEMATT_OPENAI_IMAGE_MODEL?.trim() || "gpt-image-2"
    : env.CODEMATT_GEMINI_IMAGE_MODEL?.trim() || "gemini-3.1-flash-image";
}

export function describeRegions(regions: EditRegion[], width: number, height: number): string {
  return regions
    .map((r, i) => {
      const pct = (v: number, total: number) => Math.round((v / total) * 100);
      return `area ${i + 1}: kiri ${pct(r.x, width)}%, atas ${pct(r.y, height)}%, ` +
        `lebar ${pct(r.width, width)}%, tinggi ${pct(r.height, height)}%`;
    })
    .join("; ");
}

function editPrompt(instruction: string, regions: EditRegion[], width: number, height: number): string {
  return [
    "Edit foto properti ini untuk iklan. Tugas: " + instruction,
    regions.length ? "Hanya ubah bagian berikut (posisi relatif terhadap foto): " + describeRegions(regions, width, height) + "." : "",
    "Isi area yang dihapus dengan tekstur sekitarnya (tembok, pagar, langit, dsb) sehingga terlihat alami.",
    "Jangan ubah bangunan, warna, pencahayaan, sudut kamera, atau bagian lain dari foto.",
    "Jangan menambahkan teks, logo, watermark, orang, atau objek baru.",
  ].filter(Boolean).join(" ");
}

export async function editImage(input: {
  provider: ImageProvider;
  image: Blob;
  mimeType: string;
  mask: Blob | null;
  instruction: string;
  regions: EditRegion[];
  width: number;
  height: number;
}): Promise<{ base64: string; mimeType: string; model: string }> {
  const model = imageModelFor(input.provider);
  const prompt = editPrompt(input.instruction, input.regions, input.width, input.height);

  if (input.provider === "openai") {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new ProviderError("PROVIDER_NOT_CONFIGURED");
    const form = new FormData();
    form.append("model", model);
    form.append("prompt", prompt);
    form.append("n", "1");
    form.append("image", input.image, "photo." + (input.mimeType.split("/")[1] || "png"));
    if (input.mask) form.append("mask", input.mask, "mask.png");
    let response: Response;
    try {
      response = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}` },
        body: form,
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch {
      throw new ProviderError("PROVIDER_FAILED");
    }
    if (!response.ok) throw new ProviderError("PROVIDER_FAILED");
    const parsed = readOpenAIImage(await response.json());
    if (!parsed) throw new ProviderError("PROVIDER_REFUSED");
    return { ...parsed, model };
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new ProviderError("PROVIDER_NOT_CONFIGURED");
  const ai = new GoogleGenAI({ apiKey: key });
  const data = Buffer.from(await input.image.arrayBuffer()).toString("base64");
  const result = await withTimeout(ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ inlineData: { mimeType: input.mimeType, data } }, { text: prompt }] }],
    config: { responseModalities: ["IMAGE"] },
  }), TIMEOUT_MS).then((r) => r, () => null);
  if (!result) throw new ProviderError("PROVIDER_FAILED");
  const parsed = readGeminiImage(result);
  if (!parsed) throw new ProviderError("PROVIDER_REFUSED");
  return { ...parsed, model };
}

/** Finds house numbers, phone numbers, plates and old banners with Gemini vision. */
export async function detectSensitiveText(input: {
  image: Blob;
  mimeType: string;
  width: number;
  height: number;
}): Promise<DetectedBox[]> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new ProviderError("PROVIDER_NOT_CONFIGURED");
  const model = process.env.CODEMATT_GEMINI_MODEL?.trim() || "gemini-flash-latest";
  const ai = new GoogleGenAI({ apiKey: key });
  const data = Buffer.from(await input.image.arrayBuffer()).toString("base64");
  const prompt =
    "Deteksi semua nomor rumah, nomor telepon/HP, plat nomor kendaraan, dan spanduk/papan berisi kontak " +
    "pada foto properti ini. Kembalikan JSON array saja, tiap item: " +
    '{"label": "<nomor rumah|nomor telepon|plat nomor|spanduk>", "box_2d": [ymin, xmin, ymax, xmax]} ' +
    "dengan koordinat dinormalisasi 0-1000. Jika tidak ada, kembalikan [].";
  const result = await withTimeout(ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ inlineData: { mimeType: input.mimeType, data } }, { text: prompt }] }],
    config: { responseMimeType: "application/json", maxOutputTokens: 1_024 },
  }), 30_000).then((r) => r, () => null);
  if (!result) throw new ProviderError("PROVIDER_FAILED");
  return parseGeminiBoxes(result.text ?? "", input.width, input.height);
}

/**
 * "HD with AI": asks Gemini to redraw the same photo sharper and cleaner.
 * The browser then scales the result to the requested size. Generative
 * models can alter small details, so the UI tells the agent to compare.
 */
export async function enhanceImage(input: { image: Blob; mimeType: string }): Promise<{ base64: string; mimeType: string; model: string }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new ProviderError("PROVIDER_NOT_CONFIGURED");
  const model = imageModelFor("google");
  const ai = new GoogleGenAI({ apiKey: key });
  const data = Buffer.from(await input.image.arrayBuffer()).toString("base64");
  const prompt = [
    "Perjelas foto properti ini agar terlihat tajam dan berkualitas tinggi (HD).",
    "Kurangi blur, noise, dan efek kompresi; perbaiki ketajaman tepi dan tekstur.",
    "Pertahankan isi foto persis sama: bangunan, ruangan, warna, pencahayaan, sudut kamera, dan semua objek.",
    "Jangan menambah, menghapus, atau memindahkan objek. Jangan menambahkan teks atau watermark.",
  ].join(" ");
  const result = await withTimeout(ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ inlineData: { mimeType: input.mimeType, data } }, { text: prompt }] }],
    config: { responseModalities: ["IMAGE"] },
  }), TIMEOUT_MS).then((r) => r, () => null);
  if (!result) throw new ProviderError("PROVIDER_FAILED");
  const parsed = readGeminiImage(result);
  if (!parsed) throw new ProviderError("PROVIDER_REFUSED");
  return { ...parsed, model };
}
