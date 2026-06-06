import { NextResponse } from "next/server";
import { submitContactForm } from "@/app/_actions/contact";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * Public endpoint: rate-limited iletişim formu gönderimi.
 * IP başına 5 dakikada 3 istek (server action'da da ek katman var).
 */
export async function POST(req: Request) {
  const ip = getClientIp(req.headers);
  const rl = rateLimit(`api-send:${ip}`, { limit: 3, windowMs: 5 * 60 * 1000 });

  const headers = {
    "X-RateLimit-Limit": String(rl.limit),
    "X-RateLimit-Remaining": String(rl.remaining),
    "X-RateLimit-Reset": String(Math.floor(rl.resetAt / 1000)),
  };

  if (!rl.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Rate limit aşıldı. ${rl.retryAfterSec} saniye sonra tekrar deneyin.`,
      },
      {
        status: 429,
        headers: { ...headers, "Retry-After": String(rl.retryAfterSec) },
      }
    );
  }

  let body: {
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Geçersiz JSON." },
      { status: 400, headers }
    );
  }

  const result = await submitContactForm({
    name: body.name ?? "",
    email: body.email ?? "",
    phone: body.phone,
    subject: body.subject,
    message: body.message ?? "",
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 400, headers });
  }
  return NextResponse.json(result, { status: 200, headers });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    note: "İletişim formu endpoint'i — POST { name, email, phone?, subject?, message }",
  });
}
