export type ModelProviderId = "google" | "openai" | "anthropic" | "deepseek" | "meta" | "custom";

export interface AIModelConfig {
  id: string;
  name: string;
  provider: string;
  providerId: ModelProviderId;
  modelSlug: string;
  category: "Reasoning" | "Multimodal" | "Fast" | "Coding" | "Open-Weights";
  contextWindow: string;
  wholesaleInputPer1M: number; // USD per 1M input tokens
  wholesaleOutputPer1M: number; // USD per 1M output tokens
  retailMarkupMultiplier: number; // e.g. 2.5x for commercialization
  avgLatencyMs: number;
  enabled: boolean;
  commercialTier: "Free" | "Pro" | "Enterprise";
  summary: string;
  strengths: string[];
}

export interface AgentPersona {
  id: string;
  name: string;
  role: string;
  description: string;
  systemPrompt: string;
  recommendedModelId: string;
  starterPrompts: string[];
}

export interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
  modelId: string;
  modelName: string;
  provider: string;
  agentId: string;
  timestamp: string;
  tokensUsed: number;
  wholesaleCostUsd: number;
  retailChargeUsd: number;
  latencyMs: number;
  comparisonResponses?: {
    modelId: string;
    modelName: string;
    provider: string;
    content: string;
    tokensUsed: number;
    latencyMs: number;
    retailChargeUsd: number;
  }[];
}

export interface ClientApiKey {
  id: string;
  label: string;
  keyPreview: string;
  tier: "Free" | "Pro" | "Enterprise";
  monthlyQuotaUsd: number;
  usedUsd: number;
  createdAt: string;
  active: boolean;
}

export const INITIAL_MODELS: AIModelConfig[] = [
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    provider: "Google DeepMind",
    providerId: "google",
    modelSlug: "gemini-3.8-flash",
    category: "Multimodal",
    contextWindow: "1M ctx",
    // Reference paid standard pricing on 2026-11-06, NOT an actual invoice.
    // Official pricing changes on 2027-01-01; keep financial UI in demo mode.
    wholesaleInputPer1M: 0.75,
    wholesaleOutputPer1M: 3.75,
    retailMarkupMultiplier: 2.5,
    avgLatencyMs: 420,
    enabled: true,
    commercialTier: "Free",
    summary: "Model multimodal berkecepatan tinggi dengan konteks 1 juta token untuk tugas harian yang responsif.",
    strengths: ["Konteks 1M token", "Respons sangat cepat", "Multimodal alami"],
  },
  {
    id: "chatgpt-4o",
    name: "ChatGPT (GPT-4o)",
    provider: "OpenAI",
    providerId: "openai",
    modelSlug: "gpt-4o",
    category: "Multimodal",
    contextWindow: "128K ctx",
    wholesaleInputPer1M: 2.50,
    wholesaleOutputPer1M: 10.00,
    retailMarkupMultiplier: 2.2,
    avgLatencyMs: 680,
    enabled: true,
    commercialTier: "Pro",
    summary: "Model serbabisa untuk penulisan dan analisis. Status API deprecated, jadwal penghentian 14 Januari 2027. Cek migrasi sebelum mengaktifkan live.",
    strengths: ["Gaya bahasa natural", "Sintesis eksekutif", "Pengetahuan luas"],
  },
  {
    id: "claude-3-7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    providerId: "anthropic",
    modelSlug: "claude-3-7-sonnet",
    category: "Coding",
    contextWindow: "200K ctx",
    wholesaleInputPer1M: 3.00,
    wholesaleOutputPer1M: 15.00,
    retailMarkupMultiplier: 2.0,
    avgLatencyMs: 740,
    enabled: true,
    commercialTier: "Pro",
    summary: "Spesialis rekayasa perangkat lunak, penulisan kode bersih, dan analisis dokumen panjang.",
    strengths: ["Arsitektur & koding", "Instruksi presisi", "Konteks 200K"],
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    providerId: "deepseek",
    modelSlug: "deepseek-reasoner",
    category: "Reasoning",
    contextWindow: "128K ctx",
    wholesaleInputPer1M: 0.55,
    wholesaleOutputPer1M: 2.19,
    retailMarkupMultiplier: 3.0,
    avgLatencyMs: 920,
    enabled: true,
    commercialTier: "Free",
    summary: "Model penalaran mendalam untuk logika kuantitatif, matematika, dan pemecahan masalah kompleks.",
    strengths: ["Penalaran bertahap", "Sangat hemat biaya", "Analisis kuantitatif"],
  },
  {
    id: "llama-3-3-70b",
    name: "Llama 3.3 70B Instruct",
    provider: "Meta Open-Weights",
    providerId: "meta",
    modelSlug: "llama-3.3-70b-instruct",
    category: "Open-Weights",
    contextWindow: "128K ctx",
    wholesaleInputPer1M: 0.20,
    wholesaleOutputPer1M: 0.40,
    retailMarkupMultiplier: 3.5,
    avgLatencyMs: 350,
    enabled: true,
    commercialTier: "Free",
    summary: "Model open-weights super cepat untuk otomatisasi tugas berfrekuensi tinggi dengan efisiensi maksimal.",
    strengths: ["Kecepatan tinggi", "Efisiensi biaya", "Open-weights"],
  },
];

