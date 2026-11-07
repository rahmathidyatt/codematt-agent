import test from "node:test";
import assert from "node:assert/strict";
import {
  INITIAL_MODELS,
  calculateTokenEconomics,
  simulateCommercialProjection,
  filterModels,
  summarizeSessionTelemetry,
  buildModelEfficiencyFrontier,
  calculateModelSwitchSavings,
  compareAllModelSwitchSavings,
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

test("calculateModelSwitchSavings correctly computes monthly and annual savings between models", () => {
  const gpt4o = INITIAL_MODELS.find((m) => m.id === "chatgpt-4o");
  const gemini = INITIAL_MODELS.find((m) => m.id === "gemini-3.8-flash");
  assert.ok(gpt4o && gemini);

  const res = calculateModelSwitchSavings({
    sourceModel: gpt4o,
    targetModel: gemini,
    monthlyTokens: 10_000_000,
    inputRatio: 0.35,
  });

  assert.equal(res.sourceModelId, "chatgpt-4o");
  assert.equal(res.targetModelId, "gemini-3.8-flash");
  assert.ok(res.isCheaper);
  assert.ok(res.wholesaleMonthlySavingsUsd > 0);
  // Based on the model registry rates, not a fixed claim from an old price list.
  const sourceWeightedPrice = 0.35 * gpt4o.wholesaleInputPer1M +
    0.65 * gpt4o.wholesaleOutputPer1M;
  const targetWeightedPrice = 0.35 * gemini.wholesaleInputPer1M +
    0.65 * gemini.wholesaleOutputPer1M;
  const expectedSavingsPercent = Math.round(
    100 * (sourceWeightedPrice - targetWeightedPrice) / sourceWeightedPrice
  );
  assert.equal(res.savingsPercent, expectedSavingsPercent);
  assert.equal(res.wholesaleMonthlySavingsUsd, Number(((sourceWeightedPrice - targetWeightedPrice) * 10).toFixed(4)));
  assert.ok(res.latencyDeltaMs < 0); // Gemini is faster
  assert.ok(res.speedupPercent > 0);
  assert.equal(res.annualSavingsUsd, Number((res.wholesaleMonthlySavingsUsd * 12).toFixed(2)));
});

test("compareAllModelSwitchSavings ranks alternatives by monthly savings", () => {
  const gpt4o = INITIAL_MODELS.find((m) => m.id === "chatgpt-4o");
  assert.ok(gpt4o);

  const comparisons = compareAllModelSwitchSavings({
    sourceModel: gpt4o,
    allModels: INITIAL_MODELS,
    monthlyTokens: 5_000_000,
  });

  assert.equal(comparisons.length, INITIAL_MODELS.length - 1);
  // Highest savings against GPT-4o should be low-cost models like Llama or Gemini
  assert.ok(comparisons[0].wholesaleMonthlySavingsUsd >= comparisons[1].wholesaleMonthlySavingsUsd);
});


