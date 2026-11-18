import test from "node:test";
import assert from "node:assert/strict";
import { planResize, padRegion, RESIZE_PRESETS } from "../src/features/photo-editor/resize.ts";

test("cover crops the centre to the target ratio", () => {
  const plan = planResize(4000, 3000, { width: 1080, height: 1080, mode: "cover" });
  assert.deepEqual(plan, { outWidth: 1080, outHeight: 1080, sx: 500, sy: 0, sw: 3000, sh: 3000 });
  const tall = planResize(1000, 2000, { width: 1200, height: 800, mode: "cover" });
  assert.equal(tall.sw, 1000);
  assert.equal(tall.sh, 667);
  assert.equal(tall.sy, 667);
});

test("fit with maxOnly never upscales", () => {
  const small = planResize(800, 600, { width: 1600, height: 1600, mode: "fit", maxOnly: true });
  assert.equal(small.outWidth, 800);
  const big = planResize(4000, 3000, { width: 1600, height: 1600, mode: "fit", maxOnly: true });
  assert.deepEqual([big.outWidth, big.outHeight], [1600, 1200]);
});

test("invalid sizes throw, presets are sane", () => {
  assert.throws(() => planResize(0, 100, { width: 10, height: 10, mode: "fit" }));
  for (const p of RESIZE_PRESETS) assert.ok(p.quality > 0 && p.quality <= 1);
});

test("padRegion stays inside the image", () => {
  assert.deepEqual(padRegion({ x: 5, y: 5, width: 10, height: 10 }, 8, 18, 100), { x: 0, y: 0, width: 18, height: 23 });
});
