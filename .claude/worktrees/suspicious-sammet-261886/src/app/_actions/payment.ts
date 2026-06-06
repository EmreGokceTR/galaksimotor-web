"use server";

import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getIyzico, isIyzicoConfigured } from "@/lib/iyzico";
import { logActivity } from "@/lib/activity-log";
import { createInvoice } from "@/lib/e-invoice";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ??
    "http://localhost:3000"
  );
}

function getClientIp(): string {
  try {
    const h = headers();
    const fwd = h.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0].trim();
    return h.get("x-real-ip") ?? "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

function splitName(full: string): { name: string; surname: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { name: parts[0], surname: parts[0] };
  return {
    name: parts.slice(0, -1).join(" "),
    surname: parts[parts.length - 1],
  };
}

// ─── Iyzico Checkout Form Init ───────────────────────────────────────────────

export type InitPaymentResult =
  | {
      ok: true;
      paymentPageUrl: string;
      token: string;
      conversationId: string;
    }
  | { ok: false; error: string };

/**
 * Mevcut bir PENDING siparişi için Iyzico Checkout Form başlatır.
 * Müşteri paymentPageUrl'e yönlendirilir; ödeme tamamlandığında callback URL'e
 * (POST) Iyzico token döner ve verifyPaymentCallback çağrılır.
 */
export async function initPaymentForOrder(
  orderId: string
): Promise<InitPaymentResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "Oturum gerekli." };
  }
  if (!isIyzicoConfigured) {
    return {
      ok: false,
      error:
        "Ödeme sistemi yapılandırılmamış (IYZICO_API_KEY/IYZICO_SECRET .env'de eksik).",
    };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: true },
  });
  if (!order) return { ok: false, error: "Sipariş bulunamadı." };
  if (order.userId !== session.user.id) {
    return { ok: false, error: "Bu sipariş sana ait değil." };
  }
  if (order.paymentStatus === "PAID") {
    return { ok: false, error: "Sipariş zaten ödenmiş." };
  }

  const conversationId = `gm-${order.id}-${Date.now().toString(36)}`;
  const siteUrl = getSiteUrl();
  const callbackUrl = `${siteUrl}/api/payment/iyzico/callback`;
  const buyerName = splitName(order.shippingName ?? order.user.name ?? "Müşteri");
  const total = Number(order.total);

  const request = {
    locale: "tr",
    conversationId,
    price: total.toFixed(2),
    paidPrice: total.toFixed(2),
    currency: "TRY",
    basketId: order.orderNumber,
    paymentGroup: "PRODUCT",
    callbackUrl,
    enabledInstallments: [1, 2, 3, 6, 9],
    buyer: {
      id: order.userId,
      name: buyerName.name,
      surname: buyerName.surname,
      gsmNumber: order.shippingPhone ?? "+905555555555",
      email: order.user.email ?? "info@galaksimotor.com",
      identityNumber: order.invoiceTcNo ?? "11111111111",
      lastLoginDate: new Date()
        .toISOString()
        .replace("T", " ")
        .slice(0, 19),
      registrationDate: order.user.createdAt
        .toISOString()
        .replace("T", " ")
        .slice(0, 19),
      registrationAddress:
        order.shippingAddress ?? "Galaksi Motor / Küçükçekmece",
      ip: getClientIp(),
      city: order.shippingCity ?? "İstanbul",
      country: "Turkey",
      zipCode: "34000",
    },
    shippingAddress: {
      contactName: order.shippingName ?? "Müşteri",
      city: order.shippingCity ?? "İstanbul",
      country: "Turkey",
      address: order.shippingAddress ?? "Mağazadan teslim",
      zipCode: "34000",
    },
    billingAddress: {
      contactName: order.invoiceFullName ?? order.shippingName ?? "Müşteri",
      city: order.shippingCity ?? "İstanbul",
      country: "Turkey",
      address:
        order.invoiceAddress ?? order.shippingAddress ?? "Mağazadan teslim",
      zipCode: "34000",
    },
    basketItems: order.items.map((it) => ({
      id: it.id,
      name: it.name.slice(0, 60),
      category1: "Motosiklet",
      itemType: "PHYSICAL",
      price: (Number(it.price) * it.quantity).toFixed(2),
    })),
  };

  const client = getIyzico();
  const result = await new Promise<{
    ok: boolean;
    error?: string;
    token?: string;
    paymentPageUrl?: string;
  }>((resolve) => {
    client.checkoutFormInitialize.create(request, (err, res) => {
      if (err) {
        console.error("[Iyzico] init error:", err);
        return resolve({ ok: false, error: err.message ?? "Iyzico hatası" });
      }
      if (res?.status !== "success") {
        console.error("[Iyzico] init non-success:", res);
        return resolve({
          ok: false,
          error: res?.errorMessage ?? "Ödeme başlatılamadı.",
        });
      }
      resolve({
        ok: true,
        token: res.token,
        paymentPageUrl: res.paymentPageUrl,
      });
    });
  });

  if (!result.ok || !result.token || !result.paymentPageUrl) {
    return { ok: false, error: result.error ?? "Iyzico hatası" };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      iyzicoToken: result.token,
      iyzicoConversationId: conversationId,
    },
  });

  return {
    ok: true,
    paymentPageUrl: result.paymentPageUrl,
    token: result.token,
    conversationId,
  };
}

