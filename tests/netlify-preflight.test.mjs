import test from "node:test";
import assert from "node:assert/strict";
import { validateNetlifySite, assertDemoOnlyVariables } from "../scripts/netlify-preflight-core.mjs";

const siteId = "11111111-2222-4333-8444-555555555555";
const site = {
  id: siteId,
  name: "codematt-agent",
  ssl_url: "https://codematt.example.netlify.app",
  build_settings: {
    repo_url: "https://github.com/rahmathidyatt/codematt-agent.git",
    repo_branch: "main",
    stop_builds: false,
  },
};

test("site preflight accepts only the selected Netlify project bound to Codematt main", () => {
  const result = validateNetlifySite(site, siteId);
  assert.equal(result.linkedRepo, "rahmathidyatt/codematt-agent");
  assert.equal(result.url, "https://codematt.example.netlify.app");
  assert.throws(() => validateNetlifySite(site, "99999999-2222-4333-8444-555555555555"), /SITE_ID_MISMATCH/);
  assert.throws(() => validateNetlifySite({ ...site, ssl_url: "http://insecure.netlify.app" }, siteId), /HTTPS_SITE_UNAVAILABLE/);
});

test("wrong repo, wrong branch, stopped builds or missing repo binding fails closed", () => {
  for (const bad of [
    { ...site, build_settings: { ...site.build_settings, repo_url: "https://github.com/rahmathidyatt/hybrid-office" } },
    { ...site, build_settings: { ...site.build_settings, repo_branch: "staging" } },
    { ...site, build_settings: { ...site.build_settings, stop_builds: true } },
    { ...site, build_settings: null },
  ]) {
    assert.throws(() => validateNetlifySite(bad, siteId));
  }
});

test("production flags are absent or false across every deploy context", () => {
  assert.equal(assertDemoOnlyVariables([]), true);
  assert.equal(assertDemoOnlyVariables([
    { key: "CODEMATT_ENABLE_LIVE_AI", values: [{ context: "all", value: "false" }] },
    { key: "CODEMATT_DATABASE_ENABLED", values: [{ context: "production", value: "FALSE" }] },
    { key: "CODEMATT_AUTH_ENABLED", values: [{ context: "deploy-preview", value: "false" }] },
  ]), true);
});

test("active or masked feature flag rejects any demo deployment attempt", () => {
  for (const value of ["true", "1", "", undefined]) {
    assert.throws(() => assertDemoOnlyVariables([
      { key: "CODEMATT_ENABLE_LIVE_AI", values: [{ context: "production", value }] },
    ]), /FEATURE_FLAG_MUST_BE_FALSE/);
  }
  assert.throws(() => assertDemoOnlyVariables([
    { key: "CODEMATT_AUTH_ENABLED", is_secret: true, values: [] },
  ]), /FEATURE_FLAG_UNVERIFIABLE/);
  assert.throws(() => assertDemoOnlyVariables(null), /ENV_LIST_UNAVAILABLE/);
});
