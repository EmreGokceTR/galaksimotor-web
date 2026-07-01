"use server";

import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getIyzico, isIyzicoConfigured } from "@/lib/iyzico";
import { logActivity } from "@/lib/activity-log";
import { createInvoice } from "@/lib/e-invoice";
import { sendEmail } from "@/lib/mail";
import {
  orderConfirmationTemplate,
  newOrderAdminAlertTemplate,
} from "@/lib/email-templates";

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

type OrderWithItems = {
  items: { id: string; name: string; price: unknown; quantity: number }[];
  subtotal: unknown;
  shippingFee: unknown;
  discountAmount: unknown;
};

/**
 * Iyzico basket item fiyat toplamı `price`/`paidPrice` alanına birebir eşit
 * olmalı (aksi halde istek reddedilir). İndirim kalemler arasında oransal
 * dağıtılır, yuvarlama farkı son kaleme eklenir, kargo ayrı kalem olarak
 * eklenir — böylece toplam her zaman order.total ile eşleşir.
 */
function buildBasketItems(order: OrderWithItems) {
  const subtotal = Number(order.subtotal);
  const shippingFee = Number(order.shippingFee);
  const discount = order.discountAmount ? Number(order.discountAmount) : 0;
  const discountRatio = subtotal > 0 ? discount / subtotal : 0;

  let allocated = 0;
  const items = order.items.map((it) => {
    const lineTotal = Number(it.price) * it.quantity;
    const discounted = Math.round((lineTotal - lineTotal * discountRatio) * 100) / 100;
    allocated += discounted;
    return {
      id: it.id,
      name: it.name.slice(0, 60),
      category1: "Motosiklet",
      itemType: "PHYSICAL" as "PHYSICAL" | "VIRTUAL",
      price: discounted,
    };
  });

  // Yuvarlama artığını son kaleme ekle — toplam kuruşuna kadar tutmalı
  const targetAfterDiscount = Math.round((subtotal - discount) * 100) / 100;
  const remainder = Math.round((targetAfterDiscount - allocated) * 100) / 100;
  if (remainder !== 0 && items.length > 0) {
    items[items.length - 1].price += remainder;
  }

  const basketItems = items.map((it) => ({ ...it, price: it.price.toFixed(2) }));
  if (shippingFee > 0) {
    basketItems.push({
      id: "shipping",
      name: "Kargo Ücreti",
      category1: "Kargo",
      itemType: "VIRTUAL" as const,
      price: shippingFee.toFixed(2),
    });
  }
  return basketItems;
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
    basketItems: buildBasketItems(order),
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

  // İdempotency — Iyzico callback'i (tarayıcı geri tuşu, ağ tekrar denemesi vb.
  // nedeniyle) aynı token için birden fazla tetiklenebilir. Zaten PAID ise
  // faturayı/e-postaları tekrar üretmeden mevcut sonucu döndür.
  if (order.paymentStatus === "PAID") {
    return { ok: true, orderId: order.id, orderNumber: order.orderNumber };
  }

  if (!result.paid) {
    // Aynı nedenle: zaten FAILED işaretliyse stoğu ikinci kez iade etme.
    if (order.paymentStatus !== "FAILED") {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: "FAILED" },
        }),
        ...order.items.map((it) =>
          prisma.product.update({
            where: { id: it.productId },
            data: { stock: { increment: it.quantity } },
          })
        ),
      ]);
    }
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
  let invoicePdfUrl: string | null = null;
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
      invoicePdfUrl = invoiceResult.pdfUrl;
      await prisma.order.update({
        where: { id: updated.id },
        data: { invoicePdfUrl: invoiceResult.pdfUrl },
      });
    }
  } catch (e) {
    console.error("[Invoice] hata:", e);
  }

  // ── E-posta bildirimleri (müşteri + admin) ──
  // Mail gönderim hatası ödeme akışını bloklamaz; sessizce loglanır.
  try {
    const siteUrl = getSiteUrl();
    const customerName =
      updated.invoiceFullName ??
      updated.shippingName ??
      updated.user.name ??
      "Değerli müşterimiz";
    const items = updated.items.map((it) => ({
      name: it.name,
      quantity: it.quantity,
      price: Number(it.price),
    }));

    // PDF faturayı email ekine indir (sadece varsa)
    let invoiceAttachment:
      | { filename: string; content: Buffer; contentType: string }[]
      | undefined;
    if (invoicePdfUrl) {
      try {
        const pdfResp = await fetch(invoicePdfUrl, {
          signal: AbortSignal.timeout(8000),
        });
        if (pdfResp.ok) {
          const buf = Buffer.from(await pdfResp.arrayBuffer());
          invoiceAttachment = [
            {
              filename: `Fatura-${updated.orderNumber}.pdf`,
              content: buf,
              contentType: "application/pdf",
            },
          ];
        }
      } catch (e) {
        console.warn("[mail] fatura PDF indirilemedi:", e);
      }
    }

    // 1) Müşteriye sipariş onay maili (PDF fatura ekli)
    if (updated.user.email) {
      const confirm = orderConfirmationTemplate({
        customerName,
        orderNumber: updated.orderNumber,
        items,
        subtotal: Number(updated.subtotal),
        shippingFee: Number(updated.shippingFee),
        discount: updated.discountAmount
          ? Number(updated.discountAmount)
          : undefined,
        total: Number(updated.total),
        trackOrderUrl: `${siteUrl}/hesabim/siparislerim`,
      });
      void sendEmail({
        to: updated.user.email,
        subject: confirm.subject,
        html: confirm.html,
        category: "order_confirmation",
        attachments: invoiceAttachment,
        actor: updated.user.email,
      });
    }

    // 2) Admin'e yeni sipariş bildirimi
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const alert = newOrderAdminAlertTemplate({
        orderNumber: updated.orderNumber,
        customerName,
        customerEmail: updated.user.email ?? "—",
        customerPhone: updated.shippingPhone,
        shippingAddress: updated.shippingAddress,
        shippingCity: updated.shippingCity,
        items,
        subtotal: Number(updated.subtotal),
        shippingFee: Number(updated.shippingFee),
        discount: updated.discountAmount
          ? Number(updated.discountAmount)
          : undefined,
        total: Number(updated.total),
        paymentId: result.paymentId,
        adminOrderUrl: `${siteUrl}/admin/siparisler`,
      });
      void sendEmail({
        to: adminEmail,
        subject: alert.subject,
        html: alert.html,
        category: "admin_new_order",
        actor: "system",
      });
    }
  } catch (e) {
    console.error("[Mail] sipariş onay e-postası hatası:", e);
  }

  return { ok: true, orderId: order.id, orderNumber: order.orderNumber };
}
