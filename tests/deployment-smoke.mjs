import assert from "node:assert/strict";

/**
 * Read-only smoke test for a deployed demo-only release.
 * Usage: DEPLOY_BASE_URL=https://verified-site.netlify.app node tests/deployment-smoke.mjs
 *
 * Do NOT run this against a site with paid provider calls or auth enabled.
 * Do not send credentials, tokens, or personal data.
 */
const raw = process.env.DEPLOY_BASE_URL;
if (!raw) throw new Error("DEPLOY_BASE_URL is required");
const url = new URL(raw);
if (url.protocol !== "https:" || url.username || url.password ||
    url.pathname !== "/" || url.search || url.hash) {
  throw new Error("DEPLOY_BASE_URL must be a bare HTTPS origin");
}
const base = url.origin;
async function read(path, options) {
  const response = await fetch(base + path, {
    ...options,
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
  });
  let body;
  try { body = await response.json(); } catch {
    throw new Error(path + " did not return JSON, HTTP " + response.status);
  }
  return { response, body };
}

const health = await read("/api/health");
assert.equal(health.response.status, 200);
assert.equal(health.body.status, "ok");
assert.equal(health.response.headers.get("x-frame-options"), "DENY");

const auth = await read("/api/auth/status");
assert.equal(auth.response.status, 200);
assert.equal(auth.body.enabled, false, "release must remain demo-only");

const noSession = await read("/api/auth/me");
assert.equal(noSession.response.status, 503);
assert.equal(noSession.body.authenticated, false);

const db = await read("/api/private/listings");
assert.equal(db.response.status, 503, "database must remain disabled in demo");

const demo = await read("/api/gateway", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: "Deployment demo-only contract check",
    modelId: "chatgpt-4o",
    agentId: "agent-orchestrator",
  }),
});
assert.equal(demo.response.status, 200);
assert.equal(demo.body.mode, "demo");
assert.equal(demo.body.primary.mode, "demo");
assert.match(demo.body.primary.content, /MODE DEMO/);
assert.equal(demo.body.primary.tokensUsed, 0);

const page = await fetch(base + "/", {
  redirect: "error", signal: AbortSignal.timeout(15_000),
});
assert.equal(page.status, 200, "homepage must load");
const html = await page.text();
assert.match(html, /<html lang="id"/);
assert.match(html, /Codematt Agent/);

console.log("PUBLIC DEMO SMOKE PASSED: homepage, health, auth disabled, DB disabled, model demo, headers.");
