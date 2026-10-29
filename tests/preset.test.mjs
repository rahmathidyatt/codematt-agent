import test from "node:test";
import assert from "node:assert/strict";
import {
  formatAspectDisplay,
  validatePresetName,
  filterPresets,
  autoDetectCategory,
} from "../src/features/flyer/preset-utils.ts";

const MOCK_PRESETS = [
  {
    id: "p1",
    name: "Feed Instagram ERA Modern",
    description: "Format 1:1 bersih dengan header lisensi agen",
    category: "feed",
    size: "square",
    template: "modern",
    showBranding: true,
    headline: "Rumah Modern Sentul Hills",
    priceLabel: "Rp 1.85 M",
    locationLabel: "Sentul City",
    highlights: ["SHM", "Bebas Banjir"],
    createdAt: "2026-10-28T08:00:00Z",
    isCurated: true,
  },
  {
    id: "p2",
    name: "Instagram Story Luxury Co-Broke",
    description: "Format 9:16 tema gelap tanpa kontak",
    category: "story",
    size: "story",
    template: "luxury",
    showBranding: false,
    headline: "Apartemen Sudirman Suites",
    priceLabel: "Rp 3.2 M",
    locationLabel: "Jakarta Pusat",
    highlights: ["Yield 9%"],
    createdAt: "2026-10-27T10:00:00Z",
    isCurated: true,
  },
  {
    id: "p3",
    name: "Brosur Custom Rumah Saya",
    description: "Layout custom untuk event akhir pekan",
    category: "custom",
    size: "a4",
    template: "minimal",
    showBranding: true,
    headline: "Kavling Siap Bangun",
    priceLabel: "Rp 900 Juta",
    locationLabel: "BSD City",
    highlights: ["Dekat Tol"],
    createdAt: "2026-10-29T02:00:00Z",
    isCurated: false,
  },
];

test("formatAspectDisplay formats sizes correctly", () => {
  assert.equal(formatAspectDisplay("square"), "1:1 Feed");
  assert.equal(formatAspectDisplay("story"), "9:16 Story / Reels");
  assert.equal(formatAspectDisplay("a4"), "A4 Cetak (300 DPI)");
  assert.equal(formatAspectDisplay("landscape"), "16:9 Landscape");
});

test("validatePresetName validates boundaries and empty strings", () => {
  assert.equal(validatePresetName("").valid, false);
  assert.equal(validatePresetName("   ").valid, false);
  assert.equal(validatePresetName("hi").valid, false);
  assert.equal(validatePresetName("Valid Preset Name").valid, true);
  assert.equal(validatePresetName("a".repeat(81)).valid, false);
});

test("autoDetectCategory maps size to correct category", () => {
  assert.equal(autoDetectCategory("square"), "feed");
  assert.equal(autoDetectCategory("portrait"), "feed");
  assert.equal(autoDetectCategory("story"), "story");
  assert.equal(autoDetectCategory("a4"), "print");
  assert.equal(autoDetectCategory("landscape"), "landscape");
});

test("filterPresets filters by query", () => {
  const result = filterPresets(MOCK_PRESETS, "Sudirman");
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "p2");
});

test("filterPresets filters by category", () => {
  const feedOnly = filterPresets(MOCK_PRESETS, "", "feed");
  assert.equal(feedOnly.length, 1);
  assert.equal(feedOnly[0].id, "p1");

  const customOnly = filterPresets(MOCK_PRESETS, "", "custom");
  assert.equal(customOnly.length, 1);
  assert.equal(customOnly[0].id, "p3");
});
