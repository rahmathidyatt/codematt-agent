import assert from "node:assert/strict";

const base = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3100";

async function request(path, options = {}) {
  const response = await fetch(base + path, { ...options, signal: AbortSignal.timeout(8_000) });
  const body = await response.json();
  return { response, body };
}

const health = await request("/api/health");
assert.equal(health.response.status, 200);
assert.equal(health.body.status, "ok");
assert.equal(health.body.stage, "prototype");

const gatewayBody = {
  prompt: "Summarize the proposal",
  modelId: "chatgpt-4o",
  compareModelId: "claude-3-7-sonnet",
  agentId: "agent-orchestrator",
};
const gateway = await request("/api/gateway", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(gatewayBody),
});
assert.equal(gateway.response.status, 200);
assert.equal(gateway.body.mode, "demo");
assert.equal(gateway.body.primary.mode, "demo");
assert.equal(gateway.body.primary.tokensUsed, 0);
assert.equal(gateway.body.primary.retailChargeUsd, 0);
assert.match(gateway.body.primary.content, /MODE DEMO/);
assert.equal(gateway.body.comparison.modelId, "claude-3-7-sonnet");
assert.equal(gateway.body.comparison.tokensUsed, 0);

const unknown = await request("/api/gateway", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...gatewayBody, modelId: "non-existent" }),
});
assert.equal(unknown.response.status, 400);

const wrongType = await request("/api/gateway", {
  method: "POST",
  headers: { "Content-Type": "text/plain" },
  body: "{}",
});
assert.equal(wrongType.response.status, 415);

const oversized = await request("/api/gateway", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...gatewayBody, prompt: "x".repeat(20_000) }),
});
assert.equal(oversized.response.status, 413);

const generation = await request("/api/ai/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    task: "listing",
    locale: "id",
    instructions: "Buat deskripsi hanya berdasarkan data yang ada",
    facts: { name: "Properti Uji", location: "Cibubur" },
  }),
});
assert.equal(generation.response.status, 200);
assert.equal(generation.body.mode, "demo");
assert.equal(generation.body.usage.inputTokens, 0);
for (const style of ["emotional", "investor", "formal"]) {
  const draft = generation.body.data[style];
  assert.ok(draft.body.includes("Properti Uji"));
  assert.ok(draft.body.includes("Cibubur"));
  assert.ok(!draft.body.includes("SHM"));
  assert.ok(!draft.body.includes("120 m²"));
  assert.ok(!draft.body.includes("7-9%"));
}
const authStatus = await request("/api/auth/status");
assert.equal(authStatus.response.status, 200);
assert.equal(authStatus.body.enabled, false, "auth must not auto-enable in CI");

const noSession = await request("/api/auth/me");
assert.equal(noSession.response.status, 503);
assert.equal(noSession.body.authenticated, false);

const blockedCrossOrigin = await request("/api/auth/sign-in", {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: "https://attacker.test" },
  body: JSON.stringify({ email: "test@example.com", password: "example-password" }),
});
assert.equal(blockedCrossOrigin.response.status, 403);

const backendAbsent = await request("/api/auth/sign-in", {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: base },
  body: JSON.stringify({ email: "test@example.com", password: "example-password" }),
});
assert.equal(backendAbsent.response.status, 503);

const dbDisabled = await request("/api/private/listings");
assert.equal(dbDisabled.response.status, 503);

const logout = await request("/api/auth/sign-out", {
  method: "POST",
  headers: { Origin: base },
});
assert.equal(logout.response.status, 200);
assert.match(logout.response.headers.get("set-cookie") || "", /codematt_access=/);
assert.equal(logout.body.upstreamRevocation, "not-applicable");

const spoofedLogout = await request("/api/auth/sign-out", {
  method: "POST",
  headers: { Origin: "https://attacker.test", Host: "attacker.test" },
});
assert.equal(spoofedLogout.response.status, 403);

const absentSignup = await request("/api/auth/sign-up", {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: base },
  body: JSON.stringify({ name: "Demo", agency: "Agency", email: "demo@example.com", password: "password-123" }),
});
assert.equal(absentSignup.response.status, 503);

assert.equal(health.response.headers.get("x-frame-options"), "DENY");

// Multi-AI chat & billing: demo mode never calls providers or charges quota.
const chatBody = {
  provider: "anthropic",
  idempotencyKey: "chat_smoke_0000000000000001",
  messages: [{ role: "user", content: "Halo" }],
};
const demoChat = await request("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: base },
  body: JSON.stringify(chatBody),
});
assert.equal(demoChat.response.status, 200);
assert.equal(demoChat.body.mode, "demo");
assert.equal(demoChat.body.model, "demo");
const crossOriginChat = await request("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: "https://attacker.test" },
  body: JSON.stringify(chatBody),
});
assert.equal(crossOriginChat.response.status, 403);
const badChat = await request("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: base },
  body: JSON.stringify({ ...chatBody, provider: "deepseek" }),
});
assert.equal(badChat.response.status, 400);
const billingMe = await request("/api/billing/me");
assert.equal(billingMe.response.status, 200);
assert.equal(billingMe.body.mode, "demo");
assert.equal(billingMe.body.planId, "free");
const checkout = await request("/api/billing/checkout", {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: base },
  body: JSON.stringify({ planId: "pro" }),
});
assert.equal(checkout.response.status, 503);
const forgedWebhook = await request("/api/billing/midtrans/notification", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ order_id: "CM-PRO-FAKE0001", status_code: "200", gross_amount: "149000.00", signature_key: "0".repeat(128) }),
});
assert.equal(forgedWebhook.response.status, 503);

console.log("HTTP smoke passed: health, demo gateway, input validation, fact-only listing.");
console.log("Billing smoke passed: chat demo, cross-origin blocked, checkout & webhook fail closed.");
console.log("Phase 2 smoke passed: auth fails closed, cross-origin blocked, isolated database disabled, logout clears cookie.");
