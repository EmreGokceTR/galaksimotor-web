import { NextResponse } from "next/server";
import { verifyPaymentCallback } from "@/app/_actions/payment";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * Iyzico Checkout Form callback endpoint.
 * Iyzico ödeme tamamlandığında bu URL'e POST x-www-form-urlencoded olarak
 * "token" parametresi ile geri yönlendirir. Token'ı doğrulayıp siparişi
 * PAID'e çekiyoruz; sonra başarı / hata sayfasına 303 redirect yapıyoruz.
 */
export async function POST(req: Request) {
  // Rate limit: prevent token-flooding abuse (20 attempts / 5 min per IP)
  const ip = getClientIp(req.headers as unknown as Headers);
  const rl = rateLimit(`iyzico-cb:${ip}`, { limit: 20, windowMs: 5 * 60_000 });
  if (!rl.ok) {
    return new Response(null, {
      status: 429,
      headers: { "Retry-After": String(rl.retryAfterSec) },
    });
  }

  let token = "";
  try {
    const ct = req.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      const j = (await req.json()) as { token?: string };
      token = j.token ?? "";
    } else {
      const fd = await req.formData();
      token = String(fd.get("token") ?? "");
    }
  } catch {
    token = "";
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ??
    new URL(req.url).origin;

  if (!token) {
    return NextResponse.redirect(
      `${siteUrl}/odeme/hata?reason=missing_token`,
      { status: 303 }
    );
  }

  const result = await verifyPaymentCallback(token);
  if (!result.ok) {
    return NextResponse.redirect(
      `${siteUrl}/odeme/hata?reason=${encodeURIComponent(result.error)}`,
      { status: 303 }
    );
  }

  return NextResponse.redirect(`${siteUrl}/odeme/basari/${result.orderId}`, {
    status: 303,
  });
}

// GET istekleri için 405 Method Not Allowed
export async function GET() {
  return new Response(null, {
    status: 405,
    headers: { Allow: "POST" },
  });
}
