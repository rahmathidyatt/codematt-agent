import test from "node:test";
import assert from "node:assert/strict";
import { getLiveModel, readOpenAIResponse } from "../src/lib/ai/provider-routing.ts";

test("live model routing cannot silently fall back across providers", () => {
  assert.equal(getLiveModel("gemini-3.8-flash")?.providerId, "google");
  assert.equal(getLiveModel("chatgpt-4o")?.providerId, "openai");
  assert.equal(getLiveModel("claude-3-7-sonnet"), null);
  assert.equal(getLiveModel("deepseek-r1"), null);
  assert.equal(getLiveModel("__proto__"), null);
});

test("OpenAI parser extracts only output_text messages and actual token counts", () => {
  assert.deepEqual(readOpenAIResponse({
    output: [
      { type: "reasoning", summary: [] },
      { type: "message", content: [{ type: "output_text", text: "Hello" }] },
    ],
    usage: { input_tokens: 10, output_tokens: 5 },
  }), { text: "Hello", inputTokens: 10, outputTokens: 5 });
  assert.equal(readOpenAIResponse({ output: [] }), null);
  assert.equal(readOpenAIResponse({ output: [{ type: "message", content: [{ type: "refusal", refusal: "No" }] }] }), null);
  assert.equal(readOpenAIResponse({ output: [{ type: "message", content: [{ type: "output_text", text: "" }] }] }), null);
});
