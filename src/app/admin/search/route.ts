import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

type Hit = { label: string; sub?: string; href: string };

export async function GET(req: Request) {
  try {
    await assertAdmin();
  } catch {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ groups: [] });
  }

  const like = { contains: q, mode: "insensitive" as const };

  const [products, orders, customers, claims, blog] = await Promise.all([
    prisma.product.findMany({
      where: { OR: [{ name: like }, { sku: like }, { oemNo: like }, { compatNo: like }] },
      select: { name: true, slug: true, sku: true, stock: true },
      take: 5,
    }),
    prisma.order.findMany({
      where: {
        OR: [{ orderNumber: like }, { shippingName: like }, { shippingPhone: like }],
      },
      select: { id: true, orderNumber: true, shippingName: true, total: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.user.findMany({
      where: {
        AND: [
          { email: { not: { endsWith: "@deleted.local" } } },
          { OR: [{ name: like }, { email: like }, { phone: like }] },
        ],
      },
      select: { id: true, name: true, email: true, phone: true },
      take: 5,
    }),
    prisma.damageClaim.findMany({
      where: {
        OR: [{ claimNumber: like }, { fullName: like }, { phone: like }, { plate: like }],
      },
      select: { id: true, claimNumber: true, fullName: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.blogPost.findMany({
      where: { title: like },
      select: { id: true, title: true },
      take: 5,
    }),
  ]);

  const groups: { title: string; icon: string; items: Hit[] }[] = [];

  if (products.length)
    groups.push({
      title: "Ürünler",
      icon: "🛍",
      items: products.map((p) => ({
        label: p.name,
        sub: `${p.sku} · ${p.stock} stok`,
        href: `/urun/${p.slug}`,
      })),
    });

  if (orders.length)
    groups.push({
      title: "Siparişler",
      icon: "📦",
      items: orders.map((o) => ({
        label: `#${o.orderNumber}`,
        sub: `${o.shippingName ?? ""} · ${Number(o.total).toLocaleString("tr-TR")} ₺`,
        href: `/admin/siparisler/${o.id}`,
      })),
    });

  if (customers.length)
    groups.push({
      title: "Müşteriler",
      icon: "👥",
      items: customers.map((u) => ({
        label: u.name ?? u.email,
        sub: u.phone ?? u.email,
        href: `/admin/kullanicilar/${u.id}`,
      })),
    });

  if (claims.length)
    groups.push({
      title: "Hasar Dosyaları",
      icon: "📂",
      items: claims.map((c) => ({
        label: c.claimNumber,
        sub: c.fullName,
        href: `/admin/hasar-dosyalari/${c.id}`,
      })),
    });

  if (blog.length)
    groups.push({
      title: "Blog",
      icon: "✍️",
      items: blog.map((b) => ({
        label: b.title,
        href: `/admin/blog/${b.id}`,
      })),
    });

  return NextResponse.json({ groups });
}
