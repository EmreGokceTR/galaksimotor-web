import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const STATUS_TR: Record<string, string> = {
  PENDING: "Beklemede",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim edildi",
  CANCELLED: "İptal",
};
const PAYMENT_TR: Record<string, string> = {
  PENDING: "Bekliyor",
  PAID: "Ödendi",
  FAILED: "Başarısız",
  REFUNDED: "İade edildi",
};

export async function GET() {
  try {
    await assertAdmin();
  } catch {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const header = [
    "Sipariş No",
    "Fatura No",
    "Tarih",
    "Müşteri",
    "E-posta",
    "Telefon",
    "Durum",
    "Ödeme",
    "Teslimat",
    "Ara Toplam",
    "Kargo",
    "İndirim",
    "Toplam",
    "Kupon",
    "Kargo Takip",
  ];

  const rows = orders.map((o) =>
    [
      o.orderNumber,
      o.invoiceNumber ?? "",
      o.createdAt.toLocaleDateString("tr-TR"),
      o.shippingName ?? o.user.name ?? "",
      o.user.email,
      o.shippingPhone ?? "",
      STATUS_TR[o.status] ?? o.status,
      PAYMENT_TR[o.paymentStatus] ?? o.paymentStatus,
      o.deliveryType === "PICKUP" ? "Mağazadan" : "Kargo",
      Number(o.subtotal).toFixed(2),
      Number(o.shippingFee).toFixed(2),
      o.discountAmount ? Number(o.discountAmount).toFixed(2) : "0.00",
      Number(o.total).toFixed(2),
      o.couponCode ?? "",
      o.trackingNumber ?? "",
    ]
      .map(csvCell)
      .join(",")
  );

  const csv = "﻿" + [header.join(","), ...rows].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="siparisler-${stamp}.csv"`,
    },
  });
}
