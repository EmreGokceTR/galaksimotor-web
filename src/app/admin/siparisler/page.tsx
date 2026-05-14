import { prisma } from "@/lib/prisma";
import { OrdersClient, type OrderRow } from "./OrdersClient";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: { select: { id: true } },
    },
  });

  // Decimal ve Date tiplerini client component'e geçirmeden önce serialize et
  const serialized: OrderRow[] = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    paymentStatus: o.paymentStatus,
    total: o.total.toString(),
    discountAmount: o.discountAmount?.toString() ?? null,
    couponCode: o.couponCode ?? null,
    deliveryType: o.deliveryType,
    trackingNumber: o.trackingNumber ?? null,
    invoicePdfUrl: o.invoicePdfUrl ?? null,
    iyzicoPaymentId: o.iyzicoPaymentId ?? null,
    createdAt: o.createdAt.toISOString(),
    shippingPhone: o.shippingPhone ?? null,
    user: {
      name: o.user.name ?? null,
      email: o.user.email,
      phone: o.user.phone ?? null,
    },
    items: o.items,
  }));

  return (
    <div>
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Siparişler</h2>
          <p className="text-sm text-white/50">
            Toplam {orders.length} sipariş
          </p>
        </div>
      </header>
      <OrdersClient orders={serialized} />
    </div>
  );
}
