import test from "node:test";
import assert from "node:assert/strict";
import {
  validateStep1,
  validateStep2,
  calculateOnboardingProgress,
  formatWhatsAppLink,
  getRecommendedStarterPreset,
} from "../src/features/onboarding/onboarding-utils.ts";

test("validateStep1 catches invalid name, office, or phone", () => {
  const resultBad = validateStep1({
    agentName: "A",
    agencyOffice: "",
    whatsappNumber: "123",
  });
  assert.equal(resultBad.isValid, false);
  assert.ok(resultBad.errors.agentName);
  assert.ok(resultBad.errors.agencyOffice);
  assert.ok(resultBad.errors.whatsappNumber);

  const resultGood = validateStep1({
    agentName: "Rahmat Hidayat",
    agencyOffice: "Brighton Grand",
    whatsappNumber: "081234567890",
  });
  assert.equal(resultGood.isValid, true);
  assert.equal(Object.keys(resultGood.errors).length, 0);
});

test("validateStep2 ensures valid hex color", () => {
  assert.equal(validateStep2({ primaryColor: "#f5b800" }).isValid, true);
  assert.equal(validateStep2({ primaryColor: "f5b800" }).isValid, false);
  assert.equal(validateStep2({ primaryColor: "#xyz" }).isValid, false);
});

test("calculateOnboardingProgress computes accurate percentage", () => {
  assert.equal(calculateOnboardingProgress(1, 3), 33);
  assert.equal(calculateOnboardingProgress(2, 3), 67);
  assert.equal(calculateOnboardingProgress(3, 3), 100);
  assert.equal(calculateOnboardingProgress(4, 3), 100);
});

test("formatWhatsAppLink sanitizes phone and builds wa.me deep link", () => {
  const link = formatWhatsAppLink("0812-3456-7890", "Rahmat");
  assert.ok(link.startsWith("https://wa.me/6281234567890"));
  assert.ok(link.includes("Rahmat"));
});

test("getRecommendedStarterPreset maps tools to valid paths and metadata", () => {
  const flyerPreset = getRecommendedStarterPreset("flyer");
  assert.equal(flyerPreset.path, "/flyer");
  assert.ok(flyerPreset.title.includes("Flyer Studio"));

  const editorPreset = getRecommendedStarterPreset("photo-editor");
  assert.equal(editorPreset.path, "/photo-editor");
});
