import "server-only";

export const MAX_IMAGE_BYTES = 7 * 1024 * 1024;
const MAX_FORM_BYTES = MAX_IMAGE_BYTES * 2 + 64 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp"]);

export type ImageForm =
  | { ok: true; form: FormData; image: File }
  | { ok: false; status: number; code: string };

/** Bounded multipart reader: size is checked before the body is parsed. */
export async function readImageForm(req: Request): Promise<ImageForm> {
  const type = req.headers.get("content-type") ?? "";
  if (!type.toLowerCase().startsWith("multipart/form-data")) {
    return { ok: false, status: 415, code: "CONTENT_TYPE_NOT_SUPPORTED" };
  }
  const length = Number(req.headers.get("content-length"));
  if (!Number.isFinite(length) || length <= 0) return { ok: false, status: 411, code: "LENGTH_REQUIRED" };
  if (length > MAX_FORM_BYTES) return { ok: false, status: 413, code: "IMAGE_TOO_LARGE" };
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return { ok: false, status: 400, code: "INVALID_FORM" };
  }
  const image = form.get("image");
  if (!(image instanceof File) || image.size === 0) return { ok: false, status: 400, code: "IMAGE_REQUIRED" };
  if (image.size > MAX_IMAGE_BYTES) return { ok: false, status: 413, code: "IMAGE_TOO_LARGE" };
  if (!ALLOWED.has(image.type)) return { ok: false, status: 415, code: "IMAGE_TYPE_NOT_SUPPORTED" };
  // Check magic bytes; the browser-declared MIME type alone is not trusted.
  const head = new Uint8Array(await image.slice(0, 12).arrayBuffer());
  const isPng = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
  const isJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
  const isWebp = head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46 &&
    head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50;
  const matches = (image.type === "image/png" && isPng) || (image.type === "image/jpeg" && isJpeg) ||
    (image.type === "image/webp" && isWebp);
  if (!matches) return { ok: false, status: 415, code: "IMAGE_TYPE_NOT_SUPPORTED" };
  return { ok: true, form, image };
}

export function readInt(form: FormData, name: string, min: number, max: number): number | null {
  const raw = form.get(name);
  if (typeof raw !== "string" || !/^\d{1,6}$/.test(raw)) return null;
  const n = Number(raw);
  return n >= min && n <= max ? n : null;
}
