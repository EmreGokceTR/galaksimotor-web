import { NextResponse } from "next/server";
import { verifyPaymentCallback } from "@/app/_actions/payment";

/**
 * Iyzico Checkout Form callback endpoint.
 * Iyzico ödeme tamamlandığında bu URL'e POST x-www-form-urlencoded olarak
 * "token" parametresi ile geri yönlendirir. Token'ı doğrulayıp siparişi
 * PAID'e çekiyoruz; sonra başarı / hata sayfasına 303 redirect yapıyoruz.
 */
export async function POST(req: Request) {
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

// GET ile direkt erişimde admin debug
export async function GET() {
  return NextResponse.json({
    ok: true,
    note: "Iyzico callback endpoint — POST ile kullanılır.",
  });
}
