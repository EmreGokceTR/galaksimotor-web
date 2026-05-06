import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";
import { logActivity } from "@/lib/activity-log";

/**
 * Tüm önemli tabloları JSON snapshot olarak indirir.
 * Şifre/token gibi hassas alanları temizler.
 */
export async function GET() {
  let admin: { email: string };
  try {
    admin = await assertAdminContext();
  } catch {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

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
    activityLogs,
  ] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        // password / accounts hariç
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
      // iyzicoToken hariç (güvenlik)
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
        invoiceTcNo: true,
        invoiceFullName: true,
        invoiceAddress: true,
        invoicePdfUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.orderItem.findMany(),
    prisma.siteSetting.findMany(),
    prisma.coupon.findMany(),
    prisma.activityLog.findMany({ orderBy: { timestamp: "desc" }, take: 1000 }),
  ]);

  const snapshot = {
    meta: {
      generatedAt: new Date().toISOString(),
      generatedBy: admin.email,
      version: 1,
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
    activityLogs,
  };

  await logActivity(admin.email, "backup", "database:full", {
    counts: snapshot.meta.counts,
  });

  const stamp = new Date()
    .toISOString()
    .replace(/[-:T.]/g, "")
    .slice(0, 14);
  const filename = `galaksi-backup-${stamp}.json`;
  const body = JSON.stringify(snapshot, null, 2);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
