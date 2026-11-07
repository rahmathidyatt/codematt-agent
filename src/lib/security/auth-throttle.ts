import { createHash } from "node:crypto";

type Action = "sign-in" | "sign-up";
type Bucket = { count: number; expiresAt: number };

const MAX_BUCKETS = 2_048;
const limits: Record<Action, { attempts: number; windowMs: number }> = {
  "sign-in": { attempts: 5, windowMs: 5 * 60_000 },
  "sign-up": { attempts: 3, windowMs: 60 * 60_000 },
};
const buckets = new Map<string, Bucket>();

/**
 * Defense in depth for one running server instance. NOT a distributed rate
 * limiter. Do not enable commercial/public Auth until durable, centrally
 * enforced rate limits and anti-abuse controls are provisioned.
 */
export function takeAuthAttempt(
  action: Action,
  email: string,
  now = Date.now()
): { allowed: boolean; retryAfterSeconds: number } {
  const hashed = createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
  const key = action + ":" + hashed;
  const limit = limits[action];
  const previous = buckets.get(key);

  if (previous && previous.expiresAt > now) {
    if (previous.count >= limit.attempts) {
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((previous.expiresAt - now) / 1000)) };
    }
    previous.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  // Opportunistically prune expired entries; never let the map grow without bound.
  if (buckets.size >= MAX_BUCKETS) {
    for (const [id, value] of buckets) {
      if (value.expiresAt <= now) buckets.delete(id);
    }
    if (buckets.size >= MAX_BUCKETS && !previous) {
      return { allowed: false, retryAfterSeconds: 60 };
    }
  }
  buckets.set(key, { count: 1, expiresAt: now + limit.windowMs });
  return { allowed: true, retryAfterSeconds: 0 };
}
