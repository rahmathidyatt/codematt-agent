/**
 * Pure helpers for the "Ukuran & HD" tool. No DOM, no "@/..." imports,
 * so everything here runs under `node --test`.
 */

export const MAX_OUTPUT_SIDE = 6000;

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "-";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toLocaleString("id-ID", { maximumFractionDigits: 0 })} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString("id-ID", { maximumFractionDigits: 2 })} MB`;
}

/** Target file sizes offered as quick picks (bytes). */
export const SIZE_TARGETS = [
  { label: "100 KB", bytes: 100 * 1024 },
  { label: "200 KB", bytes: 200 * 1024 },
  { label: "500 KB", bytes: 500 * 1024 },
  { label: "1 MB", bytes: 1024 * 1024 },
  { label: "2 MB", bytes: 2 * 1024 * 1024 },
] as const;

export function parseTargetSize(value: string, unit: "KB" | "MB"): number | null {
  const n = Number(value.replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return null;
  const bytes = Math.round(n * (unit === "MB" ? 1024 * 1024 : 1024));
  return bytes >= 10 * 1024 && bytes <= 50 * 1024 * 1024 ? bytes : null;
}

/**
 * New dimensions from a width and/or height. With keepAspect, a missing side is
 * derived from the other; if both are given the photo fits inside the box.
 */
export function planDimensions(
  srcWidth: number,
  srcHeight: number,
  opts: { width?: number | null; height?: number | null; keepAspect: boolean }
): { width: number; height: number } | null {
  if (!(srcWidth > 0 && srcHeight > 0)) return null;
  const w = opts.width && opts.width > 0 ? Math.round(opts.width) : null;
  const h = opts.height && opts.height > 0 ? Math.round(opts.height) : null;
  if (!w && !h) return null;
  let width: number;
  let height: number;
  if (!opts.keepAspect) {
    width = w ?? srcWidth;
    height = h ?? srcHeight;
  } else if (w && h) {
    const scale = Math.min(w / srcWidth, h / srcHeight);
    width = Math.round(srcWidth * scale);
    height = Math.round(srcHeight * scale);
  } else if (w) {
    width = w;
    height = Math.round((srcHeight * w) / srcWidth);
  } else {
    height = h as number;
    width = Math.round((srcWidth * (h as number)) / srcHeight);
  }
  if (width < 1 || height < 1 || width > MAX_OUTPUT_SIDE || height > MAX_OUTPUT_SIDE) return null;
  return { width, height };
}

/** Upscale size for "HD", capped so the longest side never exceeds MAX_OUTPUT_SIDE. */
export function planUpscale(srcWidth: number, srcHeight: number, factor: number): { width: number; height: number; factor: number } {
  const longest = Math.max(srcWidth, srcHeight);
  const effective = Math.max(1, Math.min(factor, MAX_OUTPUT_SIDE / longest));
  return {
    width: Math.round(srcWidth * effective),
    height: Math.round(srcHeight * effective),
    factor: Math.round(effective * 100) / 100,
  };
}

export type Encoder = (width: number, height: number, quality: number) => Promise<number>;

/**
 * Finds the best JPEG quality (and, if needed, a smaller size) whose encoded
 * file fits under targetBytes. `encode` returns the byte size for a given
 * width/height/quality; the browser supplies a canvas-based one.
 */
/** Below this JPEG quality artefacts become obvious, so we shrink dimensions instead. */
const MIN_QUALITY = 0.6;

export async function fitToFileSize(
  srcWidth: number,
  srcHeight: number,
  targetBytes: number,
  encode: Encoder
): Promise<{ width: number; height: number; quality: number; bytes: number; reached: boolean }> {
  let width = srcWidth;
  let height = srcHeight;
  let best: { width: number; height: number; quality: number; bytes: number } | null = null;

  for (let round = 0; round < 8; round++) {
    // Binary search quality MIN_QUALITY..0.95 at this size.
    let lo = MIN_QUALITY;
    let hi = 0.95;
    let found: { quality: number; bytes: number } | null = null;
    const top = await encode(width, height, hi);
    if (top <= targetBytes) {
      found = { quality: hi, bytes: top };
    } else {
      for (let i = 0; i < 7; i++) {
        const mid = (lo + hi) / 2;
        const bytes = await encode(width, height, mid);
        if (bytes <= targetBytes) {
          found = { quality: mid, bytes };
          lo = mid;
        } else {
          hi = mid;
        }
      }
    }
    if (found) {
      return { width, height, quality: Math.round(found.quality * 100) / 100, bytes: found.bytes, reached: true };
    }
    const lowest = await encode(width, height, MIN_QUALITY);
    if (!best || lowest < best.bytes) best = { width, height, quality: MIN_QUALITY, bytes: lowest };
    // Still too big at low quality: shrink dimensions roughly by the excess ratio.
    const ratio = Math.sqrt(targetBytes / lowest) * 0.95;
    const scale = Math.max(0.3, Math.min(0.9, ratio));
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
    if (width < 64 || height < 64) break;
  }
  const fallback = best ?? { width, height, quality: MIN_QUALITY, bytes: await encode(width, height, MIN_QUALITY) };
  return { ...fallback, reached: false };
}

/**
 * Unsharp mask on RGBA pixels (in place). amount 0..2, radius 1 (3x3 box blur).
 * Used after upscaling so the HD result does not look soft.
 */
export function unsharpMask(data: Uint8ClampedArray, width: number, height: number, amount: number): void {
  if (amount <= 0 || width < 3 || height < 3) return;
  const src = new Uint8ClampedArray(data);
  const row = width * 4;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * row + x * 4;
      for (let c = 0; c < 3; c++) {
        const k = i + c;
        const blur =
          (src[k - row - 4] + src[k - row] + src[k - row + 4] +
            src[k - 4] + src[k] + src[k + 4] +
            src[k + row - 4] + src[k + row] + src[k + row + 4]) / 9;
        data[k] = src[k] + amount * (src[k] - blur);
      }
    }
  }
}