export const AGENT_PERSONAS: AgentPersona[] = [
  {
    id: "agent-orchestrator",
    name: "Strategis Utama",
    role: "Strategi & Pemecahan Masalah",
    description: "Pendamping utama untuk merancang strategi produk, riset bisnis, dan pengambilan keputusan cepat.",
    systemPrompt:
      "Anda adalah Strategis Utama di platform agen AI minimalis. Berikan jawaban dalam Bahasa Indonesia yang ringkas, terstruktur, dan langsung bisa dieksekusi.",
    recommendedModelId: "gemini-3.8-flash",
    starterPrompts: [
      "Susun strategi peluncuran platform SaaS AI multi-model untuk pasar Indonesia",
      "Bandingkan keunggulan ChatGPT vs Gemini untuk otomatisasi kerja harian",
      "Buat daftar prioritas fitur MVP agar produk cepat menghasilkan pendapatan",
    ],
  },
  {
    id: "agent-architect",
    name: "Arsitek Kode & Sistem",
    role: "Full-Stack & API Engineering",
    description: "Membantu menulis kode TypeScript, merancang API gateway, skema database, dan debugging cepat.",
    systemPrompt:
      "Anda adalah Arsitek Sistem & Kode Senior. Berikan solusi dalam Bahasa Indonesia disertai contoh kode TypeScript yang bersih dan terstruktur.",
    recommendedModelId: "claude-3-7-sonnet",
    starterPrompts: [
      "Buat pola adapter TypeScript untuk menghubungkan API OpenAI, Gemini, dan Claude",
      "Rancang skema database untuk mencatat pemakaian token per pengguna",
      "Tulis fungsi rate-limiter sederhana untuk melindungi endpoint API",
    ],
  },
  {
    id: "agent-analyst",
    name: "Analis Bisnis & Harga",
    role: "Monetisasi & Unit Ekonomi",
    description: "Menghitung struktur harga langganan, efisiensi biaya token, dan proyeksi keuntungan bisnis.",
    systemPrompt:
      "Anda adalah Analis Bisnis & Unit Ekonomi SaaS. Jelaskan perhitungan biaya, harga jual, dan margin keuntungan secara jelas dalam Bahasa Indonesia.",
    recommendedModelId: "deepseek-r1",
    starterPrompts: [
      "Hitung simulasi margin keuntungan paket langganan Pro Rp 150.000/bulan",
      "Bandingkan model bisnis sistem kredit token vs langganan bulanan tetap",
      "Bagaimana cara mengoptimalkan biaya API agar margin tetap di atas 70%?",
    ],
  },
  {
    id: "agent-editorial",
    name: "Penulis Konten & Copy",
    role: "Branding & Komunikasi",
    description: "Menyusun teks halaman utama, materi presentasi investor, dokumentasi produk, dan email klien.",
    systemPrompt:
      "Anda adalah Penulis Produk Minimalis. Tulis kalimat dalam Bahasa Indonesia yang tajam, persuasif, dan bebas basa-basi.",
    recommendedModelId: "chatgpt-4o",
    starterPrompts: [
      "Tulis teks halaman utama (hero copy) yang minimalis untuk platform AI saya",
      "Buat draf ringkasan satu halaman (one-pager) untuk calon mitra atau investor",
      "Susun panduan singkat bagi pengguna baru saat pertama kali memilih model AI",
    ],
  },
];

