"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";
import { logActivity } from "@/lib/activity-log";
import { sendOrderStatusMail } from "@/lib/notifications";

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
    select: { paymentStatus: true, orderNumber: true },
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

  revalidatePath("/admin/siparisler");
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
