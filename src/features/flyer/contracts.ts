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

export interface FlyerExportRecord {
  id: string;
  filename: string;
  headline: string;
  size: FlyerSize;
  dimensions: string;
  template: "modern" | "luxury" | "minimal";
  mode: "branded" | "clean";
  exportedAt: string;
  fileFormat: "PNG" | "PDF";
  dpi: number;
  status: "verified" | "completed" | "processing";
  verificationHash: string;
  fileSizeApprox: string;
}

export interface FlyerPreset {
  id: string;
  name: string;
  description: string;
  category: "feed" | "story" | "print" | "landscape" | "custom";
  size: FlyerSize;
  template: "modern" | "luxury" | "minimal";
  showBranding: boolean;
  headline: string;
  priceLabel: string;
  locationLabel: string;
  highlights: string[];
  qrDestination?: string;
  createdAt: string;
  isCurated?: boolean;
}

export const DEFAULT_FLYER_PRESETS: FlyerPreset[] = [
  {
    id: "preset-feed-modern",
    name: "Feed Instagram ERA Modern",
    description: "Format kotak 1:1 bersih dengan header lisensi agen & QR WhatsApp langsung ke calon pembeli.",
    category: "feed",
    size: "square",
    template: "modern",
    showBranding: true,
    headline: "Rumah Modern Tropis Sentul Hills",
    priceLabel: "Rp 1.85 Milyar",
    locationLabel: "Sentul City, Babakan Madang, Bogor",
    highlights: ["SHM Clear", "Bebas Banjir", "Row 8 Meter", "Bisa KPR"],
    createdAt: "2026-10-28T08:00:00Z",
    isCurated: true,
  },
  {
    id: "preset-story-luxury",
    name: "Instagram Story Luxury Co-Broke",
    description: "Format 9:16 elegan bertema gelap tanpa kontak agen. Cocok untuk share ke grup sesama agen (MLS / co-broking).",
    category: "story",
    size: "story",
    template: "luxury",
    showBranding: false,
    headline: "Apartemen Sudirman Suites 2BR High Floor",
    priceLabel: "Rp 3.20 Milyar",
    locationLabel: "Jl. Jend. Sudirman Kav. 32, Jakarta Pusat",
    highlights: ["High Rental Yield", "Full Furnished", "Private Access", "View City"],
    createdAt: "2026-10-27T10:00:00Z",
    isCurated: true,
  },
  {
    id: "preset-a4-openhouse",
    name: "Brosur Cetak A4 Open House",
    description: "Format vertikal 300 DPI siap cetak untuk brosur pameran, event open house, atau mading perumahan.",
    category: "print",
    size: "a4",
    template: "modern",
    showBranding: true,
    headline: "Grand Open House Sentul Cluster",
    priceLabel: "Mulai Rp 1.85 M",
    locationLabel: "Cluster Sentul Hills, Bogor",
    highlights: ["Cash Keras Diskon 5%", "Hadiah Smart Door Lock", "Free Biaya BPHTB", "Unit Terbatas"],
    createdAt: "2026-10-26T12:00:00Z",
    isCurated: true,
  },
  {
    id: "preset-landscape-ads",
    name: "Iklan Facebook & Portal Banner",
    description: "Rasio 1200×628 ideal untuk Facebook Ads, website carousel, atau banner WhatsApp blast.",
    category: "landscape",
    size: "landscape",
    template: "luxury",
    showBranding: true,
    headline: "Investasi Sudirman Suites 2BR Luxury",
    priceLabel: "Rp 3.2 Milyar (Nego)",
    locationLabel: "Sudirman CBD, Jakarta Pusat",
    highlights: ["Rental Yield 9%/Thn", "Tenant Expats Aktif", "Terhubung MRT", "Strata Title"],
    createdAt: "2026-10-25T15:30:00Z",
    isCurated: true,
  },
  {
    id: "preset-minimal-villa",
    name: "Minimalist Villa & Land Showcase",
    description: "Desain monokrom elegan dengan tata letak minimalis untuk properti resort, villa, atau kavling premium.",
    category: "feed",
    size: "square",
    template: "minimal",
    showBranding: true,
    headline: "Private Villa & Mountain Retreat",
    priceLabel: "Rp 4.75 Milyar",
    locationLabel: "Megamendung, Puncak, Bogor",
    highlights: ["Luas Tanah 1.200 m²", "Private Pool", "Udara Sejuk 18°C", "SHM Ready"],
    createdAt: "2026-10-24T11:00:00Z",
    isCurated: true,
  },
];