export const INITIAL_CLIENT_KEYS: ClientApiKey[] = [
  {
    id: "key-owner-master",
    label: "Example Owner Gateway (DEMO)",
    keyPreview: "sk-cm_demo_98f2...4a10",
    tier: "Enterprise",
    monthlyQuotaUsd: 500,
    usedUsd: 14.82,
    createdAt: "2026-10-15",
    active: true,
  },
  {
    id: "key-beta-tenant-1",
    label: "Commercial Beta Tenant — Acme Studio",
    keyPreview: "sk-cm_demo_31c9...8b22",
    tier: "Pro",
    monthlyQuotaUsd: 100,
    usedUsd: 38.40,
    createdAt: "2026-10-24",
    active: true,
  },
  {
    id: "key-sandbox-eval",
    label: "Public Playground Sandbox Key",
    keyPreview: "sk-cm_demo_77d1...0e91",
    tier: "Free",
    monthlyQuotaUsd: 25,
    usedUsd: 6.15,
    createdAt: "2026-11-01",
    active: true,
  },
];

export function calculateTokenEconomics(
  model: Pick<AIModelConfig, "wholesaleInputPer1M" | "wholesaleOutputPer1M" | "retailMarkupMultiplier">,
  inputTokens: number,
  outputTokens: number
): {
  totalTokens: number;
  wholesaleCostUsd: number;
  retailChargeUsd: number;
  netMarginUsd: number;
  grossMarginPercent: number;
} {
  const safeIn = Math.max(0, inputTokens);
  const safeOut = Math.max(0, outputTokens);
  const wholesaleCostUsd =
    (safeIn / 1_000_000) * model.wholesaleInputPer1M +
    (safeOut / 1_000_000) * model.wholesaleOutputPer1M;
  const retailChargeUsd = wholesaleCostUsd * Math.max(1, model.retailMarkupMultiplier);
  const netMarginUsd = retailChargeUsd - wholesaleCostUsd;
  const grossMarginPercent =
    retailChargeUsd > 0 ? Math.round((netMarginUsd / retailChargeUsd) * 100) : 0;

  return {
    totalTokens: safeIn + safeOut,
    wholesaleCostUsd: Number(wholesaleCostUsd.toFixed(6)),
    retailChargeUsd: Number(retailChargeUsd.toFixed(6)),
    netMarginUsd: Number(netMarginUsd.toFixed(6)),
    grossMarginPercent,
  };
}

export function simulateCommercialProjection(params: {
  activeSubscribers: number;
  monthlySubscriptionPriceUsd: number;
  avgTokensPerUserMillions: number;
  blendedWholesalePer1MUsd: number;
}): {
  grossMonthlyRevenueUsd: number;
  totalWholesaleComputeUsd: number;
  netMonthlyProfitUsd: number;
  profitMarginPercent: number;
} {
  const subs = Math.max(0, params.activeSubscribers);
  const price = Math.max(0, params.monthlySubscriptionPriceUsd);
  const tokensM = Math.max(0, params.avgTokensPerUserMillions);
  const costPerM = Math.max(0, params.blendedWholesalePer1MUsd);

  const grossMonthlyRevenueUsd = Number((subs * price).toFixed(2));
  const totalWholesaleComputeUsd = Number((subs * tokensM * costPerM).toFixed(2));
  const netMonthlyProfitUsd = Number((grossMonthlyRevenueUsd - totalWholesaleComputeUsd).toFixed(2));
  const profitMarginPercent =
    grossMonthlyRevenueUsd > 0
      ? Math.round((netMonthlyProfitUsd / grossMonthlyRevenueUsd) * 100)
      : 0;

  return {
    grossMonthlyRevenueUsd,
    totalWholesaleComputeUsd,
    netMonthlyProfitUsd,
    profitMarginPercent,
  };
}