// ─── Iyzico Callback Verify ──────────────────────────────────────────────────

export type VerifyPaymentResult =
  | { ok: true; orderId: string; orderNumber: string }
  | { ok: false; error: string };

/**
 * Iyzico callback (POST x-www-form-urlencoded `token`) sonrası ödeme durumunu
 * doğrular, başarılıysa siparişi PAID'e çeker, faturayı üretip e-posta gönderir.
 */
export async function verifyPaymentCallback(
  token: string
): Promise<VerifyPaymentResult> {
  if (!token) return { ok: false, error: "Token eksik." };
  if (!isIyzicoConfigured) {
    return { ok: false, error: "Iyzico yapılandırılmamış." };
  }

  const client = getIyzico();
  const result = await new Promise<{
    ok: boolean;
    error?: string;
    paymentId?: string;
    paid?: boolean;
    paidPrice?: number;
    basketId?: string;
  }>((resolve) => {
    client.checkoutForm.retrieve({ token, locale: "tr" }, (err, res) => {
      if (err) {
        console.error("[Iyzico] retrieve error:", err);
        return resolve({ ok: false, error: err.message });
      }
      if (res?.status !== "success") {
        return resolve({
          ok: false,
          error: res?.errorMessage ?? "Ödeme doğrulanamadı.",
        });
      }
      resolve({
        ok: true,
        paymentId: res.paymentId,
        paid: res.paymentStatus === "SUCCESS",
        paidPrice: res.paidPrice,
        basketId: res.basketId,
      });
    });
  });

  if (!result.ok) return { ok: false, error: result.error ?? "Iyzico hatası" };

  // Token üzerinden Order'ı bul (alternatif: basketId == orderNumber)
  const order = await prisma.order.findFirst({
    where: { iyzicoToken: token },
    include: { items: true, user: true },
  });
  if (!order) return { ok: false, error: "Sipariş bulunamadı." };

  if (!result.paid) {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "FAILED" },
    });
    return { ok: false, error: "Ödeme reddedildi veya iptal edildi." };
  }

  // ── Başarılı ödeme: Order'ı işaretle, audit log, fatura, e-posta ──────────
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "PAID",
      iyzicoPaymentId: result.paymentId ?? null,
      status: "PREPARING",
    },
    include: { items: true, user: true },
  });

  await logActivity(
    order.user.email ?? "system",
    "sale",
    `order:${order.id}`,
    {
      orderNumber: order.orderNumber,
      total: Number(order.total),
      paymentId: result.paymentId,
    }
  );

  // Fatura URL'sini oluştur / e-fatura gönder (hata akışı bloklamaz)
  try {
    const invoiceResult = await createInvoice(
      {
        invoiceNumber: updated.invoiceNumber ?? `TEMP-${updated.orderNumber}`,
        orderId: updated.id,
        orderNumber: updated.orderNumber,
        issuedAt: new Date(),
        customer: {
          name: updated.invoiceFullName ?? updated.shippingName ?? updated.user.name ?? "—",
          email: updated.user.email,
          phone: updated.shippingPhone ?? updated.user.phone ?? null,
          address: updated.invoiceAddress ?? updated.shippingAddress ?? null,
          city: updated.shippingCity ?? null,
          tcNo: updated.invoiceTcNo ?? null,
        },
        lines: updated.items.map((it) => ({
          name: it.name,
          sku: it.sku,
          quantity: it.quantity,
          unitPrice: Number(it.price) / 1.2, // KDV hariç
          vatRate: 20,
        })),
        subtotal: Number(updated.subtotal),
        shippingFee: Number(updated.shippingFee),
        discountAmount: updated.discountAmount ? Number(updated.discountAmount) : undefined,
        total: Number(updated.total),
        currency: "TRY",
      },
      updated.id
    );
    if (invoiceResult.ok) {
      await prisma.order.update({
        where: { id: updated.id },
        data: { invoicePdfUrl: invoiceResult.pdfUrl },
      });
    }
  } catch (e) {
    console.error("[Invoice] hata:", e);
  }

  return { ok: true, orderId: order.id, orderNumber: order.orderNumber };
}
