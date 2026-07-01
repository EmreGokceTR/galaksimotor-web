import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/price-alerts { productId, email }
 * "İndirime girince haber ver" — üye veya misafir e-postasını kaydeder.
 * Ürün fiyatı düşünce priceDrop tetikleyicisi (bkz. admin ürün güncelleme
 * action'ı) bu kayıtlara e-posta gönderir.
 */
export async function POST(req: Request) {
  const ip = headers().get("x-forwarded-for")?.split(",")[0].trim() ?? "anon";
  const rl = rateLimit(`price-alert:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Çok fazla istek. Lütfen biraz sonra tekrar deneyin." },
      { status: 429 }
    );
  }

  let body: { productId?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const productId = String(body.productId ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();

  if (!productId) {
    return NextResponse.json({ error: "productId zorunlu." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Geçerli bir e-posta girin." }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, price: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
  }

  const session = await getServerSession(authOptions);

  await prisma.priceAlert.upsert({
    where: { productId_email: { productId, email } },
    update: { lastPrice: product.price, notifiedAt: null },
    create: {
      productId,
      email,
      userId: session?.user?.id ?? null,
      lastPrice: product.price,
    },
  });

  return NextResponse.json({ ok: true });
}
