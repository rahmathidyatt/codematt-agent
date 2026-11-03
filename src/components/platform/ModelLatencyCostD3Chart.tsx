"use client";

import React, { useState, useMemo } from "react";
import * as d3 from "d3";
import {
  ArrowUpRight,
  Check,
  Compass,
  Zap,
  Coins,
  BrainCircuit,
  Scale,
} from "lucide-react";
import {
  ModelTelemetryRow,
  TaskPriorityMode,
  ModelFrontierPoint,
  buildModelEfficiencyFrontier,
} from "@/features/platform/model-gateway";

interface ModelLatencyCostD3ChartProps {
  rows: ModelTelemetryRow[];
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
}

const TASK_PRIORITIES: {
  id: TaskPriorityMode;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "balanced",
    label: "Seimbang",
    subtitle: "Kombinasi kecepatan & biaya terbaik",
    icon: Scale,
  },
  {
    id: "speed",
    label: "Tercepat",
    subtitle: "Prioritas latensi paling rendah",
    icon: Zap,
  },
  {
    id: "budget",
    label: "Hemat Biaya",
    subtitle: "Prioritas biaya per 1K token terendah",
    icon: Coins,
  },
  {
    id: "reasoning",
    label: "Koding & Logika",
    subtitle: "Prioritas logika & arsitektur kode",
    icon: BrainCircuit,
  },
];

