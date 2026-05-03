"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/admin";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await assertAdmin();
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/admin/siparisler");
  revalidatePath("/admin");
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus
) {
  await assertAdmin();
  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus },
  });
  revalidatePath("/admin/siparisler");
}

export async function setTrackingNumber(orderId: string, tracking: string) {
  await assertAdmin();
  await prisma.order.update({
    where: { id: orderId },
    data: { trackingNumber: tracking || null },
  });
  revalidatePath("/admin/siparisler");
}
