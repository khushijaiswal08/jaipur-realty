import "server-only";

// In-memory sliding-window rate limiter (SPEC §30). Per server instance: fine for a single
// VPS/container. Swap for a shared store (Redis/Upstash) when scaling horizontally
// (docs/ASSUMPTIONS.md §4).

const buckets = new Map<string, number[]>();
let lastSweep = Date.now();

function sweep(now: number, windowMs: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, hits] of buckets) {
    const fresh = hits.filter((t) => now - t < windowMs);
    if (fresh.length) buckets.set(key, fresh);
    else buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/** Records a hit for `key` and reports whether it is within `limit` per `windowMs`. */
export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): RateLimitResult {
  sweep(now, windowMs);
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    const oldest = hits[0] ?? now;
    buckets.set(key, hits);
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil((windowMs - (now - oldest)) / 1000) };
  }
  hits.push(now);
  buckets.set(key, hits);
  return { allowed: true, remaining: limit - hits.length, retryAfterSeconds: 0 };
}

/** Test helper. */
export function resetRateLimits() {
  buckets.clear();
}

export const LIMITS = {
  /** SPEC §30: 5 submissions per 10 minutes per visitor. */
  forms: { limit: 5, windowMs: 10 * 60_000 },
  /** SPEC §43: 5 login attempts per 15 minutes per email + visitor. */
  login: { limit: 5, windowMs: 15 * 60_000 },
} as const;
