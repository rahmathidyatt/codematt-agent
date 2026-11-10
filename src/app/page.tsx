"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Send,
  RotateCcw,
  Check,
  Copy,
  SlidersHorizontal,
  Columns2,
  ArrowRight,
  Coffee,
  Heart,
  Sparkles,
  BarChart3,
  Settings,
  Layers,
  MessageSquare,
  Building2,
  X,
} from "lucide-react";
import {
  INITIAL_MODELS,
  AGENT_PERSONAS,
  INITIAL_CLIENT_KEYS,
  AIModelConfig,
  AgentPersona,
  ChatTurn,
  ClientApiKey,
  calculateTokenEconomics,
} from "@/features/platform/model-gateway";
import { SessionTelemetryDashboard } from "@/components/platform/SessionTelemetryDashboard";
import { ModelRegistryPanel } from "@/components/platform/ModelRegistryPanel";
import { CommercialHubPanel } from "@/components/platform/CommercialHubPanel";

const OWNER_EMAIL = "akun belum terhubung (demo)";

type ActiveTabView = "models" | "workspace" | "telemetry" | "owner";

interface CoffeeTier {
  id: string;
  cups: number;
  title: string;
  amountIdr: string;
  caption: string;
}

const COFFEE_TIERS: CoffeeTier[] = [
  {
    id: "coffee-1",
    cups: 1,
    title: "1 Gelas Espresso",
    amountIdr: "Rp 25.000",
    caption: "Suntikan semangat koding malam",
  },
  {
    id: "coffee-3",
    cups: 3,
    title: "3 Gelas Golden Latte",
    amountIdr: "Rp 75.000",
    caption: "Bantu biaya eksperimen model AI baru",
  },
  {
    id: "coffee-5",
    cups: 5,
    title: "5 Gelas Cold Brew",
    amountIdr: "Rp 125.000",
    caption: "Pendukung utama pengembangan platform",
  },
];

let turnCounter = 1000;
function createTurnId(prefix: string): string {
  turnCounter += 1;
  return `${prefix}-${turnCounter}`;
}

