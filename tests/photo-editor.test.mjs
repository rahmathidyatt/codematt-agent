import test from "node:test";
import assert from "node:assert/strict";
import {
  validateDirectiveInstruction,
  formatRegionCoordinates,
  clampRegion,
  getDirectiveMethodLabel,
} from "../src/features/photo-editor/photo-utils.ts";

test("validateDirectiveInstruction validates lengths and empty strings", () => {
  assert.equal(validateDirectiveInstruction("").valid, false);
  assert.equal(validateDirectiveInstruction("   ").valid, false);
  assert.equal(validateDirectiveInstruction("blur").valid, false); // < 5 chars
  assert.equal(
    validateDirectiveInstruction("Hapus nomor rumah 42 di pagar depan").valid,
    true
  );
  assert.equal(validateDirectiveInstruction("a".repeat(251)).valid, false);
});

test("formatRegionCoordinates formats X, Y, W, H correctly", () => {
  const formatted = formatRegionCoordinates({
    x: 120.4,
    y: 85.9,
    width: 200.1,
    height: 150.8,
  });
  assert.equal(formatted, "X:120, Y:86, W:200, H:151");
});

test("clampRegion restricts coordinates within canvas boundaries", () => {
  const clamped1 = clampRegion({ x: -10, y: -20, width: 50, height: 50 }, 800, 600);
  assert.equal(clamped1.x, 0);
  assert.equal(clamped1.y, 0);

  const clamped2 = clampRegion({ x: 750, y: 550, width: 100, height: 100 }, 800, 600);
  assert.equal(clamped2.width, 50);
  assert.equal(clamped2.height, 50);
});

test("getDirectiveMethodLabel returns human readable labels", () => {
  assert.ok(getDirectiveMethodLabel("inpaint").includes("Inpaint"));
  assert.ok(getDirectiveMethodLabel("blur").includes("Blur"));
  assert.ok(getDirectiveMethodLabel("pixelate").includes("Pixelate"));
});
