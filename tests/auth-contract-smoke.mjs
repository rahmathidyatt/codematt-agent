import assert from "node:assert/strict";

const base = process.env.CONTRACT_BASE_URL || "http://127.0.0.1:3101";
const alphaId = "a1111111-b222-c333-d444-e55555555555";
const betaId = "b1111111-b222-c333-d444-e55555555555";

async function request(path, options = {}) {
  const res = await fetch(base + path, {
    ...options,
    signal: AbortSignal.timeout(8_000),
  });
  const body = await res.json();
  return { res, body };
}

const postJson = (body, cookie, origin = base) => ({
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Origin: origin,
    ...(cookie ? { Cookie: cookie } : {}),
  },
  body: JSON.stringify(body),
});

const noSession = await request("/api/auth/me");
assert.equal(noSession.res.status, 401, "authenticated mode requires a verified session");

const forgedOrigin = await request("/api/auth/sign-in", postJson({
  email: "alpha@codematt.test", password: "alphaPassword123!",
}, null, "https://attacker.invalid"));
assert.equal(forgedOrigin.res.status, 403, "credential endpoints must reject cross-site Origin");

const badLogin = await request("/api/auth/sign-in", postJson({
  email: "alpha@codematt.test", password: "wrongPassword123!",
}));
assert.equal(badLogin.res.status, 401);

async function signIn(email, password) {
  const { res, body } = await request("/api/auth/sign-in", postJson({ email, password }));
  assert.equal(res.status, 200, JSON.stringify(body));
  assert.equal(body.ok, true);
  const setCookie = res.headers.get("set-cookie") || "";
  assert.match(setCookie, /codematt_access=/);
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Lax/i);
  const cookie = setCookie.split(";")[0];
  return cookie;
}

const alphaCookie = await signIn("alpha@codematt.test", "alphaPassword123!");
const alphaMe = await request("/api/auth/me", { headers: { Cookie: alphaCookie } });
assert.equal(alphaMe.res.status, 200);
assert.equal(alphaMe.body.user.id, alphaId);
assert.equal(alphaMe.res.headers.get("cache-control"), "no-store, private");

const missingCookieList = await request("/api/private/listings");
assert.equal(missingCookieList.res.status, 401);

const alphaEmpty = await request("/api/private/listings", { headers: { Cookie: alphaCookie } });
assert.equal(alphaEmpty.res.status, 200);
assert.deepEqual(alphaEmpty.body.listings, []);

const ownerSpoof = await request("/api/private/listings", postJson({
  name: "Should not persist", location: "Cibubur", user_id: betaId,
}, alphaCookie));
assert.equal(ownerSpoof.res.status, 400);

const crossSiteWrite = await request("/api/private/listings", postJson({
  name: "Cross-site input", location: "Bogor",
}, alphaCookie, "https://attacker.invalid"));
assert.equal(crossSiteWrite.res.status, 403);

const alphaWrite = await request("/api/private/listings", postJson({
  name: "Unit test property", location: "Cibubur", price: 1200000,
}, alphaCookie));
assert.equal(alphaWrite.res.status, 201, JSON.stringify(alphaWrite.body));
assert.equal(alphaWrite.body.listing.user_id, alphaId);

const betaCookie = await signIn("beta@codematt.test", "betaPassword123!");
const betaMe = await request("/api/auth/me", { headers: { Cookie: betaCookie } });
assert.equal(betaMe.body.user.id, betaId);

const betaList = await request("/api/private/listings", { headers: { Cookie: betaCookie } });
assert.equal(betaList.res.status, 200);
assert.deepEqual(betaList.body.listings, [], "beta must not see the alpha listing in mock");
const alphaList = await request("/api/private/listings", { headers: { Cookie: alphaCookie } });
assert.equal(alphaList.res.status, 200);
assert.equal(alphaList.body.listings.length, 1);
assert.equal(alphaList.body.listings[0].name, "Unit test property");

const forgedCookie = await request("/api/auth/me", {
  headers: { Cookie: "codematt_access=" + "fake-" + "z".repeat(96) },
});
assert.equal(forgedCookie.res.status, 401, "cookie content alone never authorizes a request");

const signup = await request("/api/auth/sign-up", postJson({
  name: "Calon Agen", agency: "Kantor Uji", email: "new@codematt.test",
  password: "newPassword123!",
}));
assert.equal(signup.res.status, 200);
assert.equal(signup.body.ok, true);

const logout = await request("/api/auth/sign-out", {
  method: "POST",
  headers: { Origin: base, Cookie: alphaCookie },
});
assert.equal(logout.res.status, 200);
assert.equal(logout.body.upstreamRevocation, "confirmed");
assert.match(logout.res.headers.get("set-cookie") || "", /Max-Age=0/i);

console.log("Mocked Auth/PostgREST contract smoke passed: login, session verification, CSRF, user-scoped reads/writes, sign-out.");
console.log("This is NOT a real Supabase RLS test.");
