import test from "node:test";
import assert from "node:assert/strict";
import { validateAiOutput } from "../src/lib/ai/output-validation.ts";

test("AI output schemas reject missing formats and unrelated content", () => {
  assert.equal(validateAiOutput("assistant", { foo: "bar" }), null);
  assert.equal(validateAiOutput("assistant", { response: "" }), null);
  assert.deepEqual(validateAiOutput("assistant", { response: "Verified facts only" }), { response: "Verified facts only" });
  assert.equal(validateAiOutput("listing", { text: "unexpected" }), null);
});

test("listing contract requires all three structured variations", () => {
  const a = { headline: "A", body: "B", bullets: ["LT 90"], cta: "C" };
  assert.deepEqual(validateAiOutput("listing", { emotional: a, investor: a, formal: a }), {
    emotional: a, investor: a, formal: a,
  });
  assert.equal(validateAiOutput("listing", { emotional: a, investor: a }), null);
});
