"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";
import { logActivity } from "@/lib/activity-log";
import { sendOrderStatusMail } from "@/lib/notifications";
import {
  cancelPayment,
  refundPayment,
  retrievePaymentItems,
  isIyzicoConfigured,
} from "@/lib/iyzico";
import { createInvoice } from "@/lib/e-invoice";

async function getOrderWithUser(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const { email } = await assertAdminContext();

  const before = await getOrderWithUser(orderId);
  if (!before) throw new Error("Sipariş bulunamadı.");
  if (before.status === status) return; // değişmediyse no-op

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { user: true },
  });

  await logActivity(email, "order_status", `order:${orderId}`, {
    from: before.status,
    to: status,
    orderNumber: order.orderNumber,
  });

  // Müşteriye otomatik bildirim — hata akışı bloklamaz
  sendOrderStatusMail(order).catch(console.error);

  revalidatePath("/admin/siparisler");
  revalidatePath("/admin");
  revalidatePath("/hesabim/siparislerim");
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus
): Promise<void> {
  const { email } = await assertAdminContext();
  const before = await prisma.order.findUnique({
    where: { id: orderId },
    select: { paymentStatus: true, orderNumber: true, invoicePdfUrl: true },
  });
  if (!before) throw new Error("Sipariş bulunamadı.");

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus },
  });

  await logActivity(email, "payment_status", `order:${orderId}`, {
    from: before.paymentStatus,
    to: paymentStatus,
    orderNumber: before.orderNumber,
  });

  // Ödeme onaylandığında ve henüz fatura kesilmediyse fatura oluştur
  if (paymentStatus === PaymentStatus.PAID && !before.invoicePdfUrl) {
    triggerInvoice(orderId).catch(console.error);
  }

  revalidatePath("/admin/siparisler");
}

/** Arka planda fatura oluştur ve invoicePdfUrl güncelle */
async function triggerInvoice(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true, items: true },
  });
  if (!order || !order.invoiceNumber) return;

  const result = await createInvoice(
    {
      invoiceNumber: order.invoiceNumber,
      orderId: order.id,
      orderNumber: order.orderNumber,
      issuedAt: new Date(),
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
        unitPrice: Number(item.price) / 1.2, // KDV dahil → hariç
        vatRate: 20,
      })),
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingFee),
      discountAmount: order.discountAmount ? Number(order.discountAmount) : undefined,
      total: Number(order.total),
      currency: "TRY",
    },
    orderId
  );

  if (result.ok) {
    await prisma.order.update({
      where: { id: orderId },
      data: { invoicePdfUrl: result.pdfUrl },
    });
  }
}

export async function setTrackingNumber(
  orderId: string,
  tracking: string
): Promise<void> {
  const { email } = await assertAdminContext();
  const trimmed = tracking.trim();

  const before = await prisma.order.findUnique({
    where: { id: orderId },
    select: { trackingNumber: true, status: true, orderNumber: true },
  });
  if (!before) throw new Error("Sipariş bulunamadı.");

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      trackingNumber: trimmed || null,
      // Kargo no girildiyse otomatik SHIPPED'e çek (henüz değilse)
      ...(trimmed && before.status === "PREPARING"
        ? { status: OrderStatus.SHIPPED }
        : {}),
    },
    include: { user: true },
  });

  await logActivity(email, "tracking_set", `order:${orderId}`, {
    orderNumber: before.orderNumber,
    trackingNumber: trimmed || null,
  });

  // Kargolandıysa müşteriye bildirim
  if (order.status === OrderStatus.SHIPPED && trimmed) {
    sendOrderStatusMail(order).catch(console.error);
  }

  revalidatePath("/admin/siparisler");
  revalidatePath("/hesabim/siparislerim");
}

// ─── İyzico İade (Refund / Cancel) ──────────────────────────────────────────

export type RefundResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Admin tarafından başlatılan iyzico iadesi.
 * Önce cancel dener (aynı gün işlemler), başarısız olursa refund dener (T+1+).
 */
export async function refundOrder(orderId: string): Promise<RefundResult> {
  const { email } = await assertAdminContext();

  if (!isIyzicoConfigured) {
    return { ok: false, error: "Iyzico yapılandırılmamış (env eksik)." };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (!order) return { ok: false, error: "Sipariş bulunamadı." };
  if (order.paymentStatus !== "PAID") {
    return { ok: false, error: "Sadece ödenmiş (PAID) siparişler iade edilebilir." };
  }
  if (!order.iyzicoPaymentId) {
    return { ok: false, error: "İyzico ödeme ID'si bulunamadı. Manuel işlem gerekebilir." };
  }

  const convId = `refund-${order.id}-${Date.now().toString(36)}`;
  const total = Number(order.total).toFixed(2);
  let method: "cancel" | "refund" = "cancel";

  // 1️⃣ Önce cancel dene
  let result = await cancelPayment({
    paymentId: order.iyzicoPaymentId,
    conversationId: convId,
    ip: "127.0.0.1",
  });

  // 2️⃣ Cancel başarısız → refund dene (T+1)
  if (!result.ok) {
    method = "refund";
    try {
      const items = await retrievePaymentItems(order.iyzicoPaymentId);
      if (!items.length) {
        return { ok: false, error: "İade için ödeme kalemleri bulunamadı." };
      }
      // İlk transaction üzerinden tam tutar iade
      result = await refundPayment({
        paymentTransactionId: items[0].paymentTransactionId,
        price: total,
        conversationId: convId,
        ip: "127.0.0.1",
      });
    } catch (e: unknown) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "İade işlemi başarısız.",
      };
    }
  }

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  // ✅ İade başarılı — sipariş durumunu güncelle
  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: PaymentStatus.REFUNDED, status: OrderStatus.CANCELLED },
  });

  await logActivity(email, "order_refund", `order:${orderId}`, {
    orderNumber: order.orderNumber,
    total: Number(order.total),
    method,
    iyzicoPaymentId: order.iyzicoPaymentId,
  });

  revalidatePath("/admin/siparisler");
  revalidatePath("/admin");
  revalidatePath("/hesabim/siparislerim");

  return { ok: true };
}
