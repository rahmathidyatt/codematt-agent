import test from "node:test";
import assert from "node:assert/strict";
import {
  getAuthBackendConfig,
  isSameOriginMutation,
  authCookieMaxAge,
  validAccessToken,
} from "../src/lib/auth/core.ts";

const validEnv = {
  CODEMATT_AUTH_ENABLED: "true",
  NEXT_PUBLIC_SUPABASE_URL: "https://codematt-example.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_placeholder",
};

test("auth always fails closed unless explicitly configured", () => {
  assert.equal(getAuthBackendConfig({}), null);
  assert.equal(getAuthBackendConfig({ ...validEnv, CODEMATT_AUTH_ENABLED: "false" }), null);
  assert.deepEqual(getAuthBackendConfig(validEnv), {
    url: "https://codematt-example.supabase.co",
    publishableKey: "sb_publishable_placeholder",
  });
});

test("untrusted URLs cannot change the backend destination", () => {
  for (const url of [
    "http://codematt-example.supabase.co",
    "https://codematt-example.supabase.co.evil.com",
    "https://evil.com",
    "https://codematt-example.supabase.co:8443",
    "https://codematt-example.supabase.co/auth",
    "https://user:pass@codematt-example.supabase.co",
  ]) {
    assert.equal(getAuthBackendConfig({ ...validEnv, NEXT_PUBLIC_SUPABASE_URL: url }), null, url);
  }
});

test("cookie-changing requests require a matching browser Origin", () => {
  const make = (origin) => new Request("https://codematt.example/api/auth/sign-in", {
    method: "POST",
    headers: origin ? { Origin: origin } : {},
  });
  assert.equal(isSameOriginMutation(make("https://codematt.example")), true);
  assert.equal(isSameOriginMutation(make("https://attacker.example")), false);
  assert.equal(isSameOriginMutation(make("null")), false);
  assert.equal(isSameOriginMutation(make(null)), false);
  const behindProxy = new Request("http://localhost:3100/api/auth/sign-in", {
    method: "POST",
    headers: { Host: "127.0.0.1:3100", Origin: "http://127.0.0.1:3100" },
  });
  assert.equal(isSameOriginMutation(behindProxy), true);
  const mismatch = new Request("http://localhost:3100/api/auth/sign-in", {
    method: "POST",
    headers: { Host: "127.0.0.1:3100", Origin: "http://attacker.test" },
  });
  assert.equal(isSameOriginMutation(mismatch), false);
});

test("short-lived access token cookie cannot exceed upstream lifetime", () => {
  assert.equal(authCookieMaxAge(3_600), 3_540);
  assert.equal(authCookieMaxAge(100_000), 3_600);
  assert.equal(authCookieMaxAge(20), 0);
  assert.equal(authCookieMaxAge("3600"), 0);
  assert.equal(validAccessToken("a".repeat(100)), true);
  assert.equal(validAccessToken("short"), false);
  assert.equal(validAccessToken("x".repeat(5000)), false);
});