export function filterModels(
  models: AIModelConfig[],
  category: string,
  searchQuery: string
): AIModelConfig[] {
  const q = searchQuery.trim().toLowerCase();
  return models.filter((m) => {
    const matchesCategory =
      category === "all" ||
      (category === "enabled" && m.enabled) ||
      m.category.toLowerCase() === category.toLowerCase();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.provider.toLowerCase().includes(q) ||
      m.modelSlug.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });
}

export interface ModelTelemetryRow {
  modelId: string;
  modelName: string;
  provider: string;
  category: AIModelConfig["category"];
  enabled: boolean;
  requestCount: number;
  tokensUsed: number;
  tokenSharePercent: number;
  wholesaleCostUsd: number;
  retailChargeUsd: number;
  blendedWholesalePer1kUsd: number;
  retailMarkupMultiplier: number;
  grossMarginPercent: number;
  efficiencyIndex: number; // 1 to 100 relative cost-efficiency score
  avgLatencyMs: number;
  baselineLatencyMs: number;
  latencyDeltaMs: number;
}

export interface SessionTelemetrySummary {
  totalRequests: number;
  totalTokens: number;
  totalWholesaleUsd: number;
  totalRetailUsd: number;
  totalNetMarginUsd: number;
  overallMarginPercent: number;
  blendedCostPer1kTokensUsd: number;
  meanLatencyMs: number;
  mostEfficientModelName: string;
  fastestModelName: string;
  rows: ModelTelemetryRow[];
}

