import { prisma } from "@/lib/prisma";
import { OrderStatusSelect } from "./OrderStatusSelect";

const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: true,
    },
  });

  return (
    <div>
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Siparişler</h2>
          <p className="text-sm text-white/50">
            Toplam {orders.length} sipariş listeleniyor
          </p>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-white/45">
          Henüz sipariş yok.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/[0.02] text-left text-[11px] uppercase tracking-wider text-white/45">
                <tr>
                  <th className="px-4 py-3">Sipariş</th>
                  <th className="px-4 py-3">Müşteri</th>
                  <th className="px-4 py-3">Tutar</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-brand-yellow">
                        #{o.orderNumber}
                      </div>
                      <div className="text-[11px] text-white/45">
                        {o.items.length} kalem · {o.deliveryType === "CARGO" ? "Kargo" : "Mağaza"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white">
                        {o.user.name ?? o.user.email}
                      </div>
                      <div className="text-[11px] text-white/45">
                        {o.shippingPhone ?? o.user.phone ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {fmt(Number(o.total))}
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      {o.createdAt.toLocaleString("tr-TR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusSelect orderId={o.id} status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
