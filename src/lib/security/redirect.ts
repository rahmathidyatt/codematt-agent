/** Resolve an untrusted post-login destination to an internal application path. */
export function safeRedirect(value: unknown, origin: string, fallback = "/dashboard"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return fallback;
  try {
    const base = new URL(origin);
    const target = new URL(value, base);
    if (target.origin !== base.origin) return fallback;
    return `${target.pathname}${target.search}${target.hash}`;
  } catch { return fallback; }
}
