/**
 * Hermetic Supabase Auth/PostgREST contract double for CI ONLY.
 *
 * This is NOT a real Supabase database and does NOT establish that RLS works.
 * It verifies server routes forward the authenticated token, constrain
 * ownership, and reject invalid and cross-origin requests.
 *
 * Load only with node --import tests/mocks/mock-supabase.mjs.
 */
if (process.env.CODEMATT_CONTRACT_TEST_MODE !== "1") {
  throw new Error("Supabase mock must only run in explicitly enabled contract tests");
}

const mockHost = "abcdefghijklmnopqrst.supabase.co";
const mockKey = "sb_publishable_contract_test_key";
const users = new Map([
  ["alpha@codematt.test", {
    id: "a1111111-b222-c333-d444-e55555555555",
    email: "alpha@codematt.test",
    password: "alphaPassword123!",
    token: "test-token-alpha-" + "a".repeat(90),
  }],
  ["beta@codematt.test", {
    id: "b1111111-b222-c333-d444-e55555555555",
    email: "beta@codematt.test",
    password: "betaPassword123!",
    token: "test-token-beta-" + "b".repeat(90),
  }],
]);
const byToken = new Map([...users.values()].map((user) => [user.token, user]));
const listings = new Map([...users.values()].map((user) => [user.id, []]));
const revoked = new Set();
const nativeFetch = globalThis.fetch;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

globalThis.fetch = async function mockSupabaseFetch(resource, init = {}) {
  const request = resource instanceof Request ? resource : null;
  const url = new URL(request ? request.url : String(resource));
  if (url.hostname !== mockHost) {
    if (url.hostname === "127.0.0.1" || url.hostname === "localhost") {
      return nativeFetch(resource, init);
    }
    throw new Error("Contract mock blocked unexpected outbound network request");
  }
  const headers = new Headers(request?.headers || {});
  new Headers(init.headers || {}).forEach((v, k) => headers.set(k, v));
  if (headers.get("apikey") !== mockKey) return json({ message: "invalid-api-key" }, 401);

  const method = (init.method || request?.method || "GET").toUpperCase();
  const bearer = headers.get("authorization")?.replace(/^Bearer /, "");
  const actor = bearer ? byToken.get(bearer) : null;
  const body = init.body
    ? JSON.parse(String(init.body))
    : request && method !== "GET"
      ? await request.clone().json()
      : null;

  if (url.pathname === "/auth/v1/token" && url.searchParams.get("grant_type") === "password" && method === "POST") {
    const candidate = users.get(body?.email);
    if (!candidate || candidate.password !== body?.password) {
      return json({ message: "invalid-credentials" }, 400);
    }
    return json({ access_token: candidate.token, expires_in: 3600 });
  }
  if (url.pathname === "/auth/v1/signup" && method === "POST") {
    if (!body?.email || !body?.password) return json({ message: "invalid-signup" }, 400);
    return json({ user: { id: users.get(body.email)?.id || "c1111111-b222-c333-d444-e55555555555" } });
  }
  if (url.pathname === "/auth/v1/user" && method === "GET") {
    if (!actor || revoked.has(bearer)) return json({ message: "invalid-token" }, 401);
    return json({ id: actor.id, email: actor.email });
  }
  if (url.pathname === "/auth/v1/logout" && url.searchParams.get("scope") === "local" && method === "POST") {
    if (!actor) return json({ message: "invalid-token" }, 401);
    revoked.add(bearer);
    return new Response(null, { status: 204 });
  }
  if (url.pathname === "/rest/v1/codematt_listings") {
    if (!actor || revoked.has(bearer)) return json({ message: "unauthorized" }, 401);
    if (method === "GET") {
      if (url.searchParams.get("user_id") !== "eq." + actor.id) {
        return json({ message: "owner-filter-required" }, 403);
      }
      return json(listings.get(actor.id));
    }
    if (method === "POST") {
      if (!body || body.user_id !== actor.id) {
        return json({ message: "owner-mismatch" }, 403);
      }
      const row = {
        id: "c1111111-b222-c333-d444-e55555555555",
        name: body.name,
        location: body.location,
        price: body.price,
        created_at: "2026-11-06T00:00:00.000Z",
        user_id: actor.id,
      };
      listings.get(actor.id).push(row);
      return json([row], 201);
    }
  }
  return json({ message: "unexpected-mock-upstream-request" }, 404);
};
