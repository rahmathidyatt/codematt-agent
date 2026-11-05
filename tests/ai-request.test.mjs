import test from "node:test";
import assert from "node:assert/strict";
import {
  readBoundedJson,
  MAX_AI_REQUEST_BYTES,
  isLiveAiAuthorized,
} from "../src/lib/security/ai-request.ts";

function jsonRequest(body, headers = {}) {
  return new Request("https://example.test/api/gateway", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

test("bounded JSON accepts valid plain objects", async () => {
  assert.deepEqual(await readBoundedJson(jsonRequest({ prompt: "hello" })), {
    ok: true,
    body: { prompt: "hello" },
  });
});

test("bounded JSON rejects arrays and invalid JSON", async () => {
  assert.equal((await readBoundedJson(jsonRequest("[]"))).status, 400);
  assert.equal((await readBoundedJson(jsonRequest("{"))).status, 400);
});

test("bounded JSON rejects wrong content type and excessive bytes", async () => {
  const wrong = jsonRequest({ prompt: "hello" }, { "content-type": "text/plain" });
  assert.equal((await readBoundedJson(wrong)).status, 415);
  assert.equal(
    (await readBoundedJson(jsonRequest({ prompt: "x".repeat(MAX_AI_REQUEST_BYTES + 1) }))).status,
    413
  );
});

test("live AI is disabled by default and fails closed without a strong token", () => {
  const secret = "a".repeat(40);
  assert.equal(isLiveAiAuthorized("Bearer " + secret, { CODEMATT_LIVE_AI_TOKEN: secret }), false);
  const env = { CODEMATT_ENABLE_LIVE_AI: "true", CODEMATT_LIVE_AI_TOKEN: secret };
  assert.equal(isLiveAiAuthorized(null, env), false);
  assert.equal(isLiveAiAuthorized("Bearer wrong", env), false);
  assert.equal(isLiveAiAuthorized("Bearer " + secret, env), true);
  assert.equal(
    isLiveAiAuthorized("Bearer short", { CODEMATT_ENABLE_LIVE_AI: "true", CODEMATT_LIVE_AI_TOKEN: "short" }),
    false
  );
});
