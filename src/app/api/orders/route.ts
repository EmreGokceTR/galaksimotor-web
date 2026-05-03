import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DeliveryType } from "@prisma/client";
import { computeShipping } from "@/config/site";
import { sendOrderConfirmation } from "@/lib/mail";

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
  if (
    body.deliveryType === "CARGO" &&
    (!body.shipping.address || !body.shipping.city)
  ) {
    return NextResponse.json(
      { error: "Kargo için adres ve şehir zorunlu." },
      { status: 400 }
    );
  }

  // Fetch fresh products from DB to get authoritative prices + stock
  const productIds = Array.from(new Set(body.items.map((i) => i.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Validate each line
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
  const shippingFee =
    body.deliveryType === "CARGO" ? computeShipping(subtotal).fee : 0;
  const total = subtotal + shippingFee;

  // Create order + items + decrement stock atomically
  const order = await prisma.$transaction(async (tx) => {
    // Decrement stock with a per-row check (race-safe)
    for (const line of resolved) {
      const updated = await tx.product.updateMany({
        where: { id: line.productId, stock: { gte: line.quantity } },
        data: { stock: { decrement: line.quantity } },
      });
      if (updated.count === 0) {
        throw new Error(`${line.name} stoğu güncellenemedi.`);
      }
    }

    return tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user!.id,
        deliveryType:
          body.deliveryType === "PICKUP" ? DeliveryType.PICKUP : DeliveryType.CARGO,
        subtotal,
        shippingFee,
        total,
        shippingName: body.shipping.name,
        shippingPhone: body.shipping.phone,
        shippingAddress: body.shipping.address ?? null,
        shippingCity: body.shipping.city ?? null,
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

  // Onay e-postası (stub — şu an konsola log)
  void sendOrderConfirmation({
    to: session.user.email ?? "",
    orderNumber: order.orderNumber,
    customerName: body.shipping.name,
    total,
    itemCount: resolved.length,
  });

  return NextResponse.json(order, { status: 201 });
}
