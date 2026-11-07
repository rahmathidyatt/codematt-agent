import { appendFileSync } from "node:fs";
import { validateNetlifySite, assertDemoOnlyVariables } from "./netlify-preflight-core.mjs";

const siteId = process.env.NETLIFY_SITE_ID;
const token = process.env.NETLIFY_AUTH_TOKEN;
if (!siteId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(siteId)) {
  throw new Error("NETLIFY_SITE_ID_REQUIRED_AS_UUID");
}
if (!token || token.length < 16) {
  throw new Error("NETLIFY_AUTH_TOKEN_MISSING");
}

const headers = {
  Authorization: "Bearer " + token,
  Accept: "application/json",
  "User-Agent": "Codematt-Agent-Release-Preflight",
};
async function getJson(path) {
  const res = await fetch("https://api.netlify.com/api/v1/" + path, {
    headers,
    redirect: "error",
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error("NETLIFY_PREFLIGHT_HTTP_" + res.status);
  return res.json();
}

// Only GET requests. No environment secrets or raw API responses are logged.
const site = await getJson("sites/" + siteId);
const verified = validateNetlifySite(site, siteId);
const envVars = await getJson("sites/" + siteId + "/env");
assertDemoOnlyVariables(envVars);

const summary = [
  "Netlify preflight passed.",
  "Project: " + verified.name,
  "Repository: " + verified.linkedRepo,
  "Branch: " + verified.branch,
  "HTTPS site: " + verified.url,
  "All specified Codematt production feature flags are explicitly disabled.",
  "Absent flags remain disabled in application code.",
  "This does NOT prove a deployment exists or that backend integrations are production-ready.",
].join("\n");
console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    "### Codematt Netlify preflight\n\n" +
    "- Project: " + verified.name + "\n" +
    "- Repository: " + verified.linkedRepo + " (`main`)\n" +
    "- Preview base: " + verified.url + "\n" +
    "- Feature flags: all disabled or absent\n\n" +
    "Preflight only; no publication verified.\n");
}
