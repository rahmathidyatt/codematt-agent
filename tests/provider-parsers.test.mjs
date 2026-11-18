import test from "node:test";
import assert from "node:assert/strict";
import {
  readAnthropicResponse, readOpenAIText, readOpenAIImage, readGeminiImage, parseGeminiBoxes,
} from "../src/lib/ai/provider-parsers.ts";

test("Anthropic parser joins text blocks and ignores others", () => {
  assert.deepEqual(readAnthropicResponse({
    content: [{ type: "thinking", thinking: "x" }, { type: "text", text: "Halo" }, { type: "text", text: "Pak" }],
    usage: { input_tokens: 12, output_tokens: 3 },
  }), { text: "Halo\nPak", inputTokens: 12, outputTokens: 3 });
  assert.equal(readAnthropicResponse({ content: [] }), null);
  assert.equal(readAnthropicResponse("nope"), null);
});

test("OpenAI text parser reads output_text only", () => {
  assert.equal(readOpenAIText({
    output: [{ type: "message", content: [{ type: "output_text", text: "OK" }] }],
  })?.text, "OK");
  assert.equal(readOpenAIText({ output: [{ type: "reasoning" }] }), null);
});

test("image parsers reject tiny or non-image payloads", () => {
  const b64 = "A".repeat(200);
  assert.equal(readOpenAIImage({ data: [{ b64_json: b64 }] })?.base64, b64);
  assert.equal(readOpenAIImage({ data: [{ url: "https://x" }] }), null);
  assert.equal(readGeminiImage({
    candidates: [{ content: { parts: [{ text: "hi" }, { inlineData: { mimeType: "image/png", data: b64 } }] } }],
  })?.mimeType, "image/png");
  assert.equal(readGeminiImage({
    candidates: [{ content: { parts: [{ inlineData: { mimeType: "text/html", data: b64 } }] } }],
  }), null);
});

test("Gemini boxes convert 0..1000 coords to pixels and drop junk", () => {
  const boxes = parseGeminiBoxes(
    '```json\n[{"label":"nomor rumah","box_2d":[100,200,200,400]},{"box_2d":[5,5,5,5]},{"box_2d":"x"}]\n```',
    1000, 500
  );
  assert.deepEqual(boxes, [{ label: "nomor rumah", x: 200, y: 50, width: 200, height: 50 }]);
  assert.deepEqual(parseGeminiBoxes("not json", 10, 10), []);
});
