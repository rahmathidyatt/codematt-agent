import assert from "node:assert/strict";
import test from "node:test";
import { buildOwnedListingsUrl, buildOwnedListingInsert, requireValidUserId } from "../src/lib/db/listing-queries.ts";

const owner = "a1111111-b222-c333-d444-e55555555555";
const stranger = "f1111111-b222-c333-d444-e55555555555";
test("PostgREST listing reads always filter by independently verified owner", () => {
  const result = buildOwnedListingsUrl("https://test-project.supabase.co", owner);
  assert.equal(result.origin, "https://test-project.supabase.co");
  assert.equal(result.pathname, "/rest/v1/codematt_listings");
  assert.equal(result.searchParams.get("user_id"), "eq." + owner);
  assert.equal(result.searchParams.get("limit"), "50");
  assert.notEqual(result.searchParams.get("user_id"), "eq." + stranger);
});
test("ownership cannot be overwritten by caller-supplied user_id", () => {
  const insert = buildOwnedListingInsert(owner, {
    name: "Properti Uji",
    location: "Bogor",
    price: 100,
    user_id: stranger,
  });
  assert.equal(insert.user_id, owner);
  assert.equal(insert.name, "Properti Uji");
  assert.deepEqual(Object.keys(insert).sort(), ["location", "name", "price", "user_id"]);
});
test("malformed IDs cannot reach owned-listing request construction", () => {
  for (const value of ["", "a", stranger + "&select=*", "null", "__proto__"]) {
    assert.throws(() => requireValidUserId(value), /INVALID_USER_ID/);
  }
});
