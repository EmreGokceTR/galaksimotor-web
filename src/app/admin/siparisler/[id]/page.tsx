import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { OrderStatusSelect } from "../OrderStatusSelect";
import { TrackingInput } from "../TrackingInput";
import { RefundButton } from "../RefundButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sipariş Detayı · Admin" };

const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

const PAYMENT_BADGE: Record<string, string> = {
  PENDING: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  PAID: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  FAILED: "border-rose-400/30 bg-rose-500/10 text-rose-200",
  REFUNDED: "border-violet-400/30 bg-violet-500/10 text-violet-200",
};
const PAYMENT_LABEL: Record<string, string> = {
  PENDING: "Bekliyor",
  PAID: "Ödendi",
  FAILED: "Başarısız",
  REFUNDED: "İade edildi",
};

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      user: { select: { name: true, email: true, phone: true } },
    },
  });
  if (!order) notFound();

  const phoneDigits = (order.shippingPhone ?? order.user.phone ?? "").replace(/\D/g, "").replace(/^0/, "90");

  return (
    <div className="space-y-6">
      <Link href="/admin/siparisler" className="text-xs text-white/50 hover:text-brand-yellow">
        ← Siparişler
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold text-brand-yellow">#{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-white/55">
            {order.createdAt.toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" })}
            {order.invoiceNumber && <> · Fatura: <span className="font-mono">{order.invoiceNumber}</span></>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${PAYMENT_BADGE[order.paymentStatus] ?? ""}`}>
            {PAYMENT_LABEL[order.paymentStatus] ?? order.paymentStatus}
          </span>
          <OrderStatusSelect
            orderId={order.id}
            status={order.status as Parameters<typeof OrderStatusSelect>[0]["status"]}
          />
        </div>
      </div>

      {/* Sipariş kalemleri */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 bg-white/[0.02] text-left text-[11px] uppercase tracking-wider text-white/45">
            <tr>
              <th className="px-4 py-3">Ürün</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3 text-center">Adet</th>
              <th className="px-4 py-3 text-right">Birim</th>
              <th className="px-4 py-3 text-right">Tutar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {order.items.map((it) => (
              <tr key={it.id}>
                <td className="px-4 py-3 text-white">{it.name}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-white/45">{it.sku}</td>
                <td className="px-4 py-3 text-center text-white/80">{it.quantity}</td>
                <td className="px-4 py-3 text-right text-white/80">{fmt(Number(it.price))}</td>
                <td className="px-4 py-3 text-right font-semibold text-white">
                  {fmt(Number(it.price) * it.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="space-y-1 border-t border-white/10 px-4 py-3 text-sm">
          <Row label="Ara Toplam" value={fmt(Number(order.subtotal))} />
          <Row label="Kargo" value={Number(order.shippingFee) === 0 ? "Ücretsiz" : fmt(Number(order.shippingFee))} />
          {order.discountAmount && (
            <Row label={`İndirim${order.couponCode ? ` (${order.couponCode})` : ""}`} value={`-${fmt(Number(order.discountAmount))}`} />
          )}
          <div className="flex items-center justify-between pt-2 text-base font-bold">
            <span className="text-white/70">Toplam</span>
            <span className="text-gradient-gold">{fmt(Number(order.total))}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Müşteri + teslimat */}
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            {order.deliveryType === "PICKUP" ? "Mağazadan Teslim" : "Kargo Teslimat"}
          </h3>
          <div className="space-y-1.5 text-sm">
            <Row label="Müşteri" value={order.user.name ?? order.user.email} />
            <Row label="E-posta" value={order.user.email} />
            <div className="flex items-center justify-between gap-2">
              <span className="text-white/45">Telefon</span>
              <span className="flex items-center gap-2">
                <span className="text-white/85">{order.shippingName ?? "—"}</span>
                {(order.shippingPhone ?? order.user.phone) && (
                  <>
                    <a href={`tel:${(order.shippingPhone ?? order.user.phone ?? "").replace(/\s/g, "")}`} className="text-brand-yellow hover:underline">
                      {order.shippingPhone ?? order.user.phone}
                    </a>
                    <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400/80 hover:text-emerald-300">WA</a>
                  </>
                )}
              </span>
            </div>
            {order.deliveryType === "CARGO" && (
              <>
                <div className="pt-2">
                  <div className="text-[11px] uppercase tracking-wider text-white/40">Teslimat Adresi</div>
                  <p className="mt-1 whitespace-pre-line text-white/85">
                    {order.shippingAddress ?? "—"}
                    {order.shippingCity ? `\n${order.shippingCity}` : ""}
                  </p>
                </div>
                <div className="pt-2">
                  <div className="mb-1 text-[11px] uppercase tracking-wider text-white/40">Kargo Takip No</div>
                  <TrackingInput orderId={order.id} initial={order.trackingNumber} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Fatura + ödeme */}
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Fatura & Ödeme</h3>
          <div className="space-y-1.5 text-sm">
            {order.invoiceFullName && <Row label="Fatura Adı" value={order.invoiceFullName} />}
            {order.invoiceTcNo && <Row label="T.C. No" value={order.invoiceTcNo} />}
            {order.invoiceAddress && (
              <div className="pt-1">
                <div className="text-[11px] uppercase tracking-wider text-white/40">Fatura Adresi</div>
                <p className="mt-1 whitespace-pre-line text-white/85">{order.invoiceAddress}</p>
              </div>
            )}
            <Row label="Ödeme Durumu" value={PAYMENT_LABEL[order.paymentStatus] ?? order.paymentStatus} />
            {order.iyzicoPaymentId && <Row label="İyzico Ödeme No" value={order.iyzicoPaymentId} />}
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
            {order.invoicePdfUrl && (
              <a href={order.invoicePdfUrl} target="_blank" rel="noreferrer"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-emerald-300 hover:text-emerald-200">
                📄 Faturayı Aç
              </a>
            )}
            {order.paymentStatus === "PAID" && order.iyzicoPaymentId && (
              <RefundButton orderId={order.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-white/45">{label}</span>
      <span className="text-right text-white/85">{value}</span>
    </div>
  );
}
