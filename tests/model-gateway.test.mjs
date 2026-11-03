import test from "node:test";
import assert from "node:assert/strict";
import {
  INITIAL_MODELS,
  calculateTokenEconomics,
  simulateCommercialProjection,
  filterModels,
  summarizeSessionTelemetry,
  buildModelEfficiencyFrontier,
} from "../src/features/platform/model-gateway.ts";

test("calculateTokenEconomics computes wholesale cost, retail charge, and gross margin", () => {
  const econ = calculateTokenEconomics(
    {
      wholesaleInputPer1M: 1.0,
      wholesaleOutputPer1M: 2.0,
      retailMarkupMultiplier: 2.5,
    },
    500_000,
    250_000
  );

  // Wholesale: 0.5 * 1.0 + 0.25 * 2.0 = 1.00 USD
  assert.equal(econ.totalTokens, 750_000);
  assert.equal(econ.wholesaleCostUsd, 1.0);
  assert.equal(econ.retailChargeUsd, 2.5);
  assert.equal(econ.netMarginUsd, 1.5);
  assert.equal(econ.grossMarginPercent, 60);
});

test("simulateCommercialProjection calculates monthly recurring revenue and net profit", () => {
  const proj = simulateCommercialProjection({
    activeSubscribers: 100,
    monthlySubscriptionPriceUsd: 29,
    avgTokensPerUserMillions: 4,
    blendedWholesalePer1MUsd: 1.25,
  });

  assert.equal(proj.grossMonthlyRevenueUsd, 2900);
  assert.equal(proj.totalWholesaleComputeUsd, 500);
  assert.equal(proj.netMonthlyProfitUsd, 2400);
  assert.equal(proj.profitMarginPercent, 83);
});

test("filterModels filters by category and search query accurately", () => {
  const all = filterModels(INITIAL_MODELS, "all", "");
  assert.equal(all.length, INITIAL_MODELS.length);

  const openaiMatch = filterModels(INITIAL_MODELS, "all", "chatgpt");
  assert.equal(openaiMatch.length, 1);
  assert.equal(openaiMatch[0].id, "chatgpt-4o");

  const reasoningOnly = filterModels(INITIAL_MODELS, "Reasoning", "");
  assert.equal(reasoningOnly.length, 1);
  assert.equal(reasoningOnly[0].id, "deepseek-r1");
});

test("summarizeSessionTelemetry aggregates token usage, cost efficiency, and latency across models", () => {
  const sampleTurns = [
    {
      id: "t1",
      role: "assistant",
      content: "Hello",
      modelId: "gemini-3.8-flash",
      modelName: "Gemini 3.8 Flash",
      provider: "Google DeepMind",
      agentId: "agent-orchestrator",
      timestamp: "10:00",
      tokensUsed: 300,
      wholesaleCostUsd: 0.00012,
      retailChargeUsd: 0.0003,
      latencyMs: 400,
    },
    {
      id: "t2",
      role: "assistant",
      content: "World",
      modelId: "chatgpt-4o",
      modelName: "ChatGPT (GPT-4o)",
      provider: "OpenAI",
      agentId: "agent-orchestrator",
      timestamp: "10:01",
      tokensUsed: 700,
      wholesaleCostUsd: 0.0042,
      retailChargeUsd: 0.00924,
      latencyMs: 650,
    },
  ];

  const summary = summarizeSessionTelemetry(INITIAL_MODELS, sampleTurns);
  assert.equal(summary.totalRequests, 2);
  assert.equal(summary.totalTokens, 1000);
  assert.equal(summary.rows.length, INITIAL_MODELS.length);

  const geminiRow = summary.rows.find((r) => r.modelId === "gemini-3.8-flash");
  const gptRow = summary.rows.find((r) => r.modelId === "chatgpt-4o");
  assert.ok(geminiRow);
  assert.ok(gptRow);
  assert.equal(geminiRow.tokenSharePercent, 30);
  assert.equal(gptRow.tokenSharePercent, 70);
  assert.equal(geminiRow.avgLatencyMs, 400);
  assert.equal(gptRow.avgLatencyMs, 650);
  assert.ok(geminiRow.efficiencyIndex > gptRow.efficiencyIndex);
});

test("buildModelEfficiencyFrontier computes Pareto frontier and task recommendations for enabled models", () => {
  const summary = summarizeSessionTelemetry(INITIAL_MODELS, []);
  const frontier = buildModelEfficiencyFrontier(summary.rows, "speed");

  assert.equal(frontier.enabledCount, INITIAL_MODELS.length);
  assert.ok(frontier.paretoFrontier.length >= 1);
  assert.ok(frontier.recommendedModel);
  assert.equal(frontier.recommendedModel.modelId, "llama-3-3-70b");

  const reasoningFrontier = buildModelEfficiencyFrontier(summary.rows, "reasoning");
  assert.ok(reasoningFrontier.recommendedModel);
  assert.equal(reasoningFrontier.recommendedModel.modelId, "deepseek-r1");
});

