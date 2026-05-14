import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DeliveryType } from "@prisma/client";
import { getShippingConfig, computeShippingFromConfig } from "@/lib/shipping";
import { logActivity } from "@/lib/activity-log";
import { notifyLowStockIfCrossed } from "@/lib/stock";
import { validateCoupon } from "@/lib/coupon";
import { sendEmail } from "@/lib/mail";
import { orderConfirmationTemplate } from "@/lib/email-templates";

type IncomingItem = {
  productId: string;
  variantId?: string | null;
  quantity: number;
};

type IncomingBody = {
  items: IncomingItem[];
  deliveryType: "CARGO" | "PICKUP";
  shipping: {
    name: string;
    phone: string;
    address?: string;
    city?: string;
  };
  invoice?: {
    fullName?: string;
    tcNo?: string;
    address?: string;
  };
  couponCode?: string;
  legalAccepted?: boolean;
};

function generateOrderNumber() {
  const now = new Date();
  const stamp =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `GM-${stamp}-${rand}`;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Önce giriş yapmalısın." },
      { status: 401 }
    );
  }

  let body: IncomingBody;
  try {
    body = (await req.json()) as IncomingBody;
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  if (!body.items || body.items.length === 0) {
    return NextResponse.json({ error: "Sepet boş." }, { status: 400 });
  }
  if (!body.shipping?.name || !body.shipping?.phone) {
    return NextResponse.json(
      { error: "İsim ve telefon zorunlu." },
      { status: 400 }
    );
  }
  if (!body.legalAccepted) {
    return NextResponse.json(
      {
        error:
          "Mesafeli Satış Sözleşmesi ve İptal/İade Koşulları onaylanmadan sipariş oluşturulamaz.",
      },
      { status: 400 }
    );
  }
  if (
    body.deliveryType === "CARGO" &&
    (!body.shipping.address || !body.shipping.city)
  ) {
    return NextResponse.json(
      { error: "Kargo için adres ve şehir zorunlu." },
      { status: 400 }
    );
  }

  // TCKN doğrulama (opsiyonel ama doluysa 11 hane olmalı)
  if (body.invoice?.tcNo && !/^\d{11}$/.test(body.invoice.tcNo.trim())) {
    return NextResponse.json(
      { error: "TC Kimlik Numarası 11 haneli olmalı." },
      { status: 400 }
    );
  }

  // Authoritative product lookup
  const productIds = Array.from(new Set(body.items.map((i) => i.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  type ResolvedLine = {
    productId: string;
    variantId: string | null;
    name: string;
    sku: string;
    quantity: number;
    price: number;
  };

  const resolved: ResolvedLine[] = [];
  for (const it of body.items) {
    const p = productMap.get(it.productId);
    if (!p) {
      return NextResponse.json(
        { error: `Ürün bulunamadı veya pasif.` },
        { status: 400 }
      );
    }
    if (it.quantity < 1) {
      return NextResponse.json(
        { error: `Geçersiz adet: ${p.name}` },
        { status: 400 }
      );
    }
    if (p.stock < it.quantity) {
      return NextResponse.json(
        { error: `${p.name} için yeterli stok yok (mevcut: ${p.stock}).` },
        { status: 400 }
      );
    }

    let lineSku = p.sku;
    let linePrice = Number(p.price);
    if (it.variantId) {
      const v = await prisma.productVariant.findUnique({
        where: { id: it.variantId },
      });
      if (!v || v.productId !== p.id) {
        return NextResponse.json(
          { error: `Geçersiz varyant: ${p.name}` },
          { status: 400 }
        );
      }
      if (v.sku) lineSku = v.sku;
      if (v.price !== null) linePrice = Number(v.price);
    }

    resolved.push({
      productId: p.id,
      variantId: it.variantId ?? null,
      name: p.name,
      sku: lineSku,
      quantity: it.quantity,
      price: linePrice,
    });
  }

  const subtotal = resolved.reduce((s, l) => s + l.price * l.quantity, 0);
  const shippingCfg = await getShippingConfig();
  const shippingInfo = computeShippingFromConfig(subtotal, shippingCfg);
  const shippingFee = body.deliveryType === "CARGO" ? shippingInfo.fee : 0;

  // Kupon uygula (varsa)
  let appliedCouponCode: string | null = null;
  let discountAmount = 0;
  if (body.couponCode?.trim()) {
    const v = await validateCoupon(body.couponCode, subtotal);
    if (!v.ok) {
      return NextResponse.json({ error: v.error }, { status: 400 });
    }
    appliedCouponCode = v.coupon.code;
    discountAmount = v.discount;
  }

  const total = subtotal + shippingFee - discountAmount;

  // Atomic order create + stock decrement
  const order = await prisma.$transaction(async (tx) => {
    for (const line of resolved) {
      const updated = await tx.product.updateMany({
        where: { id: line.productId, stock: { gte: line.quantity } },
        data: { stock: { decrement: line.quantity } },
      });
      if (updated.count === 0) {
        throw new Error(`${line.name} stoğu güncellenemedi.`);
      }
    }

    // ── Ardışık fatura numarası (2026/001) ──
    const year = new Date().getFullYear();
    const counter = await tx.invoiceCounter.upsert({
      where: { year },
      update: { lastSeq: { increment: 1 } },
      create: { year, lastSeq: 1 },
    });
    const invoiceNumber = `${year}/${String(counter.lastSeq).padStart(3, "0")}`;

    return tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        invoiceNumber,
        userId: session.user!.id,
        deliveryType:
          body.deliveryType === "PICKUP"
            ? DeliveryType.PICKUP
            : DeliveryType.CARGO,
        subtotal,
        shippingFee,
        total,
        shippingName: body.shipping.name,
        shippingPhone: body.shipping.phone,
        shippingAddress: body.shipping.address ?? null,
        shippingCity: body.shipping.city ?? null,
        invoiceTcNo: body.invoice?.tcNo?.trim() || null,
        invoiceFullName:
          body.invoice?.fullName?.trim() || body.shipping.name,
        invoiceAddress:
          body.invoice?.address?.trim() || body.shipping.address || null,
        couponCode: appliedCouponCode,
        discountAmount: discountAmount > 0 ? discountAmount : null,
        items: {
          create: resolved.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            name: l.name,
            sku: l.sku,
            quantity: l.quantity,
            price: l.price,
          })),
        },
      },
      select: { id: true, orderNumber: true },
    });
  });

  await logActivity(
    session.user.email ?? "system",
    "order_create",
    `order:${order.id}`,
    {
      orderNumber: order.orderNumber,
      total,
      itemCount: resolved.length,
      coupon: appliedCouponCode,
    }
  );

  // Kupon kullanım sayacını arttır
  if (appliedCouponCode) {
    prisma.coupon
      .update({
        where: { code: appliedCouponCode },
        data: { timesUsed: { increment: 1 } },
      })
      .catch(console.error);
  }

  // Stok eşiği altına düşen ürünler için admin'e bildirim
  notifyLowStockIfCrossed(resolved.map((l) => l.productId)).catch(
    console.error
  );

  // ── Müşteriye sipariş onay e-postası ────────────────────────────────────
  if (session.user.email) {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ??
      new URL(req.url).origin;
    const tpl = orderConfirmationTemplate({
      customerName: body.shipping.name,
      orderNumber: order.orderNumber,
      items: resolved.map((r) => ({
        name: r.name,
        quantity: r.quantity,
        price: r.price,
      })),
      subtotal,
      shippingFee,
      discount: discountAmount > 0 ? discountAmount : undefined,
      total,
      trackOrderUrl: `${siteUrl}/odeme/basari/${order.id}`,
    });
    sendEmail({
      to: session.user.email,
      subject: tpl.subject,
      html: tpl.html,
      category: "order_confirmation",
      actor: session.user.email,
    }).catch(console.error);
  }

  return NextResponse.json(order, { status: 201 });
}
