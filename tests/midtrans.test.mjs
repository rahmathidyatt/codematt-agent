import test from "node:test";
import assert from "node:assert/strict";
import {
  midtransSignature, verifyMidtransSignature, parseGrossAmount, classifyMidtransStatus, newOrderId, ORDER_ID_PATTERN,
} from "../src/lib/billing/midtrans-signature.ts";

const KEY = "SB-Mid-server-test-key";

test("valid Midtrans signature passes, tampered fields fail", () => {
  const body = { order_id: "CM-PRO-ABC12345", status_code: "200", gross_amount: "149000.00" };
  const signature_key = midtransSignature(body.order_id, body.status_code, body.gross_amount, KEY);
  assert.equal(verifyMidtransSignature({ ...body, signature_key }, KEY), true);
  assert.equal(verifyMidtransSignature({ ...body, gross_amount: "1000.00", signature_key }, KEY), false);
  assert.equal(verifyMidtransSignature({ ...body, signature_key }, "other-key"), false);
  assert.equal(verifyMidtransSignature({ ...body, signature_key: "abc" }, KEY), false);
  assert.equal(verifyMidtransSignature({ ...body, signature_key: 123 }, KEY), false);
});

test("gross amount parsing accepts whole rupiah only", () => {
  assert.equal(parseGrossAmount("149000.00"), 149000);
  assert.equal(parseGrossAmount("49000"), 49000);
  assert.equal(parseGrossAmount("49000.50"), null);
  assert.equal(parseGrossAmount("-1"), null);
  assert.equal(parseGrossAmount(49000), null);
});

test("status classification: capture needs fraud accept", () => {
  assert.equal(classifyMidtransStatus("settlement", undefined), "paid");
  assert.equal(classifyMidtransStatus("capture", "accept"), "paid");
  assert.equal(classifyMidtransStatus("capture", "challenge"), "pending");
  assert.equal(classifyMidtransStatus("expire", undefined), "failed");
  assert.equal(classifyMidtransStatus("refund", undefined), "ignore");
});

test("order ids match the DB check constraint", () => {
  const id = newOrderId("pro", "a1b2c3d4e5f6a1b2c3d4e5f6");
  assert.match(id, ORDER_ID_PATTERN);
  assert.match(id, /^[A-Z0-9-]+$/);
});
