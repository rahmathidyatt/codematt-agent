import test from "node:test";
import assert from "node:assert/strict";
import {
  formatBytes, parseTargetSize, planDimensions, planUpscale, fitToFileSize, unsharpMask, MAX_OUTPUT_SIDE,
} from "../src/features/photo-tools/photo-math.ts";

test("formatBytes and parseTargetSize", () => {
  assert.equal(formatBytes(512), "512 B");
  assert.equal(formatBytes(200 * 1024), "200 KB");
  assert.match(formatBytes(1.5 * 1024 * 1024), /^1,5 MB$/);
  assert.equal(parseTargetSize("300", "KB"), 300 * 1024);
  assert.equal(parseTargetSize("1,5", "MB"), Math.round(1.5 * 1024 * 1024));
  assert.equal(parseTargetSize("5", "KB"), null);
  assert.equal(parseTargetSize("abc", "KB"), null);
});

test("planDimensions keeps aspect ratio", () => {
  assert.deepEqual(planDimensions(4000, 3000, { width: 1200, keepAspect: true }), { width: 1200, height: 900 });
  assert.deepEqual(planDimensions(4000, 3000, { height: 600, keepAspect: true }), { width: 800, height: 600 });
  assert.deepEqual(planDimensions(4000, 3000, { width: 1000, height: 1000, keepAspect: true }), { width: 1000, height: 750 });
  assert.deepEqual(planDimensions(4000, 3000, { width: 1000, height: 1000, keepAspect: false }), { width: 1000, height: 1000 });
  assert.equal(planDimensions(4000, 3000, { keepAspect: true }), null);
  assert.equal(planDimensions(100, 100, { width: MAX_OUTPUT_SIDE + 1, keepAspect: true }), null);
});

test("planUpscale caps the longest side", () => {
  assert.deepEqual(planUpscale(1000, 500, 2), { width: 2000, height: 1000, factor: 2 });
  const big = planUpscale(4000, 2000, 4);
  assert.equal(big.width, MAX_OUTPUT_SIDE);
  assert.equal(big.factor, 1.5);
});

test("fitToFileSize lowers quality first, then size", async () => {
  // Fake encoder: bytes grow with pixels and quality.
  const encode = async (w, h, q) => Math.round(w * h * q * 0.5);
  const easy = await fitToFileSize(1000, 1000, 400_000, encode);
  assert.equal(easy.reached, true);
  assert.equal(easy.width, 1000);
  assert.ok(easy.bytes <= 400_000);
  const hard = await fitToFileSize(4000, 3000, 200_000, encode);
  assert.equal(hard.reached, true);
  assert.ok(hard.width < 4000);
  assert.ok(hard.bytes <= 200_000);
});

test("unsharpMask increases edge contrast and leaves flat areas", () => {
  const w = 3, h = 3;
  const flat = new Uint8ClampedArray(w * h * 4).fill(100);
  unsharpMask(flat, w, h, 1);
  assert.equal(flat[4 * 4], 100);
  const edge = new Uint8ClampedArray(w * h * 4).fill(50);
  edge[4 * 4] = 200;
  unsharpMask(edge, w, h, 1);
  assert.ok(edge[4 * 4] > 200);
});