export function summarizeSessionTelemetry(
  models: AIModelConfig[],
  turns: ChatTurn[]
): SessionTelemetrySummary {
  const accumulators = new Map<
    string,
    {
      requests: number;
      tokens: number;
      wholesaleUsd: number;
      retailUsd: number;
      latencySum: number;
    }
  >();

  for (const m of models) {
    accumulators.set(m.id, {
      requests: 0,
      tokens: 0,
      wholesaleUsd: 0,
      retailUsd: 0,
      latencySum: 0,
    });
  }

  for (const turn of turns) {
    if (turn.role !== "assistant") continue;

    if (turn.comparisonResponses && turn.comparisonResponses.length > 0) {
      for (const cmp of turn.comparisonResponses) {
        const modelCfg = models.find((m) => m.id === cmp.modelId);
        const multiplier = modelCfg?.retailMarkupMultiplier || 2.2;
        const wholesaleEst = cmp.retailChargeUsd / Math.max(1, multiplier);
        const cur = accumulators.get(cmp.modelId) || {
          requests: 0,
          tokens: 0,
          wholesaleUsd: 0,
          retailUsd: 0,
          latencySum: 0,
        };
        cur.requests += 1;
        cur.tokens += cmp.tokensUsed;
        cur.wholesaleUsd += wholesaleEst;
        cur.retailUsd += cmp.retailChargeUsd;
        cur.latencySum += cmp.latencyMs;
        accumulators.set(cmp.modelId, cur);
      }
    } else {
      const cur = accumulators.get(turn.modelId) || {
        requests: 0,
        tokens: 0,
        wholesaleUsd: 0,
        retailUsd: 0,
        latencySum: 0,
      };
      cur.requests += 1;
      cur.tokens += turn.tokensUsed;
      cur.wholesaleUsd += turn.wholesaleCostUsd;
      cur.retailUsd += turn.retailChargeUsd;
      cur.latencySum += turn.latencyMs;
      accumulators.set(turn.modelId, cur);
    }
  }

  let totalRequests = 0;
  let totalTokens = 0;
  let totalWholesaleUsd = 0;
  let totalRetailUsd = 0;
  let totalLatencyWeighted = 0;

  for (const acc of accumulators.values()) {
    totalRequests += acc.requests;
    totalTokens += acc.tokens;
    totalWholesaleUsd += acc.wholesaleUsd;
    totalRetailUsd += acc.retailUsd;
    totalLatencyWeighted += acc.latencySum;
  }

  // Compute raw blended 1K token cost for each model so we can normalize efficiencyIndex (1-100)
  const rawBlendedPer1k = models.map((m) => {
    const acc = accumulators.get(m.id);
    if (acc && acc.tokens > 0 && acc.wholesaleUsd > 0) {
      return (acc.wholesaleUsd / acc.tokens) * 1000;
    }
    // Baseline 50/50 input/output per 1K tokens
    return (m.wholesaleInputPer1M + m.wholesaleOutputPer1M) / 2000;
  });

  const minCostPer1k = Math.min(...rawBlendedPer1k, 0.0001);
  const maxCostPer1k = Math.max(...rawBlendedPer1k, 0.001);

  const rows: ModelTelemetryRow[] = models.map((m, idx) => {
    const acc = accumulators.get(m.id) || {
      requests: 0,
      tokens: 0,
      wholesaleUsd: 0,
      retailUsd: 0,
      latencySum: 0,
    };

    const blendedPer1k = rawBlendedPer1k[idx];
    const tokenSharePercent =
      totalTokens > 0 ? Math.round((acc.tokens / totalTokens) * 100) : 0;

    // Higher efficiencyIndex means lower cost per 1K tokens + higher commercial margin
    const normalizedCostRatio =
      maxCostPer1k > minCostPer1k
        ? (maxCostPer1k - blendedPer1k) / (maxCostPer1k - minCostPer1k)
        : 1;
    const efficiencyIndex = Math.max(
      18,
      Math.min(100, Math.round(normalizedCostRatio * 82 + 18))
    );

    const avgLatencyMs =
      acc.requests > 0
        ? Math.round(acc.latencySum / acc.requests)
        : m.avgLatencyMs;

    const sampleEcon = calculateTokenEconomics(m, 500_000, 500_000);

    return {
      modelId: m.id,
      modelName: m.name,
      provider: m.provider,
      category: m.category,
      enabled: m.enabled,
      requestCount: acc.requests,
      tokensUsed: acc.tokens,
      tokenSharePercent,
      wholesaleCostUsd: Number(acc.wholesaleUsd.toFixed(6)),
      retailChargeUsd: Number(acc.retailUsd.toFixed(6)),
      blendedWholesalePer1kUsd: Number(blendedPer1k.toFixed(5)),
      retailMarkupMultiplier: m.retailMarkupMultiplier,
      grossMarginPercent: sampleEcon.grossMarginPercent,
      efficiencyIndex,
      avgLatencyMs,
      baselineLatencyMs: m.avgLatencyMs,
      latencyDeltaMs: avgLatencyMs - m.avgLatencyMs,
    };
  });

  const sortedByEfficiency = [...rows].sort(
    (a, b) => a.blendedWholesalePer1kUsd - b.blendedWholesalePer1kUsd
  );
  const sortedByLatency = [...rows].sort(
    (a, b) => a.avgLatencyMs - b.avgLatencyMs
  );

  const totalNetMarginUsd = Number((totalRetailUsd - totalWholesaleUsd).toFixed(6));
  const overallMarginPercent =
    totalRetailUsd > 0
      ? Math.round((totalNetMarginUsd / totalRetailUsd) * 100)
      : 0;
  const blendedCostPer1kTokensUsd =
    totalTokens > 0
      ? Number(((totalWholesaleUsd / totalTokens) * 1000).toFixed(5))
      : 0;
  const meanLatencyMs =
    totalRequests > 0
      ? Math.round(totalLatencyWeighted / totalRequests)
      : Math.round(
          rows.reduce((sum, r) => sum + r.avgLatencyMs, 0) / Math.max(1, rows.length)
        );

  return {
    totalRequests,
    totalTokens,
    totalWholesaleUsd: Number(totalWholesaleUsd.toFixed(6)),
    totalRetailUsd: Number(totalRetailUsd.toFixed(6)),
    totalNetMarginUsd,
    overallMarginPercent,
    blendedCostPer1kTokensUsd,
    meanLatencyMs,
    mostEfficientModelName: sortedByEfficiency[0]?.modelName || "Llama 3.3 70B Instruct",
    fastestModelName: sortedByLatency[0]?.modelName || "Llama 3.3 70B Instruct",
    rows,
  };
}

