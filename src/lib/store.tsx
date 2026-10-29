"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  FlyerDocument,
  FlyerExportRecord,
  FlyerPreset,
  DEFAULT_FLYER_PRESETS,
} from "@/features/flyer/contracts";
import type { LedgerEntry, PlanTierId } from "@/features/ledger/contracts";
import { getTierLimits, generateIdempotencyKey } from "@/features/ledger/ledger-utils";

export interface BetaFeedback {
  id: string;
  rating: number;
  category: "feature" | "performance" | "ux" | "accuracy" | "pricing";
  feedback: string;
  agentName: string;
  agencyOffice: string;
  createdAt: string;
}

export interface AgentProfile {
  name: string;
  title: string;
  agency: string;
  office: string;
  phone: string;
  whatsapp: string;
  email: string;
  license: string;
  primaryColor: string;
  secondaryColor: string;
  logoText: string;
  defaultCta: string;
}

export interface PropertyListing {
  id: string;
  name: string;
  type: "Rumah" | "Apartemen" | "Ruko" | "Tanah" | "Villa" | "Gudang";
  transactionType: "Dijual" | "Disewa";
  location: string;
  price: number;
  currency: "IDR" | "USD";
  landSize: number;
  buildingSize: number;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  parking: number;
  certificate: string;
  furnishing: "Unfurnished" | "Semi-Furnished" | "Full-Furnished";
  condition: "Baru / Brand New" | "Bagus Siap Huni" | "Perlu Renovasi";
  facilities: string[];
  highlights: string[];
  notes?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface GeneratedCopy {
  style: "emotional" | "investor" | "formal";
  headline: string;
  body: string;
  bullets: string[];
  cta: string;
}

export interface UsageState {
  aiRequestsUsed: number;
  aiRequestsLimit: number;
  flyerExportsUsed: number;
  flyerExportsLimit: number;
  storageBytesUsed: number;
  storageBytesLimit: number;
  planId: "free" | "starter" | "pro" | "team";
  periodEnd: string;
}

interface AgentStoreContextType {
  agent: AgentProfile;
  updateAgent: (profile: Partial<AgentProfile>) => void;
  listings: PropertyListing[];
  addListing: (listing: Omit<PropertyListing, "id" | "createdAt">) => PropertyListing;
  updateListing: (id: string, listing: Partial<PropertyListing>) => void;
  deleteListing: (id: string) => void;
  flyers: FlyerDocument[];
  addFlyer: (flyer: FlyerDocument) => void;
  flyerExports: FlyerExportRecord[];
  addFlyerExport: (record: Omit<FlyerExportRecord, "id" | "exportedAt"> & { exportedAt?: string }) => FlyerExportRecord;
  deleteFlyerExport: (id: string) => void;
  clearFlyerExports: () => void;
  flyerPresets: FlyerPreset[];
  saveFlyerPreset: (preset: Omit<FlyerPreset, "id" | "createdAt">) => FlyerPreset;
  deleteFlyerPreset: (id: string) => void;
  resetFlyerPresetsToDefault: () => void;
  usage: UsageState;
  updatePlanTier: (planId: PlanTierId) => void;
  resetUsage: () => void;
  recordAiUsage: () => boolean;
  recordFlyerExport: () => boolean;
  ledgerEntries: LedgerEntry[];
  recordLedgerTransaction: (
    entry: Omit<LedgerEntry, "id" | "timestamp" | "idempotencyKey"> & { idempotencyKey?: string }
  ) => LedgerEntry;
  onboardingCompleted: boolean;
  setOnboardingCompleted: (val: boolean) => void;
  betaFeedbackList: BetaFeedback[];
  addBetaFeedback: (
    feedback: Omit<BetaFeedback, "id" | "createdAt">
  ) => BetaFeedback;
  locale: "id" | "en";
  setLocale: (l: "id" | "en") => void;
  theme: "light" | "dark" | "system";
  setTheme: (t: "light" | "dark" | "system") => void;
}

const DEFAULT_AGENT: AgentProfile = {
  name: "Rahmat Hidayat",
  title: "Senior Property Consultant",
  agency: "Brighton Real Estate · Brighton Grand",
  office: "Surabaya, Jakarta & BSD City",
  phone: "0812-3456-7890",
  whatsapp: "6281234567890",
  email: "rahmat.agent@brighton.co.id",
  license: "AREBI-BRIGHTON-88291",
  primaryColor: "#f5b800",
  secondaryColor: "#171717",
  logoText: "Brighton Real Estate",
  defaultCta: "Hubungi WhatsApp untuk jadwal survei lokasi & penawaran terbaik",
};

const INITIAL_LISTINGS: PropertyListing[] = [
  {
    id: "lst-01",
    name: "Rumah Modern Tropis Sentul Hills",
    type: "Rumah",
    transactionType: "Dijual",
    location: "Sentul City, Babakan Madang, Bogor",
    price: 1850000000,
    currency: "IDR",
    landSize: 120,
    buildingSize: 145,
    bedrooms: 3,
    bathrooms: 2,
    floors: 2,
    parking: 2,
    certificate: "SHM (Sertifikat Hak Milik)",
    furnishing: "Semi-Furnished",
    condition: "Baru / Brand New",
    facilities: ["Smart Door Lock", "Club House", "Kolam Renang", "One Gate 24/7 Security", "Dekat Exit Tol Sentul"],
    highlights: ["Row jalan lebar 8 meter", "View pegunungan alami sejuk", "Bebas banjir 100%", "KPR dibantu sampai approved"],
    notes: "Owner butuh cepat, harga masih nego tipis untuk pembeli cash keras.",
    photoUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-10-28T09:00:00Z",
  },
  {
    id: "lst-02",
    name: "Apartemen Sudirman Suites 2BR High Floor",
    type: "Apartemen",
    transactionType: "Dijual",
    location: "Jl. Jend. Sudirman Kav. 32, Jakarta Pusat",
    price: 3200000000,
    currency: "IDR",
    landSize: 0,
    buildingSize: 68,
    bedrooms: 2,
    bathrooms: 1,
    floors: 32,
    parking: 1,
    certificate: "Strata Title (HGB Murni)",
    furnishing: "Full-Furnished",
    condition: "Bagus Siap Huni",
    facilities: ["Infinity Pool", "Sky Gym", "Private Access Card", "Concierge 24 Jam", "Langsung Terhubung MRT Bendungan Hilir"],
    highlights: ["Rental yield tinggi 8-9% per tahun", "Penyewa ekspatriat aktif", "Desain interior Scandinavian mewah"],
    notes: "Potensi passive income Rp 180 Juta / tahun.",
    photoUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-10-27T14:30:00Z",
  },
];

const INITIAL_FLYER_EXPORTS: FlyerExportRecord[] = [
  {
    id: "exp-01",
    filename: "Flyer-Rumah-Modern-Tropis-Sentul-Hills-square-branded.png",
    headline: "Rumah Modern Tropis Sentul Hills",
    size: "square",
    dimensions: "1080 × 1080 px",
    template: "modern",
    mode: "branded",
    exportedAt: "2026-10-28T14:32:00Z",
    fileFormat: "PNG",
    dpi: 300,
    status: "verified",
    verificationHash: "SHA256:8f92a15c...bc40",
    fileSizeApprox: "1.4 MB",
  },
  {
    id: "exp-02",
    filename: "Flyer-Apartemen-Sudirman-Suites-story-clean-unbranded.png",
    headline: "Apartemen Sudirman Suites 2BR High Floor",
    size: "story",
    dimensions: "1080 × 1920 px",
    template: "luxury",
    mode: "clean",
    exportedAt: "2026-10-27T10:15:00Z",
    fileFormat: "PNG",
    dpi: 300,
    status: "verified",
    verificationHash: "SHA256:3d71e29a...5e89",
    fileSizeApprox: "1.8 MB",
  },
  {
    id: "exp-03",
    filename: "Flyer-Rumah-Modern-Tropis-Sentul-Hills-a4-branded.png",
    headline: "Rumah Modern Tropis Sentul Hills",
    size: "a4",
    dimensions: "2480 × 3508 px",
    template: "modern",
    mode: "branded",
    exportedAt: "2026-10-26T16:48:00Z",
    fileFormat: "PNG",
    dpi: 300,
    status: "verified",
    verificationHash: "SHA256:e4b091f3...92fa",
    fileSizeApprox: "3.2 MB",
  },
];

const INITIAL_USAGE: UsageState = {
  aiRequestsUsed: 18,
  aiRequestsLimit: 150,
  flyerExportsUsed: 7,
  flyerExportsLimit: 50,
  storageBytesUsed: 24500000, // ~24.5 MB
  storageBytesLimit: 1073741824, // 1 GB
  planId: "starter",
  periodEnd: "30 November 2026",
};

const INITIAL_LEDGER_ENTRIES: LedgerEntry[] = [
  {
    id: "led-01",
    idempotencyKey: "idemp_plan_init_001",
    timestamp: "2026-10-28T08:00:00Z",
    action: "TIER_CHANGE",
    service: "PLAN_UPGRADE",
    units: 1,
    status: "COMMITTED",
    balanceAfter: 150,
    note: "Aktivasi Paket Starter Pro (Batas 150 AI / 50 Flyer)",
  },
  {
    id: "led-02",
    idempotencyKey: "idemp_ai_gen_002",
    timestamp: "2026-10-28T14:10:00Z",
    action: "COMMIT",
    service: "AI_GENERATION",
    units: 1,
    status: "COMMITTED",
    balanceAfter: 149,
    note: "Generasi Copywriting Listing 3 Sudut Pandang (Sentul Hills)",
  },
  {
    id: "led-03",
    idempotencyKey: "idemp_flyer_exp_003",
    timestamp: "2026-10-28T14:32:00Z",
    action: "COMMIT",
    service: "FLYER_EXPORT",
    units: 1,
    status: "COMMITTED",
    balanceAfter: 49,
    note: "Ekspor Flyer 300 DPI Square Branded (SHA256 terverifikasi)",
  },
];

const INITIAL_BETA_FEEDBACK: BetaFeedback[] = [
  {
    id: "fb-01",
    rating: 5,
    category: "accuracy",
    feedback: "Fitur validasi fakta dua sisi sangat membantu! Tidak pernah ada salah harga atau luas tanah lagi di draf listing.",
    agentName: "Rahmat Hidayat",
    agencyOffice: "Brighton Grand Surabaya",
    createdAt: "2026-10-28T16:00:00Z",
  },
  {
    id: "fb-02",
    rating: 5,
    category: "feature",
    feedback: "Fitur sensor foto properti untuk plat nomor rumah No. 42 dan mobil sangat rapi, hasilnya langsung siap tayang di portal.",
    agentName: "Maria Kusuma",
    agencyOffice: "Brighton Central Jakarta",
    createdAt: "2026-10-27T11:20:00Z",
  },
];

const AgentStoreContext = createContext<AgentStoreContextType | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [agent, setAgent] = useState<AgentProfile>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("codematt_agent_profile");
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return DEFAULT_AGENT;
  });

  const [listings, setListings] = useState<PropertyListing[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("codematt_listings");
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return INITIAL_LISTINGS;
  });

  const [flyers, setFlyers] = useState<FlyerDocument[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("codematt_flyers");
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return [];
  });

  const [flyerExports, setFlyerExports] = useState<FlyerExportRecord[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("codematt_flyer_exports");
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return INITIAL_FLYER_EXPORTS;
  });

  const [flyerPresets, setFlyerPresets] = useState<FlyerPreset[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("codematt_flyer_presets");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch { /* ignore */ }
      }
    }
    return DEFAULT_FLYER_PRESETS;
  });

  const [usage, setUsage] = useState<UsageState>(INITIAL_USAGE);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("codematt_ledger_entries");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch { /* ignore */ }
      }
    }
    return INITIAL_LEDGER_ENTRIES;
  });

  const [onboardingCompleted, setOnboardingCompletedState] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("codematt_onboarding_completed") === "true";
    }
    return false;
  });

  const [betaFeedbackList, setBetaFeedbackList] = useState<BetaFeedback[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("codematt_beta_feedback");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch { /* ignore */ }
      }
    }
    return INITIAL_BETA_FEEDBACK;
  });

  const [locale, setLocaleState] = useState<"id" | "en">("id");
  const [theme, setThemeState] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("codematt_ledger_entries", JSON.stringify(ledgerEntries));
    }
  }, [ledgerEntries]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("codematt_beta_feedback", JSON.stringify(betaFeedbackList));
    }
  }, [betaFeedbackList]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("codematt_agent_profile", JSON.stringify(agent));
    }
  }, [agent]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("codematt_listings", JSON.stringify(listings));
    }
  }, [listings]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("codematt_flyers", JSON.stringify(flyers));
    }
  }, [flyers]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("codematt_flyer_exports", JSON.stringify(flyerExports));
    }
  }, [flyerExports]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("codematt_flyer_presets", JSON.stringify(flyerPresets));
    }
  }, [flyerPresets]);

  // Apply theme class to html/root
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  }, [theme]);

  const updateAgent = (profile: Partial<AgentProfile>) => {
    setAgent((prev) => ({ ...prev, ...profile }));
  };

  const addListing = (data: Omit<PropertyListing, "id" | "createdAt">) => {
    const newListing: PropertyListing = {
      ...data,
      id: `lst-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setListings((prev) => [newListing, ...prev]);
    return newListing;
  };

  const updateListing = (id: string, updated: Partial<PropertyListing>) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updated } : l))
    );
  };

  const deleteListing = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  const addFlyer = (flyer: FlyerDocument) => {
    setFlyers((prev) => [flyer, ...prev]);
  };

  const addFlyerExport = (
    data: Omit<FlyerExportRecord, "id" | "exportedAt"> & { exportedAt?: string }
  ) => {
    const newRecord: FlyerExportRecord = {
      ...data,
      id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      exportedAt: data.exportedAt || new Date().toISOString(),
    };
    setFlyerExports((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const deleteFlyerExport = (id: string) => {
    setFlyerExports((prev) => prev.filter((r) => r.id !== id));
  };

  const clearFlyerExports = () => {
    setFlyerExports([]);
  };

  const saveFlyerPreset = (
    data: Omit<FlyerPreset, "id" | "createdAt">
  ): FlyerPreset => {
    const newPreset: FlyerPreset = {
      ...data,
      id: `preset-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      isCurated: false,
    };
    setFlyerPresets((prev) => [newPreset, ...prev]);
    return newPreset;
  };

  const deleteFlyerPreset = (id: string) => {
    setFlyerPresets((prev) => prev.filter((p) => p.id !== id));
  };

  const resetFlyerPresetsToDefault = () => {
    setFlyerPresets(DEFAULT_FLYER_PRESETS);
  };

  const updatePlanTier = (planId: PlanTierId) => {
    const limits = getTierLimits(planId);
    setUsage((prev) => ({
      ...prev,
      planId,
      aiRequestsLimit: limits.aiRequestsLimit,
      flyerExportsLimit: limits.flyerExportsLimit,
      storageBytesLimit: limits.storageBytesLimit,
    }));
    const key = generateIdempotencyKey("plan_tier");
    recordLedgerTransaction({
      idempotencyKey: key,
      action: "TIER_CHANGE",
      service: "PLAN_UPGRADE",
      units: 1,
      status: "COMMITTED",
      balanceAfter: limits.aiRequestsLimit,
      note: `Upgrade ke paket ${planId.toUpperCase()} (Batas ${limits.aiRequestsLimit} AI / ${limits.flyerExportsLimit} Flyer)`,
    });
  };

  const resetUsage = () => {
    setUsage((prev) => ({
      ...prev,
      aiRequestsUsed: 0,
      flyerExportsUsed: 0,
    }));
    const key = generateIdempotencyKey("quota_reset");
    recordLedgerTransaction({
      idempotencyKey: key,
      action: "RESET",
      service: "ADMIN_RESET",
      units: 0,
      status: "COMMITTED",
      balanceAfter: usage.aiRequestsLimit,
      note: "Reset siklus pemakaian bulanan tuntas",
    });
  };

  const recordLedgerTransaction = (
    data: Omit<LedgerEntry, "id" | "timestamp" | "idempotencyKey"> & { idempotencyKey?: string }
  ): LedgerEntry => {
    const newEntry: LedgerEntry = {
      ...data,
      id: `led-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      idempotencyKey: data.idempotencyKey || generateIdempotencyKey(data.service),
      timestamp: new Date().toISOString(),
    };
    setLedgerEntries((prev) => [newEntry, ...prev]);
    return newEntry;
  };

  const setOnboardingCompleted = (val: boolean) => {
    setOnboardingCompletedState(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("codematt_onboarding_completed", val ? "true" : "false");
    }
  };

  const addBetaFeedback = (
    data: Omit<BetaFeedback, "id" | "createdAt">
  ): BetaFeedback => {
    const newFb: BetaFeedback = {
      ...data,
      id: `fb-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setBetaFeedbackList((prev) => [newFb, ...prev]);
    return newFb;
  };

  const recordAiUsage = () => {
    if (usage.aiRequestsUsed >= usage.aiRequestsLimit) return false;
    setUsage((prev) => ({
      ...prev,
      aiRequestsUsed: prev.aiRequestsUsed + 1,
    }));
    recordLedgerTransaction({
      action: "COMMIT",
      service: "AI_GENERATION",
      units: 1,
      status: "COMMITTED",
      balanceAfter: Math.max(0, usage.aiRequestsLimit - (usage.aiRequestsUsed + 1)),
      note: "Pemakaian komputasi AI Copilot",
    });
    return true;
  };

  const recordFlyerExport = () => {
    if (usage.flyerExportsUsed >= usage.flyerExportsLimit) return false;
    setUsage((prev) => ({
      ...prev,
      flyerExportsUsed: prev.flyerExportsUsed + 1,
    }));
    recordLedgerTransaction({
      action: "COMMIT",
      service: "FLYER_EXPORT",
      units: 1,
      status: "COMMITTED",
      balanceAfter: Math.max(0, usage.flyerExportsLimit - (usage.flyerExportsUsed + 1)),
      note: "Ekspor flyer grafis 300 DPI siap cetak",
    });
    return true;
  };

  const setLocale = (l: "id" | "en") => {
    setLocaleState(l);
  };

  const setTheme = (t: "light" | "dark" | "system") => {
    setThemeState(t);
  };

  return (
    <AgentStoreContext.Provider
      value={{
        agent,
        updateAgent,
        listings,
        addListing,
        updateListing,
        deleteListing,
        flyers,
        addFlyer,
        flyerExports,
        addFlyerExport,
        deleteFlyerExport,
        clearFlyerExports,
        flyerPresets,
        saveFlyerPreset,
        deleteFlyerPreset,
        resetFlyerPresetsToDefault,
        usage,
        updatePlanTier,
        resetUsage,
        recordAiUsage,
        recordFlyerExport,
        ledgerEntries,
        recordLedgerTransaction,
        onboardingCompleted,
        setOnboardingCompleted,
        betaFeedbackList,
        addBetaFeedback,
        locale,
        setLocale,
        theme,
        setTheme,
      }}
    >
      {children}
    </AgentStoreContext.Provider>
  );
}

export function useAgentStore() {
  const context = useContext(AgentStoreContext);
  if (!context) {
    throw new Error("useAgentStore must be used within an AgentProvider");
  }
  return context;
}
