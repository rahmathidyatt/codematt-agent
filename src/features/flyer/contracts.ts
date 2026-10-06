export const flyerSizes = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
  landscape: { width: 1200, height: 628 },
  a4: { width: 2480, height: 3508 }, // 300 DPI; PDF uses 210 × 297 mm.
} as const;
export type FlyerSize = keyof typeof flyerSizes;
export interface FlyerDocument {
  schemaVersion: 1;
  templateId: string;
  templateVersion: number;
  size: FlyerSize;
  headline: string;
  location: string | null;
  priceLabel: string | null;
  highlights: string[];
  photoAssetIds: string[];
  brandKitId: string;
  cta: string;
}
