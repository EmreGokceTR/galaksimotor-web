import { prisma } from "@/lib/prisma";
import { OrderStatusSelect } from "./OrderStatusSelect";
import { TrackingInput } from "./TrackingInput";

const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

const PAYMENT_BADGE: Record<string, string> = {
  PENDING: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  PAID: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  FAILED: "border-rose-400/30 bg-rose-500/10 text-rose-200",
  REFUNDED: "border-violet-400/30 bg-violet-500/10 text-violet-200",
};

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
                  <th className="px-4 py-3">Ödeme</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">Kargo No</th>
                  <th className="px-4 py-3">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 align-top">
                      <div className="font-semibold text-brand-yellow">
                        #{o.orderNumber}
                      </div>
                      <div className="text-[11px] text-white/45">
                        {o.items.length} kalem ·{" "}
                        {o.deliveryType === "CARGO" ? "Kargo" : "Mağaza"}
                      </div>
                      {o.invoicePdfUrl && (
                        <a
                          href={o.invoicePdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-300 hover:text-emerald-200"
                        >
                          📄 Fatura
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="text-white">
                        {o.user.name ?? o.user.email}
                      </div>
                      <div className="text-[11px] text-white/45">
                        {o.shippingPhone ?? o.user.phone ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top font-semibold text-white">
                      {fmt(Number(o.total))}
                      {o.discountAmount && (
                        <div className="text-[11px] text-emerald-300">
                          {o.couponCode} · -{fmt(Number(o.discountAmount))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
                          PAYMENT_BADGE[o.paymentStatus] ?? ""
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-white/60">
                      {o.createdAt.toLocaleString("tr-TR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {o.deliveryType === "CARGO" ? (
                        <TrackingInput
                          orderId={o.id}
                          initial={o.trackingNumber}
                        />
                      ) : (
                        <span className="text-[11px] text-white/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
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
