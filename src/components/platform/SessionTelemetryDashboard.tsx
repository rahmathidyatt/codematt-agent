"use client";

import React, { useState, useMemo } from "react";
import {
  Play,
  ArrowUpRight,
  Check,
} from "lucide-react";
import {
  AIModelConfig,
  ChatTurn,
  summarizeSessionTelemetry,
} from "@/features/platform/model-gateway";
import { ModelLatencyCostD3Chart } from "@/components/platform/ModelLatencyCostD3Chart";

interface SessionTelemetryDashboardProps {
  models: AIModelConfig[];
  turns: ChatTurn[];
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  onRunBenchmarkSweep: () => void;
}

type SortCriterion = "tokens" | "efficiency" | "latency";

export function SessionTelemetryDashboard({
  models,
  turns,
  selectedModelId,
  onSelectModel,
  onRunBenchmarkSweep,
}: SessionTelemetryDashboardProps) {
  const [sortBy, setSortBy] = useState<SortCriterion>("tokens");

  const summary = useMemo(
    () => summarizeSessionTelemetry(models, turns),
    [models, turns]
  );

  const sortedRows = useMemo(() => {
    const copy = [...summary.rows];
    if (sortBy === "tokens") {
      return copy.sort(
        (a, b) => b.tokensUsed - a.tokensUsed || a.avgLatencyMs - b.avgLatencyMs
      );
    }
    if (sortBy === "efficiency") {
      return copy.sort(
        (a, b) =>
          b.efficiencyIndex - a.efficiencyIndex ||
          a.blendedWholesalePer1kUsd - b.blendedWholesalePer1kUsd
      );
    }
    return copy.sort((a, b) => a.avgLatencyMs - b.avgLatencyMs);
  }, [summary.rows, sortBy]);

  const maxTokensAcrossModels = Math.max(
    ...summary.rows.map((r) => r.tokensUsed),
    100
  );

  return (
    <section
      id="telemetry"
      data-testid="session-telemetry-dashboard"
      aria-label="Dasbor Telemetri Sesi dan Performa Model"
      className="py-6 space-y-8 scroll-mt-20"
    >
      {/* Section Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-medium text-[#52525b] mb-1">
            Statistik Sesi & Perbandingan Antar-Model
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-[#111113]">
            Pemakaian Token, Efisiensi Biaya & Latensi Performa
          </h2>
          <p className="text-sm text-[#52525b] mt-1 max-w-2xl">
            Ringkasan visual real-time di seluruh model AI yang terintegrasi pada sesi ini, mencakup distribusi token, efisiensi biaya, dan kecepatan respons.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Interactive Sort Segmented Control */}
          <div
            role="group"
            aria-label="Urutkan Telemetri Berdasarkan"
            className="flex items-center gap-1 p-1 bg-[#fafafa] border border-[#e4e4e7] rounded-lg"
          >
            <button
              type="button"
              data-testid="sort-telemetry-tokens"
              onClick={() => setSortBy("tokens")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                sortBy === "tokens"
                  ? "bg-[#f5b800] text-[#111113] font-semibold"
                  : "text-[#52525b] hover:text-[#111113]"
              }`}
            >
              Volume Token
            </button>
            <button
              type="button"
              data-testid="sort-telemetry-efficiency"
              onClick={() => setSortBy("efficiency")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                sortBy === "efficiency"
                  ? "bg-[#f5b800] text-[#111113] font-semibold"
                  : "text-[#52525b] hover:text-[#111113]"
              }`}
            >
              Efisiensi Biaya
            </button>
            <button
              type="button"
              data-testid="sort-telemetry-latency"
              onClick={() => setSortBy("latency")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                sortBy === "latency"
                  ? "bg-[#f5b800] text-[#111113] font-semibold"
                  : "text-[#52525b] hover:text-[#111113]"
              }`}
            >
              Latensi Tercepat
            </button>
          </div>

          <button
            type="button"
            onClick={onRunBenchmarkSweep}
            data-testid="benchmark-all-models-btn"
            className="px-4 py-2 rounded-lg bg-[#111113] hover:bg-[#27272a] text-white text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-[#f5b800] fill-current" />
            <span>Uji Semua Model</span>
          </button>
        </div>
      </div>

      {/* 4-Column Session KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-[#e4e4e7]">
          <span className="text-xs text-[#52525b] block">
            Total Token Sesi Ini
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#111113] mt-1.5">
            {summary.totalTokens.toLocaleString("id-ID")}
            <span className="text-xs font-normal text-[#52525b] ml-1.5">tok</span>
          </div>
          <p className="text-xs text-[#52525b] mt-2">
            {summary.totalRequests} eksekusi model pada sesi aktif
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#e4e4e7]">
          <span className="text-xs text-[#52525b] block">
            Rata-Rata Biaya / 1K Token
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#111113] mt-1.5">
            ${summary.blendedCostPer1kTokensUsd.toFixed(4)}
            <span className="text-xs font-normal text-[#52525b] ml-1.5">/ 1K tok</span>
          </div>
          <p className="text-xs text-[#52525b] mt-2">
            Modal ${summary.totalWholesaleUsd.toFixed(4)} <span aria-hidden="true">·</span> Ritel ${summary.totalRetailUsd.toFixed(4)}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#e4e4e7]">
          <span className="text-xs text-[#52525b] block">
            Rata-Rata Latensi Sesi
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#111113] mt-1.5">
            {summary.meanLatencyMs}
            <span className="text-xs font-normal text-[#52525b] ml-1.5">ms</span>
          </div>
          <p className="text-xs text-[#52525b] mt-2">
            Tercepat: <strong className="text-[#111113]">{summary.fastestModelName}</strong>
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#fef9c3]/50 border border-[#f5b800]">
          <span className="text-xs font-medium text-[#111113] block">
            Margin Sesi & Efisiensi Terbaik
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#111113] mt-1.5">
            +${summary.totalNetMarginUsd.toFixed(4)}
            <span className="text-xs font-semibold text-[#111113] ml-1.5">
              ({summary.overallMarginPercent}% margin)
            </span>
          </div>
          <p className="text-xs text-[#111113]/80 mt-2">
            Paling efisien: <strong>{summary.mostEfficientModelName}</strong>
          </p>
        </div>
      </div>

      {/* D3-Based Latency vs. Cost-per-Token Quadrant & Task Recommendation Visualization */}
      <ModelLatencyCostD3Chart
        rows={summary.rows}
        selectedModelId={selectedModelId}
        onSelectModel={onSelectModel}
      />

      {/* Visual Comparative Telemetry Matrix Across All Integrated Models */}
      <div className="rounded-xl bg-white border border-[#e4e4e7] overflow-hidden">
        <div className="px-6 py-4 bg-[#fafafa] border-b border-[#e4e4e7] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="font-bold text-[#111113]">
            Perbandingan Performa Antar-Model ({sortedRows.length} Model Terintegrasi)
          </div>
          <div className="text-[#52525b] font-mono">
            Target Latensi 1.000ms <span aria-hidden="true">·</span> Indeks Efisiensi (0–100)
          </div>
        </div>

        <div className="divide-y divide-[#e4e4e7]">
          {sortedRows.map((row) => {
            const isSelected = row.modelId === selectedModelId;
            const tokenBarWidth =
              row.tokensUsed > 0
                ? Math.max(8, Math.round((row.tokensUsed / maxTokensAcrossModels) * 100))
                : 3;
            const latencyBarWidth = Math.max(
              10,
              Math.min(100, Math.round((row.avgLatencyMs / 1000) * 100))
            );

            return (
              <div
                key={row.modelId}
                data-testid={`telemetry-row-${row.modelId}`}
                className={`p-5 transition-colors grid grid-cols-1 lg:grid-cols-12 gap-6 items-center ${
                  isSelected ? "bg-[#fef9c3]/35" : "hover:bg-[#fafafa]"
                }`}
              >
                {/* Col 1-3: Model Identity & Request Counter */}
                <div className="lg:col-span-3 space-y-1">
                  <div className="flex items-center justify-between lg:justify-start gap-2">
                    <span className="text-sm font-bold text-[#111113]">
                      {row.modelName}
                    </span>
                  </div>
                  <div className="text-xs text-[#52525b]">
                    <span>{row.provider}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{row.category}</span>
                    <span aria-hidden="true"> · </span>
                    <span className="font-mono tabular-nums font-semibold text-[#111113]">
                      {row.requestCount}x dipakai
                    </span>
                  </div>
                </div>

                {/* Col 4-6: Token Usage Visual Bar */}
                <div className="lg:col-span-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#52525b]">Pemakaian Token</span>
                    <span className="font-mono tabular-nums font-semibold text-[#111113]">
                      {row.tokensUsed.toLocaleString("id-ID")} tok ({row.tokenSharePercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#fafafa] border border-[#e4e4e7] overflow-hidden">
                    <div
                      className="h-full bg-[#f5b800] rounded-full transition-all duration-200"
                      style={{ width: `${tokenBarWidth}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-[#52525b]">
                    <span>Modal: ${row.wholesaleCostUsd.toFixed(5)}</span>
                    <span>Ritel: ${row.retailChargeUsd.toFixed(5)}</span>
                  </div>
                </div>

                {/* Col 7-9: Cost Efficiency Index & $/1K Bar */}
                <div className="lg:col-span-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#52525b]">Efisiensi Biaya</span>
                    <span className="font-mono tabular-nums font-semibold text-[#111113]">
                      {row.efficiencyIndex}/100 <span aria-hidden="true">·</span> ${row.blendedWholesalePer1kUsd.toFixed(4)}/1K
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#fafafa] border border-[#e4e4e7] overflow-hidden">
                    <div
                      className="h-full bg-[#111113] rounded-full transition-all duration-200"
                      style={{ width: `${row.efficiencyIndex}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-[#52525b]">
                    <span>Markup: {row.retailMarkupMultiplier}x</span>
                    <span>Margin: {row.grossMarginPercent}%</span>
                  </div>
                </div>

                {/* Col 10-12: Performance Latency Bar & Quick Select */}
                <div className="lg:col-span-3 flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#52525b]">Latensi</span>
                      <span className="font-mono tabular-nums font-semibold text-[#111113]">
                        {row.avgLatencyMs}ms
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#fafafa] border border-[#e4e4e7] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-200 ${
                          row.avgLatencyMs <= 500
                            ? "bg-[#f5b800]"
                            : "bg-[#52525b]"
                        }`}
                        style={{ width: `${latencyBarWidth}%` }}
                      />
                    </div>
                    <div className="text-[11px] font-mono tabular-nums text-[#52525b]">
                      {row.requestCount > 0 ? "Rata-rata sesi aktif" : `Standar ~${row.baselineLatencyMs}ms`}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectModel(row.modelId)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-[#111113] text-white"
                        : "bg-[#f5b800] hover:bg-[#e5ac00] text-[#111113]"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Buka Tab</span>
                      </>
                    ) : (
                      <>
                        <span>Pakai</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
