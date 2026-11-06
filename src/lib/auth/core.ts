/**
 * Strict, dependency-free configuration and CSRF guards for Codematt Auth.
 * A separate project ref and known application origin must be configured.
 * Never infer the trusted origin from Host/X-Forwarded-* request headers.
 */
export interface AuthBackendConfig { url: string; publishableKey: string }

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

export function getTrustedAppOrigin(env: NodeJS.ProcessEnv = process.env): string | null {
  const raw = env.APP_ORIGIN?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.username || url.password || url.search || url.hash || url.pathname !== "/") return null;
    if (url.protocol !== "https:" && !(url.protocol === "http:" && LOCAL_HOSTS.has(url.hostname))) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

export function getAuthBackendConfig(env: NodeJS.ProcessEnv = process.env): AuthBackendConfig | null {
  if (env.CODEMATT_AUTH_ENABLED !== "true" || !getTrustedAppOrigin(env)) return null;
  const rawUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const projectRef = env.CODEMATT_SUPABASE_PROJECT_REF?.trim();
  if (!rawUrl || !publishableKey || !publishableKey.startsWith("sb_publishable_") ||
    !projectRef || !/^[a-z0-9]{20}$/.test(projectRef)) return null;
  try {
    const url = new URL(rawUrl);
    // Pin to the selected dedicated Supabase project, not just any .supabase.co host.
    if (url.protocol !== "https:" || url.hostname !== projectRef + ".supabase.co" ||
      url.username || url.password || url.port || url.search || url.hash || url.pathname !== "/") return null;
    return { url: url.origin, publishableKey };
  } catch {
    return null;
  }
}

export function isSameOriginMutation(request: Request, env: NodeJS.ProcessEnv = process.env): boolean {
  const supplied = request.headers.get("origin");
  if (!supplied || supplied === "null") return false;
  const fixed = getTrustedAppOrigin(env);
  // When real auth is requested, missing fixed origin is a configuration error: fail closed.
  if (env.CODEMATT_AUTH_ENABLED === "true" && !fixed) return false;
  try {
    const url = new URL(supplied);
    const expected = fixed ?? new URL(request.url).origin;
    return url.origin === expected &&
      (url.protocol === "https:" || (url.protocol === "http:" && LOCAL_HOSTS.has(url.hostname))) &&
      url.username === "" && url.password === "" && url.pathname === "/" && !url.search && !url.hash;
  } catch {
    return false;
  }
}

export const AUTH_COOKIE_NAME = "codematt_access";

export function shouldUseSecureCookie(env: NodeJS.ProcessEnv = process.env): boolean {
  // An unknown origin must never be allowed to turn off Secure cookies.
  const origin = getTrustedAppOrigin(env);
  return env.NODE_ENV === "production" || !origin || origin.startsWith("https:");
}

export function authCookieMaxAge(value: unknown): number {
  const seconds = typeof value === "number" && Number.isFinite(value) ? value : 0;
  // No refresh token is persisted: users must log in again on expiry.
  return Math.max(0, Math.min(3_600, Math.floor(seconds) - 60));
}

export function validAccessToken(value: unknown): value is string {
  return typeof value === "string" && value.length > 50 && value.length < 4_096 && /^[a-zA-Z0-9_\-.]+$/.test(value);
}
