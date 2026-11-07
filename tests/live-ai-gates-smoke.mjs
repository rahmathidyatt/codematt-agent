import assert from "node:assert/strict";

/**
 * HTTP-level contract for paid-model fail-closed gates.
 * Run ONLY against the isolated CI Next.js server with dummy provider keys
 * and CODEMATT_LIVE_AI_MAX_CALLS_PER_INSTANCE unset. The application MUST
 * reject every request before any outbound provider call.
 */
const base = process.env.LIVE_GATES_BASE_URL || "http://127.0.0.1:3102";
const token = "ci_dummy_live_token_never_use_in_production_123456789";
const credential = { Authorization: "Bearer " + token, "Content-Type": "application/json" };
const gateway = {
  prompt: "Contract test: do not call providers",
  modelId: "chatgpt-4o",
  agentId: "agent-orchestrator",
};

async function post(path, body, headers = credential) {
  const response = await fetch(base + path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8_000),
  });
  const data = await response.json();
  assert.equal(response.headers.get("cache-control"), "no-store", path);
  return { status: response.status, data };
}

// Even with live mode enabled, a missing/wrong secret cannot trigger providers.
const unauthorized = await post("/api/gateway", gateway, { "Content-Type": "application/json" });
assert.equal(unauthorized.status, 401);
assert.equal(unauthorized.data.error, "UNAUTHORIZED");
const wrongBearer = await post("/api/gateway", gateway, {
  Authorization: "Bearer " + "wrong".repeat(12),
  "Content-Type": "application/json",
});
assert.equal(wrongBearer.status, 401);
assert.equal(wrongBearer.data.error, "UNAUTHORIZED");

// Provider adapters must never silently route unsupported models to paid models.
const unsupported = await post("/api/gateway", { ...gateway, modelId: "claude-3-7-sonnet" });
assert.equal(unsupported.status, 501);
assert.equal(unsupported.data.error, "MODEL_ADAPTER_NOT_CONNECTED");

// A comparison involving unsupported provider is rejected before generating
// the supported primary model output or consuming the quota.
const unsupportedComparison = await post("/api/gateway", {
  ...gateway, compareModelId: "deepseek-r1",
});
assert.equal(unsupportedComparison.status, 501);
assert.equal(unsupportedComparison.data.error, "MODEL_ADAPTER_NOT_CONNECTED");

// Dummy credentials exist, but no per-instance budget is configured.
// All supported models must be rejected before outbound requests.
for (const modelId of ["chatgpt-4o", "gemini-3.8-flash"]) {
  const noBudget = await post("/api/gateway", { ...gateway, modelId });
  assert.equal(noBudget.status, 503);
  assert.equal(noBudget.data.error, "LIVE_AI_BUDGET_NOT_CONFIGURED");
}
const noComparisonBudget = await post("/api/gateway", {
  ...gateway, modelId: "chatgpt-4o", compareModelId: "gemini-3.8-flash",
});
assert.equal(noComparisonBudget.status, 503);
assert.equal(noComparisonBudget.data.error, "LIVE_AI_BUDGET_NOT_CONFIGURED");

const generate = {
  task: "listing", locale: "id",
  instructions: "Tidak boleh menghubungi provider dalam uji gate",
  facts: { name: "Properti Uji", location: "Bogor" },
};
const generateUnauthorized = await post("/api/ai/generate", generate, { "Content-Type": "application/json" });
assert.equal(generateUnauthorized.status, 401);
assert.equal(generateUnauthorized.data.error, "LIVE_AI_AUTH_REQUIRED");

const generationNoBudget = await post("/api/ai/generate", generate);
assert.equal(generationNoBudget.status, 503);
assert.equal(generationNoBudget.data.error, "LIVE_AI_BUDGET_NOT_CONFIGURED");

// All statuses above were checked without accepting a provider success response.
// No API call should occur, and no real provider key is used.
console.log("Live AI fail-closed HTTP gates passed: auth, adapter, comparison, and budget preflight.");
