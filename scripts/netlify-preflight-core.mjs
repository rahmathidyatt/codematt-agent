/**
 * Pure, side-effect-free checks for a Codematt demo-only Netlify preview.
 * The live-site HTTP/API wrapper is deliberately kept in a separate file.
 */
const RELEASE_REPO = "rahmathidyatt/codematt-agent";
const FEATURE_FLAGS = [
  "CODEMATT_AUTH_ENABLED",
  "CODEMATT_DATABASE_ENABLED",
  "CODEMATT_ENABLE_LIVE_AI",
];

function normalizeGithubRepo(raw) {
  if (typeof raw !== "string") return "";
  const text = raw.trim().toLowerCase()
    .replace(/^git@github\.com:/, "")
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/\.git$/, "")
    .replace(/\/$/, "");
  return text;
}

export function validateNetlifySite(site, expectedId) {
  if (!site || typeof site !== "object" || Array.isArray(site)) {
    throw new Error("NETLIFY_SITE_INVALID");
  }
  if (!expectedId || site.id !== expectedId) {
    throw new Error("NETLIFY_SITE_ID_MISMATCH");
  }
  const linked = site.build_settings || site.repo;
  if (!linked || typeof linked !== "object") {
    throw new Error("NETLIFY_GIT_REPO_NOT_LINKED");
  }
  const remote = normalizeGithubRepo(linked.repo_url || linked.repo_path);
  if (remote !== RELEASE_REPO) {
    throw new Error("NETLIFY_GIT_REPO_MISMATCH");
  }
  if (linked.repo_branch !== "main") {
    throw new Error("NETLIFY_GIT_BRANCH_NOT_MAIN");
  }
  if (linked.stop_builds === true) {
    throw new Error("NETLIFY_BUILDS_STOPPED");
  }
  const siteUrl = site.ssl_url;
  if (typeof siteUrl !== "string" || !siteUrl.startsWith("https://")) {
    throw new Error("NETLIFY_HTTPS_SITE_UNAVAILABLE");
  }
  const url = new URL(siteUrl);
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error("NETLIFY_HTTPS_SITE_INVALID");
  }
  return { name: String(site.name || ""), url: url.origin, linkedRepo: remote, branch: linked.repo_branch };
}

export function assertDemoOnlyVariables(vars) {
  if (!Array.isArray(vars)) throw new Error("NETLIFY_ENV_LIST_UNAVAILABLE");
  for (const key of FEATURE_FLAGS) {
    const entries = vars.filter((entry) => entry?.key === key);
    for (const entry of entries) {
      // A masked value cannot be verified as disabled, so do not deploy.
      if (!Array.isArray(entry.values) || entry.values.length === 0) {
        throw new Error("NETLIFY_FEATURE_FLAG_UNVERIFIABLE_" + key);
      }
      for (const setting of entry.values) {
        if (typeof setting?.value !== "string" ||
          setting.value.trim().toLowerCase() !== "false") {
          throw new Error("NETLIFY_FEATURE_FLAG_MUST_BE_FALSE_" + key);
        }
      }
    }
  }
  return true;
}
