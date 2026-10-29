import type { TargetRegion, RedactionPatchMethod } from "./contracts.ts";

export function validateDirectiveInstruction(instruction: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = instruction.trim();
  if (!trimmed) {
    return { valid: false, error: "Instruksi pengeditan tidak boleh kosong" };
  }
  if (trimmed.length < 5) {
    return { valid: false, error: "Instruksi terlalu singkat (minimal 5 karakter)" };
  }
  if (trimmed.length > 250) {
    return { valid: false, error: "Instruksi maksimal 250 karakter" };
  }
  return { valid: true };
}

export function formatRegionCoordinates(region: TargetRegion): string {
  return `X:${Math.round(region.x)}, Y:${Math.round(region.y)}, W:${Math.round(
    region.width
  )}, H:${Math.round(region.height)}`;
}

export function clampRegion(
  region: TargetRegion,
  canvasWidth: number,
  canvasHeight: number
): TargetRegion {
  const x = Math.max(0, Math.min(region.x, canvasWidth - 1));
  const y = Math.max(0, Math.min(region.y, canvasHeight - 1));
  const width = Math.max(2, Math.min(region.width, canvasWidth - x));
  const height = Math.max(2, Math.min(region.height, canvasHeight - y));
  return { x, y, width, height };
}

/**
 * Pixelates strictly within the target region, keeping all surrounding pixels unchanged.
 */
export function applyPixelate(
  ctx: CanvasRenderingContext2D,
  region: TargetRegion,
  blockSize: number = 8
): void {
  const { x, y, width, height } = region;
  if (width <= 0 || height <= 0) return;

  const rx = Math.round(x);
  const ry = Math.round(y);
  const rw = Math.round(width);
  const rh = Math.round(height);

  const imgData = ctx.getImageData(rx, ry, rw, rh);
  const data = imgData.data;

  for (let by = 0; by < rh; by += blockSize) {
    for (let bx = 0; bx < rw; bx += blockSize) {
      // Calculate average color in this block
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let count = 0;

      const blockW = Math.min(blockSize, rw - bx);
      const blockH = Math.min(blockSize, rh - by);

      for (let py = 0; py < blockH; py++) {
        for (let px = 0; px < blockW; px++) {
          const idx = ((by + py) * rw + (bx + px)) * 4;
          rSum += data[idx];
          gSum += data[idx + 1];
          bSum += data[idx + 2];
          count++;
        }
      }

      const rAvg = Math.round(rSum / count);
      const gAvg = Math.round(gSum / count);
      const bAvg = Math.round(bSum / count);

      // Fill block
      for (let py = 0; py < blockH; py++) {
        for (let px = 0; px < blockW; px++) {
          const idx = ((by + py) * rw + (bx + px)) * 4;
          data[idx] = rAvg;
          data[idx + 1] = gAvg;
          data[idx + 2] = bAvg;
        }
      }
    }
  }

  ctx.putImageData(imgData, rx, ry);
}

/**
 * Blurs strictly within the target region, keeping all surrounding pixels unchanged.
 */
export function applyBlur(
  ctx: CanvasRenderingContext2D,
  region: TargetRegion,
  radius: number = 6
): void {
  const { x, y, width, height } = region;
  if (width <= 0 || height <= 0) return;

  const rx = Math.round(x);
  const ry = Math.round(y);
  const rw = Math.round(width);
  const rh = Math.round(height);

  // Use offscreen canvas with filter for crisp performance
  const offscreen = document.createElement("canvas");
  offscreen.width = rw;
  offscreen.height = rh;
  const offCtx = offscreen.getContext("2d");
  if (!offCtx) return;

  offCtx.drawImage(ctx.canvas, rx, ry, rw, rh, 0, 0, rw, rh);
  offCtx.filter = `blur(${radius}px)`;
  offCtx.drawImage(offscreen, 0, 0);

  ctx.drawImage(offscreen, rx, ry);
}

/**
 * Inpaints strictly within the target region by sampling perimeter pixels,
 * calculating linear gradients, and synthesizing a smooth texture blend
 * that seamlessly covers the house number, plate, or phone banner.
 */
export function applySmartInpaint(
  ctx: CanvasRenderingContext2D,
  region: TargetRegion
): void {
  const rx = Math.max(0, Math.round(region.x));
  const ry = Math.max(0, Math.round(region.y));
  const rw = Math.round(region.width);
  const rh = Math.round(region.height);
  const canvasW = ctx.canvas.width;
  const canvasH = ctx.canvas.height;

  // Sample perimeter colors (top, bottom, left, right borders)
  const pad = 4;
  const sampleTopY = Math.max(0, ry - pad);
  const sampleBottomY = Math.min(canvasH - 1, ry + rh + pad);
  const sampleLeftX = Math.max(0, rx - pad);
  const sampleRightX = Math.min(canvasW - 1, rx + rw + pad);

  // Sample 4 cardinal points around the target
  const getPixel = (x: number, y: number) => {
    const p = ctx.getImageData(x, y, 1, 1).data;
    return { r: p[0], g: p[1], b: p[2] };
  };

  const topColor = getPixel(rx + Math.floor(rw / 2), sampleTopY);
  const bottomColor = getPixel(rx + Math.floor(rw / 2), sampleBottomY);
  const leftColor = getPixel(sampleLeftX, ry + Math.floor(rh / 2));
  const rightColor = getPixel(sampleRightX, ry + Math.floor(rh / 2));

  // Create smooth dual gradient blending
  const gradV = ctx.createLinearGradient(rx, ry, rx, ry + rh);
  gradV.addColorStop(0, `rgb(${topColor.r}, ${topColor.g}, ${topColor.b})`);
  gradV.addColorStop(1, `rgb(${bottomColor.r}, ${bottomColor.g}, ${bottomColor.b})`);

  ctx.fillStyle = gradV;
  ctx.fillRect(rx, ry, rw, rh);

  // Cross blend horizontal gradient with 50% opacity for 2D smooth shading
  const gradH = ctx.createLinearGradient(rx, ry, rx + rw, ry);
  gradH.addColorStop(0, `rgba(${leftColor.r}, ${leftColor.g}, ${leftColor.b}, 0.5)`);
  gradH.addColorStop(1, `rgba(${rightColor.r}, ${rightColor.g}, ${rightColor.b}, 0.5)`);

  ctx.fillStyle = gradH;
  ctx.fillRect(rx, ry, rw, rh);

  // Soft feathering on boundary
  ctx.strokeStyle = `rgba(${topColor.r}, ${topColor.g}, ${topColor.b}, 0.2)`;
  ctx.lineWidth = 1;
  ctx.strokeRect(rx, ry, rw, rh);
}

export function getDirectiveMethodLabel(method: RedactionPatchMethod): string {
  switch (method) {
    case "inpaint":
      return "Smart Inpaint (Tekstur Alami)";
    case "blur":
      return "Frosted Privacy Blur";
    case "pixelate":
      return "Mosaic Pixelate";
    case "color_fill":
      return "Neutral Clean Match";
  }
}
