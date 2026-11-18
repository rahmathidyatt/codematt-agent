/**
 * Pure resize planning for listing photos (browser canvas does the pixels).
 * No AI involved: resizing is free and unlimited on every plan.
 */

export type ResizeMode = "fit" | "cover";

export interface ResizePreset {
  id: string;
  label: string;
  /** Target box. For "fit" with maxOnly, the photo is only scaled down to fit inside. */
  width: number;
  height: number;
  mode: ResizeMode;
  maxOnly?: boolean;
  format: "image/jpeg" | "image/png";
  quality: number;
}

export const RESIZE_PRESETS: readonly ResizePreset[] = [
  { id: "listing-landscape", label: "Listing portal 1200×800 (3:2)", width: 1200, height: 800, mode: "cover", format: "image/jpeg", quality: 0.85 },
  { id: "ig-feed", label: "Instagram feed 1080×1080", width: 1080, height: 1080, mode: "cover", format: "image/jpeg", quality: 0.9 },
  { id: "ig-portrait", label: "Instagram portrait 1080×1350", width: 1080, height: 1350, mode: "cover", format: "image/jpeg", quality: 0.9 },
  { id: "story", label: "Story dan Reels 1080×1920", width: 1080, height: 1920, mode: "cover", format: "image/jpeg", quality: 0.9 },
  { id: "whatsapp", label: "WhatsApp hemat (maks 1600 px)", width: 1600, height: 1600, mode: "fit", maxOnly: true, format: "image/jpeg", quality: 0.8 },
];

export interface ResizePlan {
  /** Output canvas size. */
  outWidth: number;
  outHeight: number;
  /** Source rectangle to draw (crop for "cover"). */
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export function planResize(srcWidth: number, srcHeight: number, preset: Pick<ResizePreset, "width" | "height" | "mode" | "maxOnly">): ResizePlan {
  if (!(srcWidth > 0 && srcHeight > 0 && preset.width > 0 && preset.height > 0)) {
    throw new RangeError("invalid dimensions");
  }
  if (preset.mode === "fit") {
    let scale = Math.min(preset.width / srcWidth, preset.height / srcHeight);
    if (preset.maxOnly) scale = Math.min(1, scale);
    return {
      outWidth: Math.max(1, Math.round(srcWidth * scale)),
      outHeight: Math.max(1, Math.round(srcHeight * scale)),
      sx: 0,
      sy: 0,
      sw: srcWidth,
      sh: srcHeight,
    };
  }
  // cover: centre-crop the source to the target aspect ratio.
  const targetRatio = preset.width / preset.height;
  const srcRatio = srcWidth / srcHeight;
  let sw = srcWidth;
  let sh = srcHeight;
  if (srcRatio > targetRatio) sw = Math.round(srcHeight * targetRatio);
  else sh = Math.round(srcWidth / targetRatio);
  return {
    outWidth: preset.width,
    outHeight: preset.height,
    sx: Math.round((srcWidth - sw) / 2),
    sy: Math.round((srcHeight - sh) / 2),
    sw,
    sh,
  };
}

/** Pads a region and keeps it inside the image (used when compositing AI output). */
export function padRegion(
  r: { x: number; y: number; width: number; height: number },
  pad: number,
  imageWidth: number,
  imageHeight: number
) {
  const x = Math.max(0, Math.floor(r.x - pad));
  const y = Math.max(0, Math.floor(r.y - pad));
  const right = Math.min(imageWidth, Math.ceil(r.x + r.width + pad));
  const bottom = Math.min(imageHeight, Math.ceil(r.y + r.height + pad));
  return { x, y, width: Math.max(0, right - x), height: Math.max(0, bottom - y) };
}
