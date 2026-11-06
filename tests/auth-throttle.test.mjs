import test from "node:test";
import assert from "node:assert/strict";
import { takeAuthAttempt } from "../src/lib/security/auth-throttle.ts";

test("sign-in attempts are capped per normalized email and reset after window", () => {
  const who = "auth-throttle-unique-01@example.test";
  for (let i = 0; i < 5; i++) {
    assert.equal(takeAuthAttempt("sign-in", i % 2 ? who.toUpperCase() : who, 1_000).allowed, true);
  }
  const limited = takeAuthAttempt("sign-in", who, 1_000);
  assert.equal(limited.allowed, false);
  assert.equal(limited.retryAfterSeconds, 300);
  assert.equal(takeAuthAttempt("sign-in", who, 301_001).allowed, true);
});

test("sign-up attempts have a separate, longer quota", () => {
  const who = "auth-throttle-unique-02@example.test";
  for (let i = 0; i < 3; i++) {
    assert.equal(takeAuthAttempt("sign-up", who, 5_000).allowed, true);
  }
  assert.equal(takeAuthAttempt("sign-up", who, 5_000).allowed, false);
  assert.equal(takeAuthAttempt("sign-in", who, 5_000).allowed, true);
});
