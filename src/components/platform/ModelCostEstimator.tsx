"use client";

import React, { useState, useMemo } from "react";
import {
  Calculator,
  ArrowRight,
  ArrowRightLeft,
  Check,
  TrendingDown,
  TrendingUp,
  Zap,
  Coins,
  Sparkles,
  BarChart2,
  Calendar,
} from "lucide-react";
import {
  AIModelConfig,
  calculateModelSwitchSavings,
  compareAllModelSwitchSavings,
} from "@/features/platform/model-gateway";

interface ModelCostEstimatorProps {
  models: AIModelConfig[];
  selectedModelId: string;
  sessionTokens: number;
  totalRequests: number;
  onSelectModel: (modelId: string) => void;
}

type WorkloadPreset = "session-extrapolated" | "solo-dev" | "startup-team" | "enterprise";

export function ModelCostEstimator({
  models,
  selectedModelId,
  sessionTokens,
  totalRequests,
  onSelectModel,
}: ModelCostEstimatorProps) {
  const enabledModels = useMemo(() => models.filter((m) => m.enabled), [models]);

  // Default to a premium source model if available, else first enabled model
  const [sourceModelId, setSourceModelId] = useState<string>(() => {
    const hasGpt = enabledModels.find((m) => m.id === "chatgpt-4o");
    if (hasGpt) return hasGpt.id;
    const hasClaude = enabledModels.find((m) => m.id === "claude-3-7-sonnet");
    if (hasClaude) return hasClaude.id;
    return enabledModels[0]?.id || "gemini-3.8-flash";
  });

  // Default target model to high-efficiency model (e.g. Gemini 3.8 Flash or DeepSeek R1)
  const [targetModelId, setTargetModelId] = useState<string>(() => {
    const flash = enabledModels.find((m) => m.id === "gemini-3.8-flash");
    if (flash && flash.id !== sourceModelId) return flash.id;
    const deepseek = enabledModels.find((m) => m.id === "deepseek-r1");
    if (deepseek && deepseek.id !== sourceModelId) return deepseek.id;
    return enabledModels.find((m) => m.id !== sourceModelId)?.id || enabledModels[0]?.id || "gemini-3.8-flash";
  });

  // Monthly token volume state
  const sessionRunRateMonthly = useMemo(() => {
    // Extrapolate current session usage pattern: assuming ~30 active workdays and ~3-4 sessions/day
    const base = Math.max(500_000, sessionTokens * 100);
    return Math.round(base / 100_000) * 100_000;
  }, [sessionTokens]);

  const [workloadPreset, setWorkloadPreset] = useState<WorkloadPreset>("session-extrapolated");
  const [monthlyTokens, setMonthlyTokens] = useState<number>(sessionRunRateMonthly);
  const [viewMode, setViewMode] = useState<"wholesale" | "retail">("wholesale");

  const sourceModel = enabledModels.find((m) => m.id === sourceModelId) || enabledModels[0];
  const targetModel = enabledModels.find((m) => m.id === targetModelId) || enabledModels[1] || enabledModels[0];

  // Calculate current comparison
  const savings = useMemo(() => {
    if (!sourceModel || !targetModel) return null;
    return calculateModelSwitchSavings({
      sourceModel,
      targetModel,
      monthlyTokens,
      inputRatio: 0.35,
    });
  }, [sourceModel, targetModel, monthlyTokens]);

  // Calculate comparisons against all other enabled models
  const allComparisons = useMemo(() => {
    if (!sourceModel) return [];
    return compareAllModelSwitchSavings({
      sourceModel,
      allModels: enabledModels,
      monthlyTokens,
      inputRatio: 0.35,
    });
  }, [sourceModel, enabledModels, monthlyTokens]);

  const handleApplyPreset = (preset: WorkloadPreset) => {
    setWorkloadPreset(preset);
    if (preset === "session-extrapolated") {
      setMonthlyTokens(sessionRunRateMonthly);
    } else if (preset === "solo-dev") {
      setMonthlyTokens(5_000_000);
    } else if (preset === "startup-team") {
      setMonthlyTokens(25_000_000);
    } else if (preset === "enterprise") {
      setMonthlyTokens(100_000_000);
    }
  };

  const handleSwapModels = () => {
    const temp = sourceModelId;
    setSourceModelId(targetModelId);
    setTargetModelId(temp);
  };

  if (!sourceModel || !targetModel || !savings) {
    return null;
  }

  const isSaving = savings.isCheaper;
  const monthlyDisplaySavings =
    viewMode === "wholesale"
      ? savings.wholesaleMonthlySavingsUsd
      : savings.retailMonthlySavingsUsd;

  return (
    <div
      data-testid="model-cost-estimator"
      className="p-6 rounded-xl bg-white border border-[#e4e4e7] space-y-6 scroll-mt-24"
    >
      {/* Header and Value Proposition */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#e4e4e7] pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#111113]">
            <Calculator className="w-4 h-4 text-[#f5b800]" />
            <span>Kalkulator Estimasi Penghematan Biaya Beralih Model</span>
          </div>
          <h3 className="text-lg font-bold text-[#111113]">
            Hitung Penghematan Bulanan Berdasarkan Pola Sesi Anda
          </h3>
          <p className="text-xs text-[#52525b] max-w-2xl">
            Simulasikan penghematan anggaran atau margin komersial saat mengalihkan beban kerja antar-model AI berdasarkan volume dan latensi sesi aktif Anda.
          </p>
        </div>

        {/* View Mode Toggle: Modal Penyedia vs Nilai Ritel */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-[#52525b]">Mode Biaya:</span>
          <div
            role="group"
            aria-label="Mode Biaya"
            className="flex items-center gap-1 p-1 bg-[#fafafa] border border-[#e4e4e7] rounded-lg"
          >
            <button
              type="button"
              data-testid="toggle-mode-wholesale"
              onClick={() => setViewMode("wholesale")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === "wholesale"
                  ? "bg-[#111113] text-white font-semibold"
                  : "text-[#52525b] hover:text-[#111113]"
              }`}
            >
              Modal Penyedia
            </button>
            <button
              type="button"
              data-testid="toggle-mode-retail"
              onClick={() => setViewMode("retail")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === "retail"
                  ? "bg-[#f5b800] text-[#111113] font-semibold"
                  : "text-[#52525b] hover:text-[#111113]"
              }`}
            >
              Nilai Jual Ritel
            </button>
          </div>
        </div>
      </div>

      {/* Baseline Session Usage Patterns Bar */}
      <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e4e4e7] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-[#52525b]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[#111113]">
            <BarChart2 className="w-3.5 h-3.5 text-[#f5b800]" />
            <span>Pola Sesi Aktif:</span>
          </span>
          <span>
            Total: <strong className="text-[#111113] font-mono">{sessionTokens.toLocaleString("id-ID")}</strong> tok
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Eksekusi: <strong className="text-[#111113] font-mono">{totalRequests}</strong> panggilan
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Rata-rata: <strong className="text-[#111113] font-mono">{Math.round(sessionTokens / Math.max(1, totalRequests))}</strong> tok / run
          </span>
          <span aria-hidden="true">·</span>
          <span>Rasio Input/Output: ~35% / 65%</span>
        </div>

        <div className="text-[11px] text-[#52525b] font-mono bg-white px-2.5 py-1 rounded-lg border border-[#e4e4e7]">
          Ekstrapolasi Bulanan: {(sessionRunRateMonthly / 1_000_000).toFixed(1)}M token
        </div>
      </div>

      {/* Workload Presets & Interactive Slider */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-[#111113] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#f5b800]" />
            <span>Proyeksi Volume Beban Kerja Bulanan:</span>
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              data-testid="preset-session"
              onClick={() => handleApplyPreset("session-extrapolated")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                workloadPreset === "session-extrapolated"
                  ? "bg-[#111113] text-white"
                  : "bg-[#fafafa] border border-[#e4e4e7] text-[#52525b] hover:text-[#111113]"
              }`}
            >
              Pola Sesi ({(sessionRunRateMonthly / 1_000_000).toFixed(1)}M)
            </button>
            <button
              type="button"
              data-testid="preset-solo"
              onClick={() => handleApplyPreset("solo-dev")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                workloadPreset === "solo-dev"
                  ? "bg-[#111113] text-white"
                  : "bg-[#fafafa] border border-[#e4e4e7] text-[#52525b] hover:text-[#111113]"
              }`}
            >
              Solo Dev (5M)
            </button>
            <button
              type="button"
              data-testid="preset-startup"
              onClick={() => handleApplyPreset("startup-team")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                workloadPreset === "startup-team"
                  ? "bg-[#111113] text-white"
                  : "bg-[#fafafa] border border-[#e4e4e7] text-[#52525b] hover:text-[#111113]"
              }`}
            >
              Tim Startup (25M)
            </button>
            <button
              type="button"
              data-testid="preset-enterprise"
              onClick={() => handleApplyPreset("enterprise")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                workloadPreset === "enterprise"
                  ? "bg-[#111113] text-white"
                  : "bg-[#fafafa] border border-[#e4e4e7] text-[#52525b] hover:text-[#111113]"
              }`}
            >
              Produksi (100M)
            </button>
          </div>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={500_000}
            max={150_000_000}
            step={500_000}
            value={monthlyTokens}
            data-testid="monthly-tokens-slider"
            onChange={(e) => {
              setMonthlyTokens(Number(e.target.value));
              setWorkloadPreset("session-extrapolated");
            }}
            className="flex-1 accent-[#f5b800] cursor-pointer"
          />
          <span className="font-mono tabular-nums text-sm font-bold text-[#111113] bg-[#fafafa] px-3 py-1 rounded-lg border border-[#e4e4e7] shrink-0">
            {(monthlyTokens / 1_000_000).toFixed(1)}M token / bln
          </span>
        </div>
      </div>

      {/* Model Pair Selection Dock */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
        {/* Source Model Selector */}
        <div className="md:col-span-5 p-4 rounded-xl bg-white border border-[#e4e4e7] space-y-2">
          <label htmlFor="source-model-select" className="text-xs font-semibold text-[#52525b] block">
            Model Saat Ini / Asal:
          </label>
          <div className="flex items-center gap-2">
            <select
              id="source-model-select"
              data-testid="source-model-select"
              value={sourceModel.id}
              onChange={(e) => {
                const nextSource = e.target.value;
                if (nextSource === targetModel.id) {
                  setTargetModelId(sourceModel.id);
                }
                setSourceModelId(nextSource);
              }}
              className="w-full px-3 py-2 rounded-lg bg-[#fafafa] border border-[#e4e4e7] text-xs font-bold text-[#111113]"
            >
              {enabledModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-[#52525b] pt-1">
            <span>Latensi: ~{sourceModel.avgLatencyMs}ms</span>
            <span>${sourceModel.wholesaleInputPer1M.toFixed(2)}/1M in · ${sourceModel.wholesaleOutputPer1M.toFixed(2)}/1M out</span>
          </div>
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex justify-center">
          <button
            type="button"
            data-testid="swap-models-btn"
            onClick={handleSwapModels}
            aria-label="Tukar posisi model asal dan tujuan"
            className="p-2.5 rounded-full border border-[#e4e4e7] bg-[#fafafa] hover:bg-[#fef9c3] hover:border-[#f5b800] text-[#111113] transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Target Model Selector */}
        <div className="md:col-span-5 p-4 rounded-xl bg-[#fef9c3]/30 border border-[#f5b800] space-y-2">
          <label htmlFor="target-model-select" className="text-xs font-semibold text-[#111113] block">
            Model Tujuan Beralih:
          </label>
          <div className="flex items-center gap-2">
            <select
              id="target-model-select"
              data-testid="target-model-select"
              value={targetModel.id}
              onChange={(e) => {
                const nextTarget = e.target.value;
                if (nextTarget === sourceModel.id) {
                  setSourceModelId(targetModel.id);
                }
                setTargetModelId(nextTarget);
              }}
              className="w-full px-3 py-2 rounded-lg bg-white border border-[#f5b800] text-xs font-bold text-[#111113]"
            >
              {enabledModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-[#111113] pt-1">
            <span>Latensi: ~{targetModel.avgLatencyMs}ms</span>
            <span>${targetModel.wholesaleInputPer1M.toFixed(2)}/1M in · ${targetModel.wholesaleOutputPer1M.toFixed(2)}/1M out</span>
          </div>
        </div>
      </div>

      {/* Highlight Hero Card: Monthly Savings Result */}
      <div
        data-testid="savings-hero-card"
        className={`p-6 rounded-xl border transition-all ${
          isSaving
            ? "bg-[#fef9c3]/65 border-[#f5b800]"
            : "bg-[#fafafa] border-[#e4e4e7]"
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              {isSaving ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Penghematan {savings.savingsPercent}%</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Investasi Kualitas +{Math.abs(savings.savingsPercent)}%</span>
                </span>
              )}
              <span className="text-[#52525b]">
                Berdasarkan volume {(monthlyTokens / 1_000_000).toFixed(1)}M token / bulan
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-[#111113]">
                {isSaving ? `+` : `-`}${Math.abs(monthlyDisplaySavings).toFixed(2)}
                <span className="text-sm font-normal text-[#52525b] ml-1.5">/ bulan</span>
              </span>
              {isSaving && (
                <span className="text-xs font-mono text-[#52525b]">
                  ({savings.efficiencyRatio}x lebih efisien)
                </span>
              )}
            </div>

            <p className="text-xs text-[#111113] leading-relaxed max-w-2xl">
              {savings.summaryText}
            </p>

            {isSaving && (
              <div className="text-xs text-[#52525b] font-mono pt-1">
                Estimasi tahunan:{" "}
                <strong className="text-[#111113]">
                  ${savings.annualSavingsUsd.toLocaleString("en-US")} / tahun
                </strong>{" "}
                (~Rp {Math.round(savings.annualSavingsIdr / 1_000_000).toLocaleString("id-ID")} juta)
              </div>
            )}
          </div>

          <div className="lg:col-span-4 flex flex-col justify-center gap-3 border-t lg:border-t-0 lg:border-l border-[#e4e4e7] pt-4 lg:pt-0 lg:pl-6">
            <div className="space-y-1 text-xs">
              <div className="text-[#52525b]">Dampak Kecepatan:</div>
              <div className="font-bold text-[#111113] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#f5b800]" />
                {savings.latencyDeltaMs < 0 ? (
                  <span>
                    {Math.abs(savings.latencyDeltaMs)}ms lebih cepat ({savings.speedupPercent}% speedup)
                  </span>
                ) : savings.latencyDeltaMs === 0 ? (
                  <span>Kecepatan identik</span>
                ) : (
                  <span>+{savings.latencyDeltaMs}ms kompromi latensi</span>
                )}
              </div>
            </div>

            <button
              type="button"
              data-testid="apply-switch-model-btn"
              onClick={() => onSelectModel(targetModel.id)}
              className="w-full py-2.5 px-4 rounded-lg bg-[#111113] hover:bg-[#27272a] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {targetModel.id === selectedModelId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#f5b800]" />
                  <span>Model Ini Sedang Aktif di Ruang Kerja</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#f5b800]" />
                  <span>Beralih ke {targetModel.name} Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4-Card Comparative Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-white border border-[#e4e4e7] space-y-1">
          <span className="text-[#52525b] block">Biaya Bulanan Model Asal</span>
          <div className="text-xl font-bold font-mono tabular-nums text-[#111113]">
            ${viewMode === "wholesale" ? savings.sourceWholesaleMonthlyUsd.toFixed(2) : savings.sourceRetailMonthlyUsd.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#52525b] pt-1">
            {sourceModel.name}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#e4e4e7] space-y-1">
          <span className="text-[#52525b] block">Biaya Bulanan Model Baru</span>
          <div className="text-xl font-bold font-mono tabular-nums text-[#111113]">
            ${viewMode === "wholesale" ? savings.targetWholesaleMonthlyUsd.toFixed(2) : savings.targetRetailMonthlyUsd.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#52525b] pt-1">
            {targetModel.name}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#e4e4e7] space-y-1">
          <span className="text-[#52525b] block">Penghematan Bersih Bulanan</span>
          <div className={`text-xl font-bold font-mono tabular-nums ${isSaving ? "text-emerald-700" : "text-amber-700"}`}>
            {isSaving ? `+` : `-`}${Math.abs(monthlyDisplaySavings).toFixed(2)}
          </div>
          <div className="text-[11px] text-[#52525b] pt-1">
            {isSaving ? `${savings.savingsPercent}% lebih hemat` : `investasi tambahan`}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#e4e4e7] space-y-1">
          <span className="text-[#52525b] block">Perbandingan Latensi</span>
          <div className="text-xl font-bold font-mono tabular-nums text-[#111113]">
            {targetModel.avgLatencyMs} ms
          </div>
          <div className="text-[11px] text-[#52525b] pt-1">
            vs {sourceModel.avgLatencyMs} ms ({sourceModel.name})
          </div>
        </div>
      </div>

      {/* Matrix of Alternatives from Source Model */}
      <div className="rounded-xl border border-[#e4e4e7] overflow-hidden">
        <div className="px-5 py-3.5 bg-[#fafafa] border-b border-[#e4e4e7] flex items-center justify-between text-xs">
          <div className="font-bold text-[#111113] flex items-center gap-2">
            <Coins className="w-3.5 h-3.5 text-[#f5b800]" />
            <span>Peluang Penghematan jika Beralih dari {sourceModel.name} ke Model Lain</span>
          </div>
          <span className="text-[#52525b] font-mono">
            Volume: {(monthlyTokens / 1_000_000).toFixed(1)}M token / bln
          </span>
        </div>

        <div className="divide-y divide-[#e4e4e7] text-xs">
          {allComparisons.map((item) => {
            const isTarget = item.targetModelId === targetModel.id;
            const isCurrentSelected = item.targetModelId === selectedModelId;

            return (
              <div
                key={item.targetModelId}
                data-testid={`savings-row-${item.targetModelId}`}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  isTarget ? "bg-[#fef9c3]/30" : "hover:bg-[#fafafa]"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-[#111113] flex items-center gap-2">
                    <span>{item.targetModelName}</span>
                    {isTarget && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[#f5b800] text-[#111113] font-semibold">
                        Dipilih
                      </span>
                    )}
                    {isCurrentSelected && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[#111113] text-white font-semibold">
                        Aktif
                      </span>
                    )}
                  </div>
                  <div className="text-[#52525b] text-[11px]">
                    Biaya baru: ${viewMode === "wholesale" ? item.targetWholesaleMonthlyUsd.toFixed(2) : item.targetRetailMonthlyUsd.toFixed(2)}/bln ·{" "}
                    Latensi: {item.latencyDeltaMs < 0 ? `${Math.abs(item.latencyDeltaMs)}ms lebih cepat` : `+${item.latencyDeltaMs}ms`}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className={`font-mono font-bold text-sm tabular-nums ${item.isCheaper ? "text-emerald-700" : "text-amber-700"}`}>
                      {item.isCheaper ? `+` : `-`}${Math.abs(viewMode === "wholesale" ? item.wholesaleMonthlySavingsUsd : item.retailMonthlySavingsUsd).toFixed(2)}/bln
                    </div>
                    <div className="text-[11px] text-[#52525b]">
                      {item.isCheaper ? `Hemat ${item.savingsPercent}%` : `Investasi +${Math.abs(item.savingsPercent)}%`}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      data-testid={`compare-pick-${item.targetModelId}`}
                      onClick={() => setTargetModelId(item.targetModelId)}
                      className="px-3 py-1.5 rounded-lg border border-[#e4e4e7] bg-white hover:bg-[#fafafa] text-[#111113] font-medium transition-colors cursor-pointer"
                    >
                      Bandingkan
                    </button>
                    <button
                      type="button"
                      data-testid={`switch-to-${item.targetModelId}`}
                      onClick={() => onSelectModel(item.targetModelId)}
                      className="px-3 py-1.5 rounded-lg bg-[#f5b800] hover:bg-[#e5ac00] text-[#111113] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Pakai</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