export function ModelLatencyCostD3Chart({
  rows,
  selectedModelId,
  onSelectModel,
}: ModelLatencyCostD3ChartProps) {
  const [taskPriority, setTaskPriority] = useState<TaskPriorityMode>("balanced");
  const [focusedModelId, setFocusedModelId] = useState<string | null>(null);

  const frontier = useMemo(
    () => buildModelEfficiencyFrontier(rows, taskPriority),
    [rows, taskPriority]
  );

  // SVG coordinate system dimensions
  const width = 760;
  const height = 410;
  const margin = { top: 32, right: 56, bottom: 56, left: 86 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Compute D3 scales and paths
  const chartGeometry = useMemo(() => {
    const pts = frontier.points;
    if (pts.length === 0) {
      return null;
    }

    const minLat = d3.min(pts, (d) => d.avgLatencyMs) ?? 200;
    const maxLat = d3.max(pts, (d) => d.avgLatencyMs) ?? 1000;
    const latPad = Math.max(70, Math.round((maxLat - minLat) * 0.18));

    const maxCost = d3.max(pts, (d) => d.blendedWholesalePer1kUsd) ?? 0.01;
    const costUpper = Math.max(0.002, maxCost * 1.15);

    const xScale = d3
      .scaleLinear()
      .domain([Math.max(120, minLat - latPad), maxLat + latPad])
      .range([0, innerWidth])
      .nice();

    // Use D3 sqrt scale with a 28px bottom cushion so low-cost models are clearly separated above the X-axis
    const yScale = d3
      .scaleSqrt()
      .domain([0, costUpper])
      .range([innerHeight - 28, 14])
      .nice();

    const maxTokens = d3.max(pts, (d) => d.tokensUsed) ?? 1500;
    const rScale = d3
      .scaleSqrt()
      .domain([0, Math.max(500, maxTokens)])
      .range([8, 15]);

    const lineGenerator = d3
      .line<ModelFrontierPoint>()
      .x((d) => xScale(d.avgLatencyMs))
      .y((d) => yScale(d.blendedWholesalePer1kUsd))
      .curve(d3.curveMonotoneX);

    const paretoPath =
      frontier.paretoFrontier.length > 1
        ? lineGenerator(frontier.paretoFrontier) || ""
        : "";

    const xTicks = xScale.ticks(6);
    const yTicks = [0, 0.0005, 0.0015, 0.004, 0.007, 0.01].filter(
      (v) => v <= costUpper * 1.05
    );

    const medianX = Math.max(
      0,
      Math.min(innerWidth, xScale(frontier.medianLatencyMs))
    );
    const medianY = Math.max(
      0,
      Math.min(innerHeight, yScale(frontier.medianCostPer1kUsd))
    );

    return {
      xScale,
      yScale,
      rScale,
      paretoPath,
      xTicks,
      yTicks,
      medianX,
      medianY,
    };
  }, [frontier, innerWidth, innerHeight]);

  const inspectedPoint =
    frontier.points.find((p) => p.modelId === focusedModelId) ||
    frontier.recommendedModel ||
    frontier.points[0] ||
    null;

  if (!chartGeometry || frontier.points.length === 0) {
    return null;
  }

  const {
    xScale,
    yScale,
    rScale,
    paretoPath,
    xTicks,
    yTicks,
    medianX,
    medianY,
  } = chartGeometry;

  return (
    <div
      data-testid="d3-latency-cost-visualization"
      className="p-6 rounded-xl bg-white border border-[#e4e4e7] space-y-6"
    >
      {/* Header & Task Priority Selector */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#e4e4e7] pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#111113]">
            <Compass className="w-4 h-4 text-[#f5b800]" />
            <span>Peta Kuadran D3: Latensi vs. Biaya per Token ({frontier.enabledCount} Model Aktif)</span>
          </div>
          <h3 className="text-lg font-bold text-[#111113]">
            Panduan Visual Memilih Model Terbaik Sesuai Kebutuhan Tugas
          </h3>
          <p className="text-xs text-[#52525b] max-w-xl">
            Sumbu horizontal menunjukkan kecepatan respons (ke kiri semakin cepat), sedangkan sumbu vertikal menunjukkan biaya per 1.000 token (ke bawah semakin hemat).
          </p>
        </div>

        {/* Task Priority Selector (Single-line compact buttons) */}
        <div className="space-y-1.5 shrink-0">
          <span className="text-[11px] font-semibold text-[#52525b] block">
            Pilih Fokus Tugas Anda Saat Ini:
          </span>
          <div
            role="group"
            aria-label="Fokus Tugas Saat Ini"
            className="flex items-center gap-1 p-1 bg-[#fafafa] border border-[#e4e4e7] rounded-lg overflow-x-auto"
          >
            {TASK_PRIORITIES.map((tp) => {
              const Icon = tp.icon;
              const isCurrent = taskPriority === tp.id;
              return (
                <button
                  key={tp.id}
                  type="button"
                  data-testid={`task-priority-${tp.id}`}
                  onClick={() => {
                    setTaskPriority(tp.id);
                    setFocusedModelId(null);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isCurrent
                      ? "bg-[#f5b800] text-[#111113] font-semibold"
                      : "text-[#52525b] hover:text-[#111113]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tp.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Left 8 Cols D3 SVG Scatter/Quadrant Chart + Right 4 Cols Task Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Interactive D3 SVG Canvas */}
        <div className="lg:col-span-8 rounded-xl bg-[#fafafa] border border-[#e4e4e7] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-2 text-[11px] text-[#52525b]">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#f5b800] border border-[#111113] inline-block" />
                <span>Rekomendasi Tugas Ini</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#111113] inline-block" />
                <span>Model Aktif Lainnya</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-[#f5b800] inline-block" />
                <span>Garis Efisiensi Pareto</span>
              </span>
            </div>
            <span className="font-mono">
              Klik titik model untuk melihat detail
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              role="img"
              aria-label="Grafik D3 perbandingan latensi dan biaya per token antar model AI"
              className="w-full h-auto min-w-[560px] select-none"
            >
              <g transform={`translate(${margin.left}, ${margin.top})`}>
                {/* Optimal Quadrant Highlight (Bottom-Left: Fast Latency + Low Cost) */}
                <rect
                  x={0}
                  y={medianY}
                  width={medianX}
                  height={Math.max(0, innerHeight - medianY)}
                  fill="#fef9c3"
                  fillOpacity={0.5}
                  rx={6}
                />

                {/* Quadrant Label placed cleanly at the top-left of the Optimal Zone */}
                <text
                  x={10}
                  y={medianY + 16}
                  fill="#111113"
                  fontSize={9.5}
                  fontWeight={700}
                >
                  ZONA IDEAL: CEPAT & HEMAT
                </text>

                {/* Upper-Right Quadrant Label */}
                <text
                  x={innerWidth - 10}
                  y={16}
                  textAnchor="end"
                  fill="#52525b"
                  fontSize={9.5}
                  fontWeight={600}
                >
                  SPESIALIS MENDALAM / KOMPLEKS
                </text>

                {/* Horizontal Grid Lines & Y-Axis Ticks (Cost per 1K Tokens) */}
                {yTicks.map((tickVal) => {
                  const yPos = yScale(tickVal);
                  return (
                    <g key={`y-${tickVal}`} transform={`translate(0, ${yPos})`}>
                      <line
                        x1={0}
                        x2={innerWidth}
                        y1={0}
                        y2={0}
                        stroke="#e4e4e7"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={-10}
                        y={4}
                        textAnchor="end"
                        fill="#52525b"
                        fontSize={10.5}
                        fontFamily="var(--font-jetbrains-mono), monospace"
                      >
                        ${tickVal.toFixed(4)}
                      </text>
                    </g>
                  );
                })}

                {/* Vertical Grid Lines & X-Axis Ticks (Latency ms) */}
                {xTicks.map((tickVal) => {
                  const xPos = xScale(tickVal);
                  return (
                    <g key={`x-${tickVal}`} transform={`translate(${xPos}, 0)`}>
                      <line
                        x1={0}
                        x2={0}
                        y1={0}
                        y2={innerHeight}
                        stroke="#e4e4e7"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={0}
                        y={innerHeight + 20}
                        textAnchor="middle"
                        fill="#52525b"
                        fontSize={10.5}
                        fontFamily="var(--font-jetbrains-mono), monospace"
                      >
                        {tickVal}ms
                      </text>
                    </g>
                  );
                })}

                {/* Median Quadrant Divider Lines */}
                <line
                  x1={medianX}
                  x2={medianX}
                  y1={0}
                  y2={innerHeight}
                  stroke="#d4d4d8"
                  strokeWidth={1.25}
                  strokeDasharray="5 5"
                />
                <line
                  x1={0}
                  x2={innerWidth}
                  y1={medianY}
                  y2={medianY}
                  stroke="#d4d4d8"
                  strokeWidth={1.25}
                  strokeDasharray="5 5"
                />

                {/* Axes Border Lines */}
                <line
                  x1={0}
                  x2={innerWidth}
                  y1={innerHeight}
                  y2={innerHeight}
                  stroke="#111113"
                  strokeWidth={1.25}
                />
                <line
                  x1={0}
                  x2={0}
                  y1={0}
                  y2={innerHeight}
                  stroke="#111113"
                  strokeWidth={1.25}
                />

                {/* X-Axis Title */}
                <text
                  x={innerWidth / 2}
                  y={innerHeight + 44}
                  textAnchor="middle"
                  fill="#111113"
                  fontSize={11}
                  fontWeight={600}
                >
                  ← Lebih Cepat · Latensi Respons Rata-Rata (ms) · Lebih Lambat →
                </text>

                {/* Y-Axis Title */}
                <text
                  transform={`translate(-68, ${innerHeight / 2}) rotate(-90)`}
                  textAnchor="middle"
                  fill="#111113"
                  fontSize={11}
                  fontWeight={600}
                >
                  Biaya per 1.000 Token ($ USD)
                </text>

                {/* D3 Pareto Efficiency Frontier Path */}
                {paretoPath && (
                  <path
                    d={paretoPath}
                    fill="none"
                    stroke="#f5b800"
                    strokeWidth={2.5}
                    strokeDasharray="6 4"
                  />
                )}

                {/* Plotted Enabled AI Model Nodes */}
                {frontier.points.map((pt) => {
                  const cx = xScale(pt.avgLatencyMs);
                  const cy = yScale(pt.blendedWholesalePer1kUsd);
                  const radius = rScale(pt.tokensUsed);
                  const isRecommended =
                    frontier.recommendedModel?.modelId === pt.modelId;
                  const isInspected = inspectedPoint?.modelId === pt.modelId;
                  const isWorkspaceActive = pt.modelId === selectedModelId;

                  // Smart label positioning so text never clips or overlaps
                  const placeLeft = cx > innerWidth * 0.72;
                  const labelDx = placeLeft ? -(radius + 9) : radius + 9;
                  const labelAnchor = placeLeft ? "end" : "start";
                  const nearBottom = cy > innerHeight - 55;
                  const labelBaseY = nearBottom ? -10 : 0;

                  return (
                    <g
                      key={pt.modelId}
                      data-testid={`d3-node-${pt.modelId}`}
                      transform={`translate(${cx}, ${cy})`}
                      onClick={() => setFocusedModelId(pt.modelId)}
                      onMouseEnter={() => setFocusedModelId(pt.modelId)}
                      className="cursor-pointer"
                    >
                      {/* Outer Highlight Halo for Recommended or Inspected Model */}
                      {(isRecommended || isInspected) && (
                        <circle
                          r={radius + 5}
                          fill="none"
                          stroke="#f5b800"
                          strokeWidth={2.2}
                        />
                      )}

                      {/* Main Data Point Circle */}
                      <circle
                        r={radius}
                        fill={
                          isRecommended
                            ? "#f5b800"
                            : isWorkspaceActive
                            ? "#fef9c3"
                            : "#111113"
                        }
                        stroke="#111113"
                        strokeWidth={isRecommended || isWorkspaceActive ? 2 : 1.5}
                      />

                      {/* Model Name & Metric Tag */}
                      <text
                        x={labelDx}
                        y={labelBaseY - 3}
                        textAnchor={labelAnchor}
                        fill="#111113"
                        fontSize={11}
                        fontWeight={700}
                      >
                        {pt.modelName}
                      </text>
                      <text
                        x={labelDx}
                        y={labelBaseY + 10}
                        textAnchor={labelAnchor}
                        fill="#52525b"
                        fontSize={10}
                        fontFamily="var(--font-jetbrains-mono), monospace"
                      >
                        {pt.avgLatencyMs}ms · ${pt.blendedWholesalePer1kUsd.toFixed(4)}/1K
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        {/* Right 4 Cols: Task Recommendation Card & Inspected Model Details */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Best Model Recommendation for Current Task */}
          {frontier.recommendedModel && (
            <div
              data-testid="d3-recommended-model-card"
              className="p-5 rounded-xl bg-[#fef9c3]/55 border border-[#f5b800] space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#111113]">
                  Rekomendasi Terbaik Tugas Ini
                </span>
                <span className="font-mono font-bold text-[#111113]">
                  Skor {frontier.recommendedModel.taskScore}/100
                </span>
              </div>

              <div>
                <div className="text-lg font-bold text-[#111113]">
                  {frontier.recommendedModel.modelName}
                </div>
                <div className="text-xs text-[#52525b]">
                  {frontier.recommendedModel.provider} ·{" "}
                  {frontier.recommendedModel.quadrantLabel}
                </div>
              </div>

              <p className="text-xs text-[#111113] leading-relaxed">
                {frontier.recommendationReason}
              </p>

              <button
                type="button"
                data-testid="launch-recommended-model-btn"
                onClick={() => onSelectModel(frontier.recommendedModel!.modelId)}
                className="w-full py-2.5 px-4 rounded-lg bg-[#111113] hover:bg-[#27272a] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {frontier.recommendedModel.modelId === selectedModelId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#f5b800]" />
                    <span>Buka Tab {frontier.recommendedModel.modelName}</span>
                  </>
                ) : (
                  <>
                    <span>Pakai {frontier.recommendedModel.modelName}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#f5b800]" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Card 2: Inspected Model Node Detail */}
          {inspectedPoint && (
            <div
              data-testid="d3-inspected-model-card"
              className="p-5 rounded-xl bg-white border border-[#e4e4e7] space-y-3"
            >
              <div className="flex items-center justify-between border-b border-[#e4e4e7] pb-2.5 text-xs">
                <span className="font-bold text-[#111113]">
                  Detail Titik Model: {inspectedPoint.modelName}
                </span>
                <span className="font-mono text-[#52525b]">
                  {inspectedPoint.category}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-[#fafafa] border border-[#e4e4e7]">
                  <span className="text-[#52525b] block text-[11px]">
                    Latensi Rata-Rata
                  </span>
                  <span className="font-mono tabular-nums font-bold text-[#111113] text-sm">
                    {inspectedPoint.avgLatencyMs} ms
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#fafafa] border border-[#e4e4e7]">
                  <span className="text-[#52525b] block text-[11px]">
                    Biaya / 1K Token
                  </span>
                  <span className="font-mono tabular-nums font-bold text-[#111113] text-sm">
                    ${inspectedPoint.blendedWholesalePer1kUsd.toFixed(4)}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#fafafa] border border-[#e4e4e7]">
                  <span className="text-[#52525b] block text-[11px]">
                    Indeks Efisiensi
                  </span>
                  <span className="font-mono tabular-nums font-bold text-[#111113] text-sm">
                    {inspectedPoint.efficiencyIndex} / 100
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#fafafa] border border-[#e4e4e7]">
                  <span className="text-[#52525b] block text-[11px]">
                    Status Pareto
                  </span>
                  <span className="font-semibold text-[#111113] text-xs">
                    {inspectedPoint.isParetoOptimal
                      ? "Optimal Pareto"
                      : "Spesialis"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectModel(inspectedPoint.modelId)}
                className="w-full py-2 px-3 rounded-lg bg-[#f5b800] hover:bg-[#e5ac00] text-[#111113] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Beralih ke {inspectedPoint.modelName}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