export type TaskPriorityMode = "balanced" | "speed" | "budget" | "reasoning";

export interface ModelFrontierPoint extends ModelTelemetryRow {
  isParetoOptimal: boolean;
  quadrant: "cepat-hemat" | "cepat-premium" | "hemat-mendalam" | "spesialis-berat";
  quadrantLabel: string;
  taskScore: number;
}

export interface ModelFrontierAnalysis {
  enabledCount: number;
  medianLatencyMs: number;
  medianCostPer1kUsd: number;
  points: ModelFrontierPoint[];
  paretoFrontier: ModelFrontierPoint[];
  recommendedModel: ModelFrontierPoint | null;
  recommendationReason: string;
}

export function buildModelEfficiencyFrontier(
  rows: ModelTelemetryRow[],
  priority: TaskPriorityMode = "balanced"
): ModelFrontierAnalysis {
  const enabledRows = rows.filter((r) => r.enabled);
  if (enabledRows.length === 0) {
    return {
      enabledCount: 0,
      medianLatencyMs: 500,
      medianCostPer1kUsd: 0.001,
      points: [],
      paretoFrontier: [],
      recommendedModel: null,
      recommendationReason: "Tidak ada model aktif.",
    };
  }

  const sortedLatencies = [...enabledRows]
    .map((r) => r.avgLatencyMs)
    .sort((a, b) => a - b);
  const sortedCosts = [...enabledRows]
    .map((r) => r.blendedWholesalePer1kUsd)
    .sort((a, b) => a - b);

  const midIdx = Math.floor(enabledRows.length / 2);
  const medianLatencyMs = sortedLatencies[midIdx] || 500;
  const medianCostPer1kUsd = sortedCosts[midIdx] || 0.001;

  const minLat = sortedLatencies[0] || 200;
  const maxLat = sortedLatencies[sortedLatencies.length - 1] || 1000;
  const latSpan = Math.max(1, maxLat - minLat);

  const points: ModelFrontierPoint[] = enabledRows.map((row) => {
    const isDominated = enabledRows.some(
      (other) =>
        other.modelId !== row.modelId &&
        other.avgLatencyMs <= row.avgLatencyMs &&
        other.blendedWholesalePer1kUsd <= row.blendedWholesalePer1kUsd &&
        (other.avgLatencyMs < row.avgLatencyMs ||
          other.blendedWholesalePer1kUsd < row.blendedWholesalePer1kUsd)
    );

    const fastLatency = row.avgLatencyMs <= medianLatencyMs;
    const lowCost = row.blendedWholesalePer1kUsd <= medianCostPer1kUsd;

    let quadrant: ModelFrontierPoint["quadrant"] = "spesialis-berat";
    let quadrantLabel = "Spesialis Kompleks";
    if (fastLatency && lowCost) {
      quadrant = "cepat-hemat";
      quadrantLabel = "Zona Ideal (Cepat & Hemat)";
    } else if (fastLatency && !lowCost) {
      quadrant = "cepat-premium";
      quadrantLabel = "Respons Cepat Premium";
    } else if (!fastLatency && lowCost) {
      quadrant = "hemat-mendalam";
      quadrantLabel = "Penalaran Hemat Biaya";
    }

    const speedScore = Math.round(((maxLat - row.avgLatencyMs) / latSpan) * 100);
    const costScore = row.efficiencyIndex;

    let taskScore = Math.round(speedScore * 0.5 + costScore * 0.5);
    if (priority === "speed") {
      taskScore = Math.round(speedScore * 0.8 + costScore * 0.2);
    } else if (priority === "budget") {
      taskScore = Math.round(speedScore * 0.2 + costScore * 0.8);
    } else if (priority === "reasoning") {
      const specialtyBonus =
        row.category === "Coding" || row.category === "Reasoning"
          ? 55
          : row.category === "Multimodal"
          ? 12
          : 5;
      taskScore = Math.min(100, Math.round(specialtyBonus + costScore * 0.35 + speedScore * 0.1));
    }

    return {
      ...row,
      isParetoOptimal: !isDominated,
      quadrant,
      quadrantLabel,
      taskScore,
    };
  });

  points.sort((a, b) => a.avgLatencyMs - b.avgLatencyMs);

  const paretoFrontier = points
    .filter((p) => p.isParetoOptimal)
    .sort((a, b) => a.avgLatencyMs - b.avgLatencyMs);

  const rankedByTask = [...points].sort(
    (a, b) => b.taskScore - a.taskScore || a.avgLatencyMs - b.avgLatencyMs
  );
  const recommendedModel = rankedByTask[0] || null;

  let recommendationReason = "";
  if (recommendedModel) {
    if (priority === "speed") {
      recommendationReason = `${recommendedModel.modelName} memberikan latensi tercepat (${recommendedModel.avgLatencyMs}ms) dengan biaya $${recommendedModel.blendedWholesalePer1kUsd.toFixed(4)}/1K token untuk interaksi instan.`;
    } else if (priority === "budget") {
      recommendationReason = `${recommendedModel.modelName} paling hemat biaya ($${recommendedModel.blendedWholesalePer1kUsd.toFixed(4)}/1K token, indeks efisiensi ${recommendedModel.efficiencyIndex}/100) untuk pemrosesan volume besar.`;
    } else if (priority === "reasoning") {
      recommendationReason = `${recommendedModel.modelName} unggul untuk koding, logika mendalam, dan analisis terstruktur dengan keseimbangan performa terbaik.`;
    } else {
      recommendationReason = `${recommendedModel.modelName} berada di garis efisiensi Pareto dengan kombinasi kecepatan (${recommendedModel.avgLatencyMs}ms) dan biaya ($${recommendedModel.blendedWholesalePer1kUsd.toFixed(4)}/1K token) paling optimal.`;
    }
  }

  return {
    enabledCount: enabledRows.length,
    medianLatencyMs,
    medianCostPer1kUsd,
    points,
    paretoFrontier,
    recommendedModel,
    recommendationReason,
  };
}

