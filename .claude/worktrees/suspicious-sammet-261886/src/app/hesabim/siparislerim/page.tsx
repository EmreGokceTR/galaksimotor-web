import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { getSettings, st } from "@/lib/site-settings";
import { renderTemplate } from "@/lib/mail";

const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

const STATUS: Record<OrderStatus, { label: string; cls: string }> = {
  PENDING: {
    label: "Beklemede",
    cls: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  },
  PREPARING: {
    label: "Hazırlanıyor",
    cls: "border-blue-400/30 bg-blue-500/10 text-blue-200",
  },
  SHIPPED: {
    label: "Kargoda",
    cls: "border-violet-400/30 bg-violet-500/10 text-violet-200",
  },
  DELIVERED: {
    label: "Teslim Edildi",
    cls: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  },
  CANCELLED: {
    label: "İptal",
    cls: "border-rose-400/30 bg-rose-500/10 text-rose-200",
  },
};

const PAYMENT: Record<PaymentStatus, { label: string; cls: string }> = {
  PENDING: { label: "Ödeme bekleniyor", cls: "text-amber-300" },
  PAID: { label: "Ödendi", cls: "text-emerald-300" },
  FAILED: { label: "Başarısız", cls: "text-rose-300" },
  REFUNDED: { label: "İade edildi", cls: "text-violet-300" },
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
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-white/55 backdrop-blur-md">
        Henüz siparişin yok.{" "}
        <Link
          href="/urunler"
          className="ml-1 text-brand-yellow hover:underline"
        >
          Alışverişe başla →
        </Link>
      </div>
    );
  }

  const trackingTplBag = await getSettings(["cargo_tracking_url_template"]);
  const trackingTpl = st(
    trackingTplBag,
    "cargo_tracking_url_template",
    "https://www.google.com/search?q=kargo+takip+{{trackingNumber}}"
  );

  return (
    <div className="space-y-4">
      {orders.map((o) => {
        const status = STATUS[o.status];
        const pay = PAYMENT[o.paymentStatus];
        const trackingUrl = o.trackingNumber
          ? renderTemplate(trackingTpl, { trackingNumber: o.trackingNumber })
          : null;

        return (
          <div
            key={o.id}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-md transition hover:border-white/20"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.02] p-4">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-brand-yellow">
                  #{o.orderNumber}
                </div>
                <div className="text-[11px] text-white/45">
                  {o.createdAt.toLocaleDateString("tr-TR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  · {o.items.length} kalem
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${pay.cls}`}>
                  {pay.label}
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-[11px] font-medium ${status.cls}`}
                >
                  {status.label}
                </span>
              </div>
            </div>

            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/40">
                  Toplam
                </p>
                <p className="mt-0.5 text-xl font-bold text-gradient-gold">
                  {fmt(Number(o.total))}
                </p>
                {o.discountAmount && (
                  <p className="text-[11px] text-emerald-300">
                    Kupon: {o.couponCode} · -{fmt(Number(o.discountAmount))}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/40">
                  Teslimat
                </p>
                <p className="mt-0.5 text-sm text-white">
                  {o.deliveryType === "CARGO"
                    ? o.shippingCity ?? "Kargo"
                    : "Mağazadan teslim"}
                </p>
              </div>
            </div>

            {/* Kargo takibi */}
            {o.deliveryType === "CARGO" && o.trackingNumber && (
              <div className="border-t border-white/5 bg-violet-500/[0.04] px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-violet-200/70">
                      Kargo Takip
                    </p>
                    <p className="text-sm font-semibold text-white">
                      {o.trackingNumber}
                    </p>
                  </div>
                  {trackingUrl && (
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-100 hover:bg-violet-500/15"
                    >
                      Kargomu Takip Et
                      <svg
                        viewBox="0 0 16 16"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.4}
                        strokeLinecap="round"
                      >
                        <path d="M3 8h10M9 4l4 4-4 4" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Aksiyonlar */}
            <div className="flex flex-wrap items-center gap-2 border-t border-white/5 px-4 py-3">
              {o.invoicePdfUrl && (
                <a
                  href={o.invoicePdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200 hover:bg-emerald-500/15"
                >
                  📄 Faturayı İndir
                </a>
              )}
              <Link
                href={`/odeme/basari/${o.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10"
              >
                Detayı Gör
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
