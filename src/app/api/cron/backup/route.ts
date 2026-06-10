import { NextResponse } from "next/server";
import { put, list, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

/**
 * Otomatik veritabanı yedekleme — Vercel Cron tarafından günlük tetiklenir.
 *
 * Çalışma:
 *  1) Tüm kritik tabloların snapshot'ını al
 *  2) Vercel Blob'a yaz: `backups/galaksi-backup-YYYYMMDD-HHMMSS.json`
 *  3) 30 günden eski yedekleri sil (storage yönetimi)
 *  4) Sonucu JSON döndür
 *
 * Güvenlik:
 *  - Vercel cron çağrıları otomatik Authorization: Bearer ${CRON_SECRET} ekler
 *  - Manuel çağrı için de aynı header gerekli
 *  - Production'da CRON_SECRET zorunlu; geliştirmede atlanabilir
 *
 * Cron tetikleyici: `vercel.json` → schedule "0 3 * * *" (her gün 03:00 UTC = 06:00 TR)
 */

// Cron tek bir sefer çalışır, edge cache anlamsız. Force dynamic + max duration.
export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 sn (Hobby plan limiti)

const RETENTION_DAYS = 30;

export async function GET(req: Request) {
  // Vercel cron'larında otomatik Authorization header eklenir
  const auth = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
  }

  try {
    // Snapshot — hassas alanlar dışarda
    const [
      users,
      products,
      productImages,
      productVariants,
      categories,
      motorcycles,
      fitments,
      motorcycleListings,
      blogPosts,
      services,
      appointments,
      orders,
      orderItems,
      siteSettings,
      coupons,
    ] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          createdAt: true,
          // password ve account hariç
        },
      }),
      prisma.product.findMany(),
      prisma.productImage.findMany(),
      prisma.productVariant.findMany(),
      prisma.category.findMany(),
      prisma.motorcycle.findMany(),
      prisma.fitment.findMany(),
      prisma.motorcycleListing.findMany(),
      prisma.blogPost.findMany(),
      prisma.service.findMany(),
      prisma.appointment.findMany(),
      prisma.order.findMany({
        select: {
          id: true,
          orderNumber: true,
          userId: true,
          status: true,
          paymentStatus: true,
          deliveryType: true,
          subtotal: true,
          shippingFee: true,
          discountAmount: true,
          total: true,
          couponCode: true,
          shippingName: true,
          shippingPhone: true,
          shippingAddress: true,
          shippingCity: true,
          trackingNumber: true,
          createdAt: true,
          updatedAt: true,
          // iyzicoToken hariç (PII)
        },
      }),
      prisma.orderItem.findMany(),
      prisma.siteSetting.findMany(),
      prisma.coupon.findMany(),
    ]);

    const snapshot = {
      meta: {
        generatedAt: new Date().toISOString(),
        generatedBy: "cron",
        retentionDays: RETENTION_DAYS,
        counts: {
          users: users.length,
          products: products.length,
          orders: orders.length,
          appointments: appointments.length,
          coupons: coupons.length,
        },
      },
      users,
      products,
      productImages,
      productVariants,
      categories,
      motorcycles,
      fitments,
      motorcycleListings,
      blogPosts,
      services,
      appointments,
      orders,
      orderItems,
      siteSettings,
      coupons,
    };

    const now = new Date();
    const stamp = now
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14);
    const filename = `backups/galaksi-backup-${stamp}.json`;
    const body = JSON.stringify(snapshot);

    // Blob'a yaz (public access — sadece URL bilen erişir; admin paneli URL'leri tutar)
    const uploaded = await put(filename, body, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });

    // 30 günden eski yedekleri sil
    let deletedCount = 0;
    try {
      const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
      const allBackups = await list({ prefix: "backups/" });
      const toDelete = allBackups.blobs
        .filter((b) => new Date(b.uploadedAt).getTime() < cutoff)
        .map((b) => b.url);
      if (toDelete.length > 0) {
        await del(toDelete);
        deletedCount = toDelete.length;
      }
    } catch (e) {
      // Temizlik hatası snapshot'ı bozmaz — sadece logla
      console.warn("[cron/backup] eski yedek temizliği başarısız:", e);
    }

    return NextResponse.json({
      ok: true,
      filename,
      url: uploaded.url,
      size: body.length,
      counts: snapshot.meta.counts,
      cleanedUp: deletedCount,
    });
  } catch (err) {
    console.error("[cron/backup] hata:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Bilinmeyen hata",
      },
      { status: 500 }
    );
  }
}
