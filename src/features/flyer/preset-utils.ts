import type { FlyerPreset, FlyerSize } from "./contracts.ts";

export function formatAspectDisplay(size: FlyerSize): string {
  switch (size) {
    case "square":
      return "1:1 Feed";
    case "portrait":
      return "4:5 Portrait";
    case "story":
      return "9:16 Story / Reels";
    case "landscape":
      return "16:9 Landscape";
    case "a4":
      return "A4 Cetak (300 DPI)";
    default:
      return size;
  }
}

export function validatePresetName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, error: "Nama preset tidak boleh kosong" };
  }
  if (trimmed.length < 3) {
    return { valid: false, error: "Nama preset minimal 3 karakter" };
  }
  if (trimmed.length > 80) {
    return { valid: false, error: "Nama preset maksimal 80 karakter" };
  }
  return { valid: true };
}

export function filterPresets(
  presets: FlyerPreset[],
  query: string,
  categoryFilter: string = "all"
): FlyerPreset[] {
  const q = query.trim().toLowerCase();

  return presets.filter((preset) => {
    // Category check
    if (categoryFilter !== "all") {
      if (categoryFilter === "custom" && preset.isCurated) {
        return false;
      }
      if (categoryFilter === "curated" && !preset.isCurated) {
        return false;
      }
      if (
        categoryFilter !== "custom" &&
        categoryFilter !== "curated" &&
        preset.category !== categoryFilter
      ) {
        return false;
      }
    }

    // Query check
    if (!q) return true;

    return (
      preset.name.toLowerCase().includes(q) ||
      preset.description.toLowerCase().includes(q) ||
      preset.headline.toLowerCase().includes(q) ||
      preset.locationLabel.toLowerCase().includes(q) ||
      preset.size.toLowerCase().includes(q) ||
      preset.template.toLowerCase().includes(q)
    );
  });
}

export function autoDetectCategory(size: FlyerSize): "feed" | "story" | "print" | "landscape" | "custom" {
  if (size === "story") return "story";
  if (size === "a4") return "print";
  if (size === "landscape") return "landscape";
  if (size === "square" || size === "portrait") return "feed";
  return "custom";
}
