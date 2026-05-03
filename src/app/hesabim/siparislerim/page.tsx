import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

const orderStatusLabel: Record<OrderStatus, string> = {
  PENDING: "Beklemede",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal",
};

export default async function MyOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  if (orders.length === 0) {
    return <p className="text-white/60">Henüz siparişiniz yok.</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div
          key={o.id}
          className="flex items-center justify-between rounded border border-white/10 p-4"
        >
          <div>
            <div className="font-semibold text-brand-yellow">#{o.orderNumber}</div>
            <div className="text-sm text-white/60">
              {o.items.length} ürün • {o.createdAt.toLocaleDateString("tr-TR")}
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold">
              {Number(o.total).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
            </div>
            <div className="text-xs text-white/60">{orderStatusLabel[o.status]}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