export interface ModelSwitchSavingsResult {
  sourceModelId: string;
  sourceModelName: string;
  targetModelId: string;
  targetModelName: string;
  monthlyTokens: number;
  inputTokens: number;
  outputTokens: number;
  sourceWholesaleMonthlyUsd: number;
  targetWholesaleMonthlyUsd: number;
  wholesaleMonthlySavingsUsd: number;
  sourceRetailMonthlyUsd: number;
  targetRetailMonthlyUsd: number;
  retailMonthlySavingsUsd: number;
  savingsPercent: number;
  annualSavingsUsd: number;
  annualSavingsIdr: number;
  latencyDeltaMs: number;
  speedupPercent: number;
  isCheaper: boolean;
  efficiencyRatio: number;
  summaryText: string;
}

export function calculateModelSwitchSavings(params: {
  sourceModel: AIModelConfig;
  targetModel: AIModelConfig;
  monthlyTokens: number;
  inputRatio?: number;
  usdToIdrRate?: number;
}): ModelSwitchSavingsResult {
  const { sourceModel, targetModel } = params;
  const monthlyTokens = Math.max(10_000, params.monthlyTokens);
  const inputRatio = Math.max(0.05, Math.min(0.95, params.inputRatio ?? 0.35));
  const usdToIdr = params.usdToIdrRate ?? 15800;

  const inputTokens = Math.round(monthlyTokens * inputRatio);
  const outputTokens = Math.max(0, monthlyTokens - inputTokens);

  const sourceWholesale =
    (inputTokens / 1_000_000) * sourceModel.wholesaleInputPer1M +
    (outputTokens / 1_000_000) * sourceModel.wholesaleOutputPer1M;

  const targetWholesale =
    (inputTokens / 1_000_000) * targetModel.wholesaleInputPer1M +
    (outputTokens / 1_000_000) * targetModel.wholesaleOutputPer1M;

  const wholesaleSavings = sourceWholesale - targetWholesale;
  const sourceRetail = sourceWholesale * Math.max(1, sourceModel.retailMarkupMultiplier);
  const targetRetail = targetWholesale * Math.max(1, targetModel.retailMarkupMultiplier);
  const retailSavings = sourceRetail - targetRetail;

  const savingsPercent =
    sourceWholesale > 0
      ? Math.round((wholesaleSavings / sourceWholesale) * 100)
      : 0;

  const annualSavingsUsd = Number((wholesaleSavings * 12).toFixed(2));
  const annualSavingsIdr = Math.round(annualSavingsUsd * usdToIdr);

  const latencyDeltaMs = targetModel.avgLatencyMs - sourceModel.avgLatencyMs;
  const speedupPercent =
    sourceModel.avgLatencyMs > 0
      ? Math.round(((sourceModel.avgLatencyMs - targetModel.avgLatencyMs) / sourceModel.avgLatencyMs) * 100)
      : 0;

  const isCheaper = wholesaleSavings > 0;
  const efficiencyRatio =
    targetWholesale > 0
      ? Number((sourceWholesale / targetWholesale).toFixed(2))
      : 1;

  let summaryText = "";
  if (isCheaper) {
    const speedNote =
      latencyDeltaMs < 0
        ? `dan ${Math.abs(latencyDeltaMs)}ms (${speedupPercent}%) lebih cepat`
        : `dengan kompromi latensi +${latencyDeltaMs}ms`;
    summaryText = `Beralih dari ${sourceModel.name} ke ${targetModel.name} menghemat sekitar $${wholesaleSavings.toFixed(2)}/bln (${savingsPercent}%) ${speedNote}.`;
  } else if (wholesaleSavings === 0) {
    summaryText = `Biaya komputasi ${sourceModel.name} dan ${targetModel.name} identik pada volume ini.`;
  } else {
    summaryText = `Beralih dari ${sourceModel.name} ke ${targetModel.name} membutuhkan investasi tambahan +$${Math.abs(wholesaleSavings).toFixed(2)}/bln untuk kemampuan model yang lebih tinggi.`;
  }

  return {
    sourceModelId: sourceModel.id,
    sourceModelName: sourceModel.name,
    targetModelId: targetModel.id,
    targetModelName: targetModel.name,
    monthlyTokens,
    inputTokens,
    outputTokens,
    sourceWholesaleMonthlyUsd: Number(sourceWholesale.toFixed(4)),
    targetWholesaleMonthlyUsd: Number(targetWholesale.toFixed(4)),
    wholesaleMonthlySavingsUsd: Number(wholesaleSavings.toFixed(4)),
    sourceRetailMonthlyUsd: Number(sourceRetail.toFixed(4)),
    targetRetailMonthlyUsd: Number(targetRetail.toFixed(4)),
    retailMonthlySavingsUsd: Number(retailSavings.toFixed(4)),
    savingsPercent,
    annualSavingsUsd,
    annualSavingsIdr,
    latencyDeltaMs,
    speedupPercent,
    isCheaper,
    efficiencyRatio,
    summaryText,
  };
}

export function compareAllModelSwitchSavings(params: {
  sourceModel: AIModelConfig;
  allModels: AIModelConfig[];
  monthlyTokens: number;
  inputRatio?: number;
  usdToIdrRate?: number;
}): ModelSwitchSavingsResult[] {
  const { sourceModel, allModels, monthlyTokens, inputRatio, usdToIdrRate } = params;
  return allModels
    .filter((m) => m.enabled && m.id !== sourceModel.id)
    .map((target) =>
      calculateModelSwitchSavings({
        sourceModel,
        targetModel: target,
        monthlyTokens,
        inputRatio,
        usdToIdrRate,
      })
    )
    .sort((a, b) => b.wholesaleMonthlySavingsUsd - a.wholesaleMonthlySavingsUsd);
}