function getCurrentTimeLabel(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function createWelcomeTurnForModel(model: AIModelConfig, agentId: string): ChatTurn {
  return {
    id: `turn-welcome-${model.id}`,
    role: "assistant",
    content: `### Mode Demo · ${model.name} (${model.provider})\n\nAnda sedang berada di tab ruang kerja **${model.name}** (${model.contextWindow} · kategori **${model.category}**). Ketik instruksi di bawah atau pilih salah satu topik cepat untuk mulai bekerja.\n\n- **Keunggulan Utama**: ${model.strengths.join(" · ")}.\n- **Pindah Model Instan**: Klik tab model di bagian atas kapan saja untuk berganti antara **Gemini 3.8 Flash**, **ChatGPT (GPT-4o)**, **Claude 3.7 Sonnet**, **DeepSeek R1**, atau **Llama 3.3 70B** dengan riwayat percakapan terpisah.`,
    modelId: model.id,
    modelName: model.name,
    provider: model.provider,
    agentId,
    timestamp: "Baru saja",
    tokensUsed: 0,
    wholesaleCostUsd: 0,
    retailChargeUsd: 0,
    latencyMs: 0,
  };
}

function buildInitialTurnsByModel(modelsList: AIModelConfig[], agentId: string): Record<string, ChatTurn[]> {
  const map: Record<string, ChatTurn[]> = {};
  for (const m of modelsList) {
    map[m.id] = [createWelcomeTurnForModel(m, agentId)];
  }
  return map;
}

function buildCustomModelDemoResponse(
  prompt: string,
  model: AIModelConfig,
  persona: AgentPersona
) {
  const content = [
    `### MODE DEMO · Pratinjau Endpoint Kustom (${model.name})`,
    `Respons simulasi dari endpoint **${model.modelSlug}** (${model.provider}) melalui peran **${persona.name}**.`,
    `- **Permintaan Anda**: "${prompt}"`,
    `- **Spesifikasi Model**: Kategori ${model.category} · Konteks ${model.contextWindow} · Markup ${model.retailMarkupMultiplier}x.`,
  ].join("\n\n");
  const inTok = Math.max(48, Math.round(prompt.length / 3.5) + 45);
  const outTok = Math.max(120, Math.round(content.length / 3.8));
  const economics = calculateTokenEconomics(model, inTok, outTok);
  return {
    content,
    economics,
    latencyMs: model.avgLatencyMs,
  };
}

export default function MultiModelAgentPlatformPage() {
  const [models, setModels] = useState<AIModelConfig[]>(INITIAL_MODELS);
  const [selectedModelId, setSelectedModelId] = useState<string>("gemini-3.8-flash");
  const [activeView, setActiveView] = useState<ActiveTabView>("models");

  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [compareModelId, setCompareModelId] = useState<string>("chatgpt-4o");
  const [selectedAgentId, setSelectedAgentId] = useState<string>(AGENT_PERSONAS[0].id);
  const [customSystemPrompt, setCustomSystemPrompt] = useState<string>("");
  const [showAgentConfig, setShowAgentConfig] = useState<boolean>(false);

  const [promptInput, setPromptInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedTurnId, setCopiedTurnId] = useState<string | null>(null);

  const [clientKeys, setClientKeys] = useState<ClientApiKey[]>(INITIAL_CLIENT_KEYS);

  // "Buy a Coffee" Bottom Sub-Menu state
  const [showCoffeeMenu, setShowCoffeeMenu] = useState<boolean>(false);
  const [selectedCoffeeId, setSelectedCoffeeId] = useState<string>("coffee-3");
  const [supporterName, setSupporterName] = useState<string>("");
  const [supporterMessage, setSupporterMessage] = useState<string>("");
  const [coffeeCount, setCoffeeCount] = useState<number>(0);
  const [coffeeThankYou, setCoffeeThankYou] = useState<string | null>(null);

  const promptInputRef = useRef<HTMLInputElement | null>(null);

  const [turnsByModel, setTurnsByModel] = useState<Record<string, ChatTurn[]>>(() =>
    buildInitialTurnsByModel(INITIAL_MODELS, AGENT_PERSONAS[0].id)
  );

  const [telemetryProbes, setTelemetryProbes] = useState<ChatTurn[]>([]);

  const enabledModels = models.filter((m) => m.enabled);
  const activeModel =
    enabledModels.find((m) => m.id === selectedModelId) ||
    enabledModels[0] ||
    models[0];
  const secondaryModel =
    enabledModels.find((m) => m.id === compareModelId && m.id !== activeModel.id) ||
    enabledModels.find((m) => m.id !== activeModel.id) ||
    models[1] ||
    activeModel;
  const activePersona =
    AGENT_PERSONAS.find((a) => a.id === selectedAgentId) || AGENT_PERSONAS[0];

  const turns = turnsByModel[activeModel.id] || [
    createWelcomeTurnForModel(activeModel, activePersona.id),
  ];

  const appendTurnForModel = (modelId: string, newTurn: ChatTurn) => {
    setTurnsByModel((prev) => {
      const existing = prev[modelId] || [
        createWelcomeTurnForModel(
          models.find((m) => m.id === modelId) || activeModel,
          activePersona.id
        ),
      ];
      return {
        ...prev,
        [modelId]: [...existing, newTurn],
      };
    });
  };

  const allConversationTurns = Object.values(turnsByModel)
    .flat()
    .filter(
      (t) =>
        t.role === "assistant" &&
        !t.id.startsWith("turn-welcome") &&
        !t.id.startsWith("turn-reset")
    );

  const sessionTelemetryTurns = [...telemetryProbes, ...allConversationTurns];

  const sessionTokens = sessionTelemetryTurns.reduce((acc, t) => acc + t.tokensUsed, 0);
  const sessionWholesaleUsd = sessionTelemetryTurns.reduce(
    (acc, t) => acc + t.wholesaleCostUsd,
    0
  );
  const sessionRetailUsd = sessionTelemetryTurns.reduce(
    (acc, t) => acc + t.retailChargeUsd,
    0
  );

  // Selecting a model automatically opens its active workspace tab and focuses the input
  const handleSelectModelAndLaunch = (modelId: string) => {
    setSelectedModelId(modelId);
    setActiveView("workspace");
    setTimeout(() => {
      promptInputRef.current?.focus();
    }, 60);
  };

  const handleRunPrompt = async (overridePrompt?: string) => {
    const textToSend = (overridePrompt ?? promptInput).trim();
    if (!textToSend || loading) return;

    const targetModel = activeModel;
    const compareTarget = compareMode ? secondaryModel : null;

    const userTurn: ChatTurn = {
      id: createTurnId("usr"),
      role: "user",
      content: textToSend,
      modelId: targetModel.id,
      modelName: targetModel.name,
      provider: targetModel.provider,
      agentId: activePersona.id,
      timestamp: getCurrentTimeLabel(),
      tokensUsed: 0,
      wholesaleCostUsd: 0,
      retailChargeUsd: 0,
      latencyMs: 0,
    };

    appendTurnForModel(targetModel.id, userTurn);
    setPromptInput("");
    setLoading(true);

    // If custom model is used (not registered on server INITIAL_MODELS), run simulated gateway response locally
    const isCustomPrimary = targetModel.id.startsWith("custom-");
    const isCustomCompare = Boolean(compareTarget && compareTarget.id.startsWith("custom-"));

    if (isCustomPrimary || isCustomCompare) {
      const primarySim = buildCustomModelDemoResponse(textToSend, targetModel, activePersona);
      const compareSim = compareTarget
        ? buildCustomModelDemoResponse(textToSend, compareTarget, activePersona)
        : null;

      const assistantTurn: ChatTurn = {
        id: createTurnId("ai"),
        role: "assistant",
        content: primarySim.content,
        modelId: targetModel.id,
        modelName: targetModel.name,
        provider: targetModel.provider,
        agentId: activePersona.id,
        timestamp: getCurrentTimeLabel(),
        tokensUsed: primarySim.economics.totalTokens + (compareSim ? compareSim.economics.totalTokens : 0),
        wholesaleCostUsd:
          primarySim.economics.wholesaleCostUsd + (compareSim ? compareSim.economics.wholesaleCostUsd : 0),
        retailChargeUsd:
          primarySim.economics.retailChargeUsd + (compareSim ? compareSim.economics.retailChargeUsd : 0),
        latencyMs: primarySim.latencyMs,
        comparisonResponses: compareSim && compareTarget
          ? [
              {
                modelId: targetModel.id,
                modelName: targetModel.name,
                provider: targetModel.provider,
                content: primarySim.content,
                tokensUsed: primarySim.economics.totalTokens,
                latencyMs: primarySim.latencyMs,
                retailChargeUsd: primarySim.economics.retailChargeUsd,
              },
              {
                modelId: compareTarget.id,
                modelName: compareTarget.name,
                provider: compareTarget.provider,
                content: compareSim.content,
                tokensUsed: compareSim.economics.totalTokens,
                latencyMs: compareSim.latencyMs,
                retailChargeUsd: compareSim.economics.retailChargeUsd,
              },
            ]
          : undefined,
      };

      appendTurnForModel(targetModel.id, assistantTurn);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/gateway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          modelId: targetModel.id,
          compareModelId: compareTarget ? compareTarget.id : null,
          agentId: activePersona.id,
          customSystemPrompt: customSystemPrompt || undefined,
        }),
      });

      const json = await res.json();
      if (json.ok && json.primary) {
        const p = json.primary;
        const c = json.comparison;

        // Calculate realistic simulated token economics in demo mode for session telemetry
        const estInputTokens = Math.max(48, Math.round(textToSend.length / 3.5) + 45);
        const estOutputTokens = Math.max(120, Math.round(String(p.content || "").length / 3.8));
        const demoPrimaryEcon = calculateTokenEconomics(targetModel, estInputTokens, estOutputTokens);
        const demoCompareEcon =
          c && compareTarget
            ? calculateTokenEconomics(
                compareTarget,
                estInputTokens,
                Math.max(110, Math.round(String(c.content || "").length / 3.8))
              )
            : null;

        const primaryTokens = p.tokensUsed > 0 ? p.tokensUsed : demoPrimaryEcon.totalTokens;
        const primaryWholesale =
          p.wholesaleCostUsd > 0 ? p.wholesaleCostUsd : demoPrimaryEcon.wholesaleCostUsd;
        const primaryRetail =
          p.retailChargeUsd > 0 ? p.retailChargeUsd : demoPrimaryEcon.retailChargeUsd;
        const primaryLatency = p.latencyMs > 0 ? p.latencyMs : targetModel.avgLatencyMs;

        const compareTokens = c
          ? c.tokensUsed > 0
            ? c.tokensUsed
            : demoCompareEcon?.totalTokens || 0
          : 0;
        const compareWholesale = c
          ? c.wholesaleCostUsd > 0
            ? c.wholesaleCostUsd
            : demoCompareEcon?.wholesaleCostUsd || 0
          : 0;
        const compareRetail = c
          ? c.retailChargeUsd > 0
            ? c.retailChargeUsd
            : demoCompareEcon?.retailChargeUsd || 0
          : 0;
        const compareLatency = c
          ? c.latencyMs > 0
            ? c.latencyMs
            : compareTarget?.avgLatencyMs || 420
          : 0;

        const assistantTurn: ChatTurn = {
          id: createTurnId("ai"),
          role: "assistant",
          content: json.mode === "live"
            ? [
                "Respons langsung dari provider. Biaya API belum dihitung aplikasi, bukan berarti gratis. Periksa dashboard provider.",
                p.content,
                json.comparisonError
                  ? "⚠️ Respons model pembanding gagal. Model utama berhasil, tetapi permintaan provider dapat tetap dikenai biaya."
                  : "",
              ].filter(Boolean).join("\n\n")
            : p.content,
          modelId: p.modelId,
          modelName: p.modelName,
          provider: p.provider,
          agentId: activePersona.id,
          timestamp: getCurrentTimeLabel(),
          tokensUsed: primaryTokens + compareTokens,
          wholesaleCostUsd: Number((primaryWholesale + compareWholesale).toFixed(6)),
          retailChargeUsd: Number((primaryRetail + compareRetail).toFixed(6)),
          latencyMs: primaryLatency,
          comparisonResponses: c
            ? [
                {
                  modelId: p.modelId,
                  modelName: p.modelName,
                  provider: p.provider,
                  content: p.content,
                  tokensUsed: primaryTokens,
                  latencyMs: primaryLatency,
                  retailChargeUsd: primaryRetail,
                },
                {
                  modelId: c.modelId,
                  modelName: c.modelName,
                  provider: c.provider,
                  content: c.content,
                  tokensUsed: compareTokens,
                  latencyMs: compareLatency,
                  retailChargeUsd: compareRetail,
                },
              ]
            : undefined,
        };

        appendTurnForModel(targetModel.id, assistantTurn);
      } else {
        appendTurnForModel(targetModel.id, {
          ...userTurn,
          id: createTurnId("err"),
          role: "assistant",
          content: "⚠️ Gateway belum dapat memproses permintaan (" + String(json.error || "UNKNOWN_ERROR") + "). Aplikasi tidak menerbitkan tagihan internal. Biaya provider belum dapat dipastikan.",
        });
      }
    } catch (err) {
      console.error("Gagal menjalankan permintaan model:", err);
      appendTurnForModel(targetModel.id, {
        ...userTurn,
        id: createTurnId("err"),
        role: "assistant",
        content: "⚠️ Koneksi ke gateway gagal. Silakan coba lagi. Aplikasi tidak menerbitkan tagihan internal. Biaya provider belum dapat dipastikan.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSession = () => {
    setTelemetryProbes([]);
    setTurnsByModel((prev) => ({
      ...prev,
      [activeModel.id]: [
        {
          id: createTurnId("turn-reset"),
          role: "assistant",
          content: `### Sesi Baru Dimulai · ${activeModel.name}\n\nSiap menerima instruksi Anda melalui peran **${activePersona.name}**. Silakan ketik pesan di bawah.`,
          modelId: activeModel.id,
          modelName: activeModel.name,
          provider: activeModel.provider,
          agentId: activePersona.id,
          timestamp: "Baru saja",
          tokensUsed: 0,
          wholesaleCostUsd: 0,
          retailChargeUsd: 0,
          latencyMs: 0,
        },
      ],
    }));
  };

  const handleRunBenchmarkSweep = () => {
    const nowTime = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const sweepTurns: ChatTurn[] = enabledModels.map((model, index) => {
      const inputTokens = 210 + index * 45;
      const outputTokens = 380 + index * 70;
      const econ = calculateTokenEconomics(model, inputTokens, outputTokens);
      const jitter = (index % 2 === 0 ? -1 : 1) * (16 + index * 8);
      const latencyMs = Math.max(175, model.avgLatencyMs + jitter);

      return {
        id: `bench-${Date.now()}-${model.id}`,
        role: "assistant",
        content: `Uji performa (${model.name})`,
        modelId: model.id,
        modelName: model.name,
        provider: model.provider,
        agentId: activePersona.id,
        timestamp: nowTime,
        tokensUsed: econ.totalTokens,
        wholesaleCostUsd: econ.wholesaleCostUsd,
        retailChargeUsd: econ.retailChargeUsd,
        latencyMs,
      };
    });

    setTelemetryProbes((prev) => [...prev, ...sweepTurns]);
  };

  const handleCopyTurn = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedTurnId(id);
      setTimeout(() => setCopiedTurnId(null), 1800);
    }
  };

  const handleToggleModelEnabled = (id: string) => {
    setModels((prev) => {
      const target = prev.find((m) => m.id === id);
      if (!target) return prev;
      const currentlyEnabled = prev.filter((m) => m.enabled);
      // Ensure at least one model stays enabled
      if (target.enabled && currentlyEnabled.length <= 1) {
        return prev;
      }
      const next = prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m));
      if (target.enabled && selectedModelId === id) {
        const nextEnabled = next.find((m) => m.enabled);
        if (nextEnabled) {
          setSelectedModelId(nextEnabled.id);
        }
      }
      return next;
    });
  };

  const handleUpdateMultiplier = (id: string, multiplier: number) => {
    setModels((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, retailMarkupMultiplier: multiplier } : m
      )
    );
  };

  const handleAddCustomModel = (newModel: AIModelConfig) => {
    setModels((prev) => [...prev, newModel]);
    setTurnsByModel((prev) => ({
      ...prev,
      [newModel.id]: [createWelcomeTurnForModel(newModel, activePersona.id)],
    }));
    handleSelectModelAndLaunch(newModel.id);
  };

  const handleCreateClientKey = (
    label: string,
    tier: ClientApiKey["tier"],
    quotaUsd: number
  ) => {
    const suffix = Math.random().toString(16).substring(2, 6);
    const created: ClientApiKey = {
      id: `key-${Date.now()}`,
      label,
      keyPreview: `sk-cm_demo_${suffix}...9f01`,
      tier,
      monthlyQuotaUsd: quotaUsd,
      usedUsd: 0,
      createdAt: "2026-11-03",
      active: true,
    };
    setClientKeys((prev) => [created, ...prev]);
  };

  const handleToggleKeyStatus = (id: string) => {
    setClientKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, active: !k.active } : k))
    );
  };

  const handleRevokeKey = (id: string) => {
    setClientKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const handleSendCoffeeSupport = (e: React.FormEvent) => {
    e.preventDefault();
    const chosen =
      COFFEE_TIERS.find((c) => c.id === selectedCoffeeId) || COFFEE_TIERS[1];
    const sender = supporterName.trim() || "Sahabat AI";
    setCoffeeCount((prev) => prev + chosen.cups);
    setCoffeeThankYou(
      `Pratinjau untuk ${sender}: ${chosen.title} (${chosen.amountIdr}). Tidak ada transaksi pembayaran atau dukungan yang diterima melalui formulir demo ini.`
    );
    setSupporterName("");
    setSupporterMessage("");
  };

  return (
    <div className="min-h-screen bg-white text-[#111113] flex flex-col justify-between">
      {/* Strict 3-Zone Minimalist Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#e4e4e7]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => setActiveView("models")}
            className="text-lg font-bold tracking-tight text-[#111113] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Codematt Agent
          </button>

          {/* Zone 2: Minimalist Tab Navigation */}
          <nav
            aria-label="Navigasi Utama"
            className="flex items-center gap-4 md:gap-6 text-xs md:text-sm font-medium text-[#52525b] overflow-x-auto py-1"
          >
            <button
              type="button"
              data-testid="nav-tab-models"
              onClick={() => setActiveView("models")}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === "models"
                  ? "text-[#111113] font-bold border-b-2 border-[#f5b800]"
                  : "hover:text-[#111113]"
              }`}
            >
              Pilih Model
            </button>
            <button
              type="button"
              data-testid="nav-tab-workspace"
              onClick={() => setActiveView("workspace")}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === "workspace"
                  ? "text-[#111113] font-bold border-b-2 border-[#f5b800]"
                  : "hover:text-[#111113]"
              }`}
            >
              Ruang Kerja ({activeModel.name})
            </button>
            <button
              type="button"
              data-testid="nav-tab-telemetry"
              onClick={() => setActiveView("telemetry")}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === "telemetry"
                  ? "text-[#111113] font-bold border-b-2 border-[#f5b800]"
                  : "hover:text-[#111113]"
              }`}
            >
              Statistik Sesi
            </button>
            <button
              type="button"
              data-testid="nav-tab-owner"
              onClick={() => setActiveView("owner")}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === "owner"
                  ? "text-[#111113] font-bold border-b-2 border-[#f5b800]"
                  : "hover:text-[#111113]"
              }`}
            >
              Pengaturan Owner
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/dashboard"
              data-testid="nav-link-agent-suite"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#111113] bg-[#fafafa] hover:bg-[#f4f4f5] border border-[#e4e4e7] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Building2 className="w-3.5 h-3.5 text-[#f5b800]" />
              <span>Studio Properti</span>
            </Link>
            <button
              type="button"
              onClick={handleResetSession}
              className="px-4 py-2 text-xs font-semibold text-[#111113] bg-[#f5b800] hover:bg-[#e5ac00] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sesi Baru
            </button>
          </div>
        </div>
      </header>

      {/* Main Focused Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        {/* VIEW 1: PILIH MODEL AI (DEFAULT MINIMALIST LANDING) */}
        {activeView === "models" && (
          <section
            id="models"
            aria-label="Pilihan Model AI"
            className="space-y-8"
          >
            <div className="max-w-2xl space-y-2">
              <div className="text-xs text-[#52525b] flex items-center gap-2">
                <span>Status:</span>
                <span className="font-mono font-semibold text-[#111113]">
                  {OWNER_EMAIL}
                </span>
                <span aria-hidden="true">·</span>
                <span>{enabledModels.length} model katalog demo</span>
              </div>
              <h1
                className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111113]"
                style={{ textWrap: "balance" }}
              >
                Pilih Model AI untuk Mulai Bekerja
              </h1>
              <p className="text-sm text-[#52525b] leading-relaxed">
                Pilih model untuk melihat pratinjau antarmuka. Adapter provider, autentikasi, biaya API, dan tagihan belum terhubung. Tidak ada respons langsung dari model berbayar di mode demo.
              </p>
            </div>

            {/* Ultra-Clean Model Selection Grid (Only agent-relevant info) */}
            <div
              data-testid="model-selector-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {enabledModels.map((model) => {
                const isSelected = model.id === activeModel.id;

                return (
                  <button
                    key={model.id}
                    type="button"
                    data-testid={`select-model-${model.id}`}
                    onClick={() => handleSelectModelAndLaunch(model.id)}
                    className={`group text-left p-6 rounded-xl border transition-all flex flex-col justify-between gap-6 cursor-pointer ${
                      isSelected
                        ? "bg-[#fef9c3]/55 border-[#f5b800] ring-2 ring-[#f5b800]/40"
                        : "bg-white border-[#e4e4e7] hover:border-[#f5b800]"
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-[#52525b]">
                        <span>{model.provider}</span>
                        <span className="font-mono tabular-nums">
                          {model.contextWindow}
                        </span>
                      </div>

                      <div className="text-lg font-bold text-[#111113]">
                        {model.name}
                      </div>

                      <p className="text-xs text-[#52525b] leading-relaxed">
                        {model.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#e4e4e7] flex items-center justify-between text-xs">
                      <span className="text-[#52525b]">
                        {model.strengths[0]}
                      </span>
                      <span className="font-semibold text-[#111113] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Buka Tab Model</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#f5b800]" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* VIEW 2: RUANG KERJA AGEN (AUTO-OPENED ON MODEL SELECT) */}
        {activeView === "workspace" && (
          <section
            id="workspace"
            data-testid="active-model-workspace"
            aria-label="Ruang Kerja Agen AI"
            className="space-y-5"
          >
            {/* Instant Model Tabs Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e4e4e7]">
              <div
                role="tablist"
                aria-label="Tab Model AI Aktif"
                className="flex items-center gap-1.5 overflow-x-auto py-1"
              >
                {enabledModels.map((model) => {
                  const isCurrent = model.id === activeModel.id;
                  return (
                    <button
                      key={model.id}
                      type="button"
                      role="tab"
                      aria-selected={isCurrent}
                      data-testid={`workspace-tab-${model.id}`}
                      onClick={() => setSelectedModelId(model.id)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isCurrent
                          ? "bg-[#f5b800] text-[#111113]"
                          : "bg-[#fafafa] text-[#52525b] hover:text-[#111113] border border-[#e4e4e7]"
                      }`}
                    >
                      {model.name}
                    </button>
                  );
                })}
              </div>

              {/* Minimalist Agent Controls Toggle (Hidden by default to keep workspace clean) */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  data-testid="toggle-agent-options"
                  onClick={() => setShowAgentConfig((prev) => !prev)}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                    showAgentConfig
                      ? "bg-[#fef9c3] border-[#f5b800] text-[#111113] font-semibold"
                      : "bg-white border-[#e4e4e7] text-[#52525b] hover:text-[#111113]"
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Peran: {activePersona.name}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCompareMode((prev) => !prev)}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                    compareMode
                      ? "bg-[#f5b800] border-[#f5b800] text-[#111113] font-semibold"
                      : "bg-white border-[#e4e4e7] text-[#52525b] hover:text-[#111113]"
                  }`}
                >
                  <Columns2 className="w-3.5 h-3.5" />
                  <span>Bandingkan 2 Model</span>
                </button>
              </div>
            </div>

            {/* Collapsible Agent Role & Custom Instruction Drawer (Only shown when requested) */}
            {showAgentConfig && (
              <div className="p-5 rounded-xl bg-[#fafafa] border border-[#e4e4e7] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111113]">
                    Pilih Peran Spesialis Agen
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAgentConfig(false)}
                    className="text-xs text-[#52525b] hover:text-[#111113] cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {AGENT_PERSONAS.map((persona) => {
                    const isSelected = persona.id === activePersona.id;
                    return (
                      <button
                        key={persona.id}
                        type="button"
                        onClick={() => setSelectedAgentId(persona.id)}
                        className={`text-left p-3.5 rounded-lg border transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-white border-[#f5b800] ring-1 ring-[#f5b800]"
                            : "bg-white border-[#e4e4e7] hover:border-[#111113]/30"
                        }`}
                      >
                        <div className="text-xs font-bold text-[#111113]">
                          {persona.name}
                        </div>
                        <div className="text-[11px] text-[#52525b] mt-0.5">
                          {persona.role}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1.5 text-xs">
                  <label
                    htmlFor="custom-system-instruction"
                    className="block font-semibold text-[#111113]"
                  >
                    Instruksi Khusus Tambahan (Opsional)
                  </label>
                  <input
                    id="custom-system-instruction"
                    type="text"
                    value={customSystemPrompt}
                    onChange={(e) => setCustomSystemPrompt(e.target.value)}
                    placeholder={activePersona.systemPrompt}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#e4e4e7] text-[#111113] text-xs"
                  />
                </div>
              </div>
            )}

            {/* Secondary Model Bar when Compare Mode is enabled */}
            {compareMode && (
              <div className="px-4 py-3 rounded-xl bg-[#fef9c3]/45 border border-[#f5b800] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-[#111113]">
                  Membandingkan langsung <strong>{activeModel.name}</strong> dengan{" "}
                  <strong>{secondaryModel?.name}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="compare-model-select"
                    className="font-semibold text-[#111113]"
                  >
                    Model Pembanding:
                  </label>
                  <select
                    id="compare-model-select"
                    value={secondaryModel?.id || ""}
                    onChange={(e) => setCompareModelId(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#e4e4e7] text-[#111113] font-medium"
                  >
                    {enabledModels
                      .filter((m) => m.id !== activeModel.id)
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.provider})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            )}

            {/* Focused Agent Chat Canvas */}
            <div className="flex flex-col rounded-xl bg-white border border-[#e4e4e7] min-h-[520px]">
              {/* Minimalist Header inside Workspace */}
              <div className="px-6 py-3.5 border-b border-[#e4e4e7] bg-[#fafafa] rounded-t-xl flex items-center justify-between gap-4">
                <div className="text-xs flex items-center gap-2">
                  <span className="font-bold text-[#111113] text-sm">
                    {activeModel.name}
                  </span>
                  {compareMode && secondaryModel && (
                    <span className="font-bold text-[#111113] text-sm">
                      vs. {secondaryModel.name}
                    </span>
                  )}
                  <span aria-hidden="true" className="text-[#52525b]">
                    ·
                  </span>
                  <span className="text-[#52525b]">{activeModel.provider}</span>
                </div>

                <button
                  type="button"
                  onClick={handleResetSession}
                  aria-label="Bersihkan Percakapan"
                  className="px-2.5 py-1 rounded-lg border border-[#e4e4e7] bg-white hover:bg-[#fafafa] text-xs text-[#52525b] hover:text-[#111113] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Bersihkan</span>
                </button>
              </div>

              {/* Conversation Stream (Distraction-free, no billing clutter) */}
              <div className="flex-1 p-6 space-y-5 overflow-y-auto max-h-[460px]">
                {turns.map((t) => {
                  if (t.role === "user") {
                    return (
                      <div key={t.id} className="flex justify-end">
                        <div className="max-w-xl px-4 py-3 rounded-xl bg-[#fef9c3] border border-[#f5b800] text-[#111113] text-xs sm:text-sm leading-relaxed">
                          <p className="whitespace-pre-wrap">{t.content}</p>
                        </div>
                      </div>
                    );
                  }

                  if (t.comparisonResponses && t.comparisonResponses.length === 2) {
                    return (
                      <div key={t.id} className="space-y-2">
                        <div className="text-xs text-[#52525b]">
                          Perbandingan Respons · {t.timestamp}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {t.comparisonResponses.map((cmp) => (
                            <div
                              key={cmp.modelId}
                              className="p-4 rounded-xl bg-[#fafafa] border border-[#e4e4e7] space-y-2 text-xs leading-relaxed"
                            >
                              <div className="flex items-center justify-between pb-2 border-b border-[#e4e4e7]">
                                <span className="font-bold text-[#111113]">
                                  {cmp.modelName}
                                </span>
                                <span className="text-[#52525b]">
                                  {cmp.provider}
                                </span>
                              </div>
                              <FormattedMessage text={cmp.content} />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={t.id}
                      className="p-5 rounded-xl bg-[#fafafa] border border-[#e4e4e7] space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs text-[#52525b] pb-2 border-b border-[#e4e4e7]">
                        <div>
                          <span className="font-bold text-[#111113]">
                            {t.modelName}
                          </span>
                          <span aria-hidden="true"> · </span>
                          <span>{activePersona.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyTurn(t.id, t.content)}
                          aria-label="Salin jawaban"
                          className="text-[#52525b] hover:text-[#111113] inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedTurnId === t.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>

                      <FormattedMessage text={t.content} />
                    </div>
                  );
                })}

                {loading && (
                  <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e4e4e7] text-xs text-[#52525b]">
                    Memproses bersama {activeModel.name}...
                  </div>
                )}
              </div>

              {/* Quick Starter Prompts Row */}
              <div className="px-6 py-2.5 bg-[#fafafa] border-t border-[#e4e4e7] flex items-center gap-2 overflow-x-auto">
                <Sparkles className="w-3.5 h-3.5 text-[#f5b800] shrink-0" />
                {activePersona.starterPrompts.map((sp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleRunPrompt(sp)}
                    disabled={loading}
                    className="px-3 py-1 rounded-lg bg-white border border-[#e4e4e7] hover:border-[#f5b800] text-xs text-[#111113] whitespace-nowrap shrink-0 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {sp}
                  </button>
                ))}
              </div>

              {/* Minimalist Prompt Input Bar */}
              <div className="p-4 border-t border-[#e4e4e7] bg-white rounded-b-xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRunPrompt();
                  }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input
                    ref={promptInputRef}
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder={`Tulis instruksi untuk ${activeModel.name}...`}
                    aria-label="Input pesan untuk agen AI"
                    className="flex-1 px-4 py-3 rounded-lg bg-[#fafafa] border border-[#e4e4e7] text-xs sm:text-sm text-[#111113] placeholder:text-[#52525b]"
                  />
                  <button
                    type="submit"
                    disabled={loading || !promptInput.trim()}
                    className="px-5 py-3 rounded-lg bg-[#f5b800] hover:bg-[#e5ac00] disabled:opacity-50 text-[#111113] text-xs font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{loading ? "Memproses..." : "Kirim"}</span>
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}

        {/* VIEW 3: STATISTIK SESI & TELEMETRI VISUAL */}
        {activeView === "telemetry" && (
          <SessionTelemetryDashboard
            models={models}
            turns={sessionTelemetryTurns}
            selectedModelId={activeModel.id}
            onSelectModel={(id) => handleSelectModelAndLaunch(id)}
            onRunBenchmarkSweep={handleRunBenchmarkSweep}
          />
        )}

        {/* VIEW 4: PENGATURAN OWNER (REGISTRI MODEL & KOMERSIALISASI) */}
        {activeView === "owner" && (
          <div className="space-y-10">
            <ModelRegistryPanel
              models={models}
              selectedModelId={activeModel.id}
              onSelectModel={(id) => handleSelectModelAndLaunch(id)}
              onToggleModelEnabled={handleToggleModelEnabled}
              onUpdateMultiplier={handleUpdateMultiplier}
              onAddCustomModel={handleAddCustomModel}
            />

            <CommercialHubPanel
              ownerEmail={OWNER_EMAIL}
              sessionTokens={sessionTokens}
              sessionWholesaleUsd={sessionWholesaleUsd}
              sessionRetailUsd={sessionRetailUsd}
              clientKeys={clientKeys}
              onCreateKey={handleCreateClientKey}
              onToggleKeyStatus={handleToggleKeyStatus}
              onRevokeKey={handleRevokeKey}
            />
          </div>
        )}
      </main>

      {/* ENGAGING BOTTOM SUB-MENU & "TRAKTIR KOPI" SUPPORT DOCK */}
      <footer
        aria-label="Sub-menu Bawah dan Dukungan Proyek"
        className="sticky bottom-0 z-30 bg-white/95 backdrop-blur border-t border-[#e4e4e7]"
      >
        {/* Expandable "Traktir Kopi" (Buy a Coffee) Interactive Support Drawer */}
        {showCoffeeMenu && (
          <div
            data-testid="coffee-support-drawer"
            className="border-b border-[#e4e4e7] bg-[#fafafa]"
          >
            <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#111113]">
                    <Coffee className="w-4 h-4 text-[#f5b800]" />
                    <span>Traktir Kopi untuk Pengembangan Codematt Agent</span>
                  </div>
                  <p className="text-xs text-[#52525b] max-w-xl">
                    Formulir dukungan ini hanya demonstrasi. Belum ada pembayaran atau pengiriman dukungan yang diproses.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCoffeeMenu(false)}
                  aria-label="Tutup panel traktir kopi"
                  className="p-1.5 rounded-lg border border-[#e4e4e7] bg-white text-[#52525b] hover:text-[#111113] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {coffeeThankYou && (
                <div
                  role="status"
                  data-testid="coffee-thank-you-banner"
                  className="p-4 rounded-xl bg-[#fef9c3] border border-[#f5b800] flex items-center justify-between gap-4 text-xs text-[#111113]"
                >
                  <div className="flex items-center gap-2 font-medium">
                    <Heart className="w-4 h-4 text-[#111113] fill-current shrink-0" />
                    <span>{coffeeThankYou}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCoffeeThankYou(null)}
                    className="font-semibold underline cursor-pointer shrink-0"
                  >
                    Tutup
                  </button>
                </div>
              )}

              <form
                onSubmit={handleSendCoffeeSupport}
                className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end"
              >
                {/* 3 Coffee Tier Cards */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {COFFEE_TIERS.map((tier) => {
                    const isPicked = tier.id === selectedCoffeeId;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        data-testid={`select-${tier.id}`}
                        onClick={() => setSelectedCoffeeId(tier.id)}
                        className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                          isPicked
                            ? "bg-[#fef9c3]/65 border-[#f5b800] ring-1 ring-[#f5b800]"
                            : "bg-white border-[#e4e4e7] hover:border-[#111113]/40"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono font-bold text-[#111113]">
                          <span className="inline-flex items-center gap-1 text-[#111113]">
                            <Coffee className="w-3.5 h-3.5 text-[#f5b800]" />
                            <span>{tier.cups}x</span>
                          </span>
                          <span>{tier.amountIdr}</span>
                        </div>
                        <div className="text-xs font-bold text-[#111113] mt-2">
                          {tier.title}
                        </div>
                        <p className="text-[11px] text-[#52525b] mt-1">
                          {tier.caption}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Supporter Name, Message & Submit Button */}
                <div className="lg:col-span-5 flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    value={supporterName}
                    onChange={(e) => setSupporterName(e.target.value)}
                    placeholder="Nama Anda (opsional)"
                    aria-label="Nama pendukung"
                    className="px-3 py-2.5 rounded-lg bg-white border border-[#e4e4e7] text-xs text-[#111113] sm:w-40"
                  />
                  <input
                    type="text"
                    value={supporterMessage}
                    onChange={(e) => setSupporterMessage(e.target.value)}
                    placeholder="Pesan semangat..."
                    aria-label="Pesan dukungan"
                    className="flex-1 px-3 py-2.5 rounded-lg bg-white border border-[#e4e4e7] text-xs text-[#111113]"
                  />
                  <button
                    type="submit"
                    data-testid="submit-coffee-support"
                    className="px-4 py-2.5 rounded-lg bg-[#f5b800] hover:bg-[#e5ac00] text-[#111113] text-xs font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    <span>Kirim Kopi</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bottom Sub-Menu Bar */}
        <div className="max-w-6xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Quick Sub-Menu Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveView("models")}
              className={`px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                activeView === "models"
                  ? "bg-[#111113] text-white font-semibold"
                  : "text-[#52525b] hover:text-[#111113] hover:bg-[#fafafa]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Daftar Model</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("workspace")}
              className={`px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                activeView === "workspace"
                  ? "bg-[#111113] text-white font-semibold"
                  : "text-[#52525b] hover:text-[#111113] hover:bg-[#fafafa]"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Tab Aktif: {activeModel.name}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("telemetry")}
              className={`px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                activeView === "telemetry"
                  ? "bg-[#111113] text-white font-semibold"
                  : "text-[#52525b] hover:text-[#111113] hover:bg-[#fafafa]"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Statistik ({sessionTokens.toLocaleString("id-ID")} tok)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("owner")}
              className={`px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                activeView === "owner"
                  ? "bg-[#111113] text-white font-semibold"
                  : "text-[#52525b] hover:text-[#111113] hover:bg-[#fafafa]"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Pengaturan Owner</span>
            </button>
          </div>

          {/* Engaging "Traktir Kopi / Buy a Coffee" CTA Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-testid="buy-coffee-trigger"
              onClick={() => setShowCoffeeMenu((prev) => !prev)}
              className="px-3.5 py-1.5 rounded-lg bg-[#fef9c3] hover:bg-[#f5b800] border border-[#f5b800] text-[#111113] font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Traktir Kopi</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{coffeeCount}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FormattedMessage({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        blocks.push(
          <pre
            key={`code-${idx}`}
            className="p-3.5 rounded-lg bg-white border border-[#e4e4e7] font-mono text-xs text-[#111113] overflow-x-auto"
          >
            <code>{codeBuffer.join("\n")}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    if (!trimmed) {
      return;
    }

    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h4 key={idx} className="text-sm font-bold text-[#111113] pt-1">
          {renderInlineFormatting(trimmed.replace(/^###\s+/, ""))}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
      blocks.push(
        <h3 key={idx} className="text-base font-bold text-[#111113] pt-1">
          {renderInlineFormatting(trimmed.replace(/^#+\s+/, ""))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      blocks.push(
        <div
          key={idx}
          className="flex items-start gap-2 text-xs sm:text-sm text-[#111113] leading-relaxed pl-1"
        >
          <span
            className="text-[#f5b800] font-bold select-none"
            aria-hidden="true"
          >
            •
          </span>
          <span>{renderInlineFormatting(trimmed.slice(2))}</span>
        </div>
      );
      return;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const match = trimmed.match(/^(\d+\.)\s+(.*)$/);
      if (match) {
        blocks.push(
          <div
            key={idx}
            className="flex items-start gap-2 text-xs sm:text-sm text-[#111113] leading-relaxed pl-1"
          >
            <span className="font-mono font-bold text-[#111113] select-none">
              {match[1]}
            </span>
            <span>{renderInlineFormatting(match[2])}</span>
          </div>
        );
        return;
      }
    }

    blocks.push(
      <p key={idx} className="text-xs sm:text-sm text-[#111113] leading-relaxed">
        {renderInlineFormatting(trimmed)}
      </p>
    );
  });

  return <div className="space-y-2">{blocks}</div>;
}

function renderInlineFormatting(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[#111113]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-white border border-[#e4e4e7] font-mono text-[11px] text-[#111113]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
