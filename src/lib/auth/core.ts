/**
 * Small, dependency-free guard for Supabase Auth's REST endpoints.
 * Codematt Auth stays disabled unless an explicit project is configured.
 * This is deliberately separate from the Hybrid Office project.
 */
export interface AuthBackendConfig { url: string; publishableKey: string }

export function getAuthBackendConfig(env: NodeJS.ProcessEnv = process.env): AuthBackendConfig | null {
  if (env.CODEMATT_AUTH_ENABLED !== "true") return null;
  const rawUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!rawUrl || !publishableKey || !publishableKey.startsWith("sb_publishable_")) return null;
  try {
    const url = new URL(rawUrl);
    // Only direct hosted Supabase projects. Custom domains require a separate reviewed allowlist.
    if (url.protocol !== "https:" || !/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname) ||
      url.username || url.password || url.search || url.hash || url.pathname !== "/") return null;
    return { url: url.origin, publishableKey };
  } catch {
    return null;
  }
}

export function isSameOriginMutation(request: Request): boolean {
  const supplied = request.headers.get("origin");
  if (!supplied) return false; // Fail closed for browser cookie mutations.
  try {
    const expected = new URL(request.url);
    const origin = new URL(supplied);
    return origin.origin === expected.origin &&
      (expected.protocol === "https:" || expected.hostname === "localhost" || expected.hostname === "127.0.0.1");
  } catch {
    return false;
  }
}

export const AUTH_COOKIE_NAME = "codematt_access";

export function authCookieMaxAge(value: unknown): number {
  const seconds = typeof value === "number" && Number.isFinite(value) ? value : 0;
  // No refresh token is persisted: users must log in again on expiry.
  return Math.max(0, Math.min(3_600, Math.floor(seconds) - 60));
}

export function validAccessToken(value: unknown): value is string {
  return typeof value === "string" && value.length > 50 && value.length < 4_096 && /^[a-zA-Z0-9_\-.]+$/.test(value);
}
