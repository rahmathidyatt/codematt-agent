import test from "node:test";
import assert from "node:assert/strict";
import {
  getAuthBackendConfig,
  getTrustedAppOrigin,
  isSameOriginMutation,
  shouldUseSecureCookie,
  authCookieMaxAge,
  validAccessToken,
} from "../src/lib/auth/core.ts";

const projectRef = "abcdefghij1234567890";
const validEnv = {
  CODEMATT_AUTH_ENABLED: "true",
  APP_ORIGIN: "https://codematt.example",
  CODEMATT_SUPABASE_PROJECT_REF: projectRef,
  NEXT_PUBLIC_SUPABASE_URL: "https://abcdefghij1234567890.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_placeholder",
};

test("auth fails closed unless backend, project ref, and fixed origin are configured", () => {
  assert.equal(getAuthBackendConfig({}), null);
  assert.equal(getAuthBackendConfig({ ...validEnv, CODEMATT_AUTH_ENABLED: "false" }), null);
  assert.equal(getAuthBackendConfig({ ...validEnv, APP_ORIGIN: "" }), null);
  assert.equal(getAuthBackendConfig({ ...validEnv, CODEMATT_SUPABASE_PROJECT_REF: "" }), null);
  assert.equal(getAuthBackendConfig({ ...validEnv, CODEMATT_SUPABASE_PROJECT_REF: "lbtlemxxjikpgxjqsalg" }), null);
  assert.deepEqual(getAuthBackendConfig(validEnv), {
    url: "https://abcdefghij1234567890.supabase.co",
    publishableKey: "sb_publishable_placeholder",
  });
});

test("backend and project cannot be redirected to third-party hosts", () => {
  for (const url of [
    "http://abcdefghij1234567890.supabase.co",
    "https://abcdefghij1234567890.supabase.co.evil.com",
    "https://evil.com",
    "https://abcdefghij1234567890.supabase.co:8443",
    "https://abcdefghij1234567890.supabase.co/auth",
    "https://user:pass@abcdefghij1234567890.supabase.co",
    "https://differentproject.supabase.co",
  ]) {
    assert.equal(getAuthBackendConfig({ ...validEnv, NEXT_PUBLIC_SUPABASE_URL: url }), null, url);
  }
});

test("trusted APP_ORIGIN disallows injected path, credentials, and public HTTP", () => {
  assert.equal(getTrustedAppOrigin(validEnv), "https://codematt.example");
  assert.equal(getTrustedAppOrigin({ APP_ORIGIN: "http://127.0.0.1:3100" }), "http://127.0.0.1:3100");
  for (const origin of ["http://codematt.example", "https://codematt.example/path",
    "https://user:secret@codematt.example", "https://codematt.example?foo=1",
    "https://codematt.example.evil.com/xx", "javascript:alert(1)"]) {
    const env = { ...validEnv, APP_ORIGIN: origin };
    assert.equal(getAuthBackendConfig(env), null, origin);
  }
});

test("CSRF guard requires trusted APP_ORIGIN, not arbitrary Host or forwarding headers", () => {
  const headers = { Origin: "https://codematt.example" };
  const make = (hs) => new Request("http://localhost:3100/api/auth/sign-in", {
    method: "POST", headers: hs,
  });
  assert.equal(isSameOriginMutation(make(headers), validEnv), true);
  assert.equal(isSameOriginMutation(make({ Origin: "https://attacker.example" }), validEnv), false);
  assert.equal(isSameOriginMutation(make({ Origin: "https://attacker.example",
    Host: "attacker.example", "X-Forwarded-Host": "attacker.example" }), validEnv), false);
  assert.equal(isSameOriginMutation(make({ Host: "codematt.example" }), validEnv), false);
  assert.equal(isSameOriginMutation(make({ Origin: "null" }), validEnv), false);
  assert.equal(isSameOriginMutation(make(headers), { ...validEnv, APP_ORIGIN: "" }), false);
});

test("cookie security derives only from trusted origin, never request Host", () => {
  assert.equal(shouldUseSecureCookie(validEnv), true);
  assert.equal(shouldUseSecureCookie({}), true);
  assert.equal(shouldUseSecureCookie({ APP_ORIGIN: "http://localhost:3000" }), false);
});

test("short-lived access token cookie cannot exceed provider expiry", () => {
  assert.equal(authCookieMaxAge(3600), 3540);
  assert.equal(authCookieMaxAge(100_000), 3600);
  assert.equal(authCookieMaxAge(20), 0);
  assert.equal(authCookieMaxAge("3600"), 0);
  assert.equal(validAccessToken("a".repeat(100)), true);
  assert.equal(validAccessToken("short"), false);
  assert.equal(validAccessToken("x".repeat(5000)), false);
});
