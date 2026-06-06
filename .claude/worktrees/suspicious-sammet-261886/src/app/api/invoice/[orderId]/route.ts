/**
 * GET /api/invoice/[orderId]
 *
 * Sipariş için on-demand Bilgi Faturası PDF'i üretir.
 * Sadece oturum açmış kullanıcılar kendi siparişlerini,
 * adminler ise tüm siparişleri indirebilir.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInvoicePdf } from "@/lib/e-invoice/pdf";
import type { InvoiceData } from "@/lib/e-invoice/types";

export async function GET(
  _req: Request,
  { params }: { params: { orderId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
  }

  // Yetki: admin veya siparişin sahibi
  const isAdmin = session.user.role === "ADMIN";
  const isOwner = order.userId === session.user.id;
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  // Henüz invoiceNumber yoksa UUID bazlı geçici numara kullan
  const invoiceNumber = order.invoiceNumber ?? `TEMP-${order.orderNumber}`;

  const data: InvoiceData = {
    invoiceNumber,
    orderId: order.id,
    orderNumber: order.orderNumber,
    issuedAt: order.createdAt,
    customer: {
      name: order.invoiceFullName ?? order.shippingName ?? order.user.name ?? "—",
      email: order.user.email,
      phone: order.shippingPhone ?? order.user.phone ?? null,
      address: order.invoiceAddress ?? order.shippingAddress ?? null,
      city: order.shippingCity ?? null,
      tcNo: order.invoiceTcNo ?? null,
    },
    lines: order.items.map((item) => ({
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      // KDV dahil fiyatı KDV hariç hesapla (%20 varsayım)
      unitPrice: Number(item.price) / 1.2,
      vatRate: 20,
    })),
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shippingFee),
    discountAmount: order.discountAmount ? Number(order.discountAmount) : undefined,
    total: Number(order.total),
    currency: "TRY",
  };

  try {
    const pdfBuffer = await generateInvoicePdf(data);

    const filename = `fatura-${invoiceNumber.replace("/", "-")}.pdf`;

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (e: unknown) {
    console.error("[invoice-pdf] Hata:", e);
    return NextResponse.json(
      { error: "PDF oluşturulurken hata oluştu." },
      { status: 500 }
    );
  }
}
