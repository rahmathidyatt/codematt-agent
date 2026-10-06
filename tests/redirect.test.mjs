import test from "node:test";
import assert from "node:assert/strict";
import { safeRedirect } from "../src/lib/security/redirect.ts";
const origin = "https://agent.example";
test("accepts local destinations with query and hash", () => {
  assert.equal(safeRedirect("/dashboard?tab=brand#form", origin), "/dashboard?tab=brand#form");
});
test("blocks open redirects and malformed input", () => {
  for (const value of [null, 12, "https://evil.example", "//evil.example", "/\\evil.example", "/\nevil.example", "javascript:alert(1)"]) {
    assert.equal(safeRedirect(value, origin), "/dashboard");
  }
});
