/**
 * Next.js Middleware — Rate Limiting + Auth Route Protection
 *
 * Rate limiting: In-memory sliding window per Vercel function instance.
 * Provides meaningful protection for auth brute-force and API abuse at this
 * traffic scale. For higher traffic, replace RATE_MAP with Upstash Redis.
 *
 * Auth protection: JWT presence check (NextAuth withAuth) for /admin and /hesabim.
 */
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

// ---------------------------------------------------------------------------
// Sliding-window rate limiter (in-memory, resets on cold start — acceptable
// for a small-business site; upgrade to Redis if needed)
// ---------------------------------------------------------------------------
const RATE_MAP = new Map<string, { count: number; reset: number }>();

function isRateLimited(
  ip: string,
  bucket: string,
  limit: number,
  windowMs: number
): boolean {
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const slot = RATE_MAP.get(key);

  if (!slot || now > slot.reset) {
    RATE_MAP.set(key, { count: 1, reset: now + windowMs });
    return false;
  }

  if (slot.count >= limit) return true;
  slot.count++;
  return false;
}

function tooManyRequests(retryAfter = 60): NextResponse {
  return new NextResponse(
    JSON.stringify({ error: "Çok fazla istek. Lütfen kısa süre sonra tekrar deneyin." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(retryAfter),
      },
    }
  );
}

// ---------------------------------------------------------------------------
// NextAuth middleware (JWT presence check for protected pages)
// ---------------------------------------------------------------------------
const authMiddleware = withAuth({ pages: { signIn: "/giris" } });

// ---------------------------------------------------------------------------
// Main middleware
// ---------------------------------------------------------------------------
export default function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  // ── Auth & registration endpoints (brute-force protection) ─────────────
  // 20 attempts per IP per minute
  if (
    path.startsWith("/api/auth") ||
    path === "/api/register"
  ) {
    if (isRateLimited(ip, "auth", 20, 60_000)) {
      return tooManyRequests(60);
    }
  }

  // ── Password reset (stricter — 5 per 10 min) ───────────────────────────
  if (
    path === "/api/auth/forgot-password" ||
    path === "/api/auth/reset-password"
  ) {
    if (isRateLimited(ip, "pwd", 5, 600_000)) {
      return tooManyRequests(600);
    }
  }

  // ── Write API endpoints (order/appointment/review spam) ────────────────
  // 10 per minute
  if (
    path === "/api/orders" ||
    path === "/api/appointments" ||
    path === "/api/reviews" ||
    path === "/api/send"
  ) {
    if (isRateLimited(ip, "write", 10, 60_000)) {
      return tooManyRequests(60);
    }
  }

  // ── Admin backup endpoint (1 per 5 min) ────────────────────────────────
  if (path.startsWith("/api/admin/backup")) {
    if (isRateLimited(ip, "backup", 1, 300_000)) {
      return tooManyRequests(300);
    }
  }

  // ── Protected pages → delegate to NextAuth ─────────────────────────────
  if (path.startsWith("/admin") || path.startsWith("/hesabim")) {
    return (authMiddleware as unknown as (req: NextRequest) => Response)(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected pages
    "/admin/:path*",
    "/hesabim/:path*",
    // Rate-limited API routes
    "/api/auth/:path*",
    "/api/register",
    "/api/orders",
    "/api/appointments",
    "/api/reviews",
    "/api/send",
    "/api/admin/backup/:path*",
  ],
};
