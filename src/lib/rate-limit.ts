/**
 * Basit, in-memory rate limiter (sliding window).
 * Tek-instance Vercel Serverless'ta kısa pencerede koruma sağlar.
 * Cluster için Redis/Upstash gerekir.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSec: number;
};

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    const next = { count: 1, resetAt: now + opts.windowMs };
    buckets.set(key, next);
    return {
      ok: true,
      limit: opts.limit,
      remaining: opts.limit - 1,
      resetAt: next.resetAt,
      retryAfterSec: Math.ceil(opts.windowMs / 1000),
    };
  }

  bucket.count += 1;
  const remaining = Math.max(0, opts.limit - bucket.count);
  const ok = bucket.count <= opts.limit;

  return {
    ok,
    limit: opts.limit,
    remaining,
    resetAt: bucket.resetAt,
    retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

/** İstemci IP'sini çek (Next.js Request headers'dan). */
export function getClientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "anon";
}
