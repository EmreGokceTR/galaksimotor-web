import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClearCartOnMount } from "./ClearCartOnMount";

const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

const deliveryLabel: Record<string, string> = {
  CARGO: "Kargo ile",
  PICKUP: "Mağazadan teslim",
};

export default async function OrderSuccessPage({
  params,
}: {
  params: { orderId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/giris");

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { items: true },
  });
  if (!order) notFound();
  if (order.userId !== session.user.id) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ClearCartOnMount />

      {/* Success header */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 via-white/[0.02] to-emerald-500/5 p-10 text-center backdrop-blur-md">
        <span className="pointer-events-none absolute inset-0 -z-10 opacity-50" style={{
          backgroundImage:
            "radial-gradient(50% 60% at 50% 0%, rgba(16,185,129,0.18) 0%, transparent 70%)",
        }} />
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 ring-2 ring-emerald-400/40 shadow-[0_0_40px_-4px_rgba(16,185,129,0.5)]">
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-emerald-300" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="m4 12 5 5 11-13" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Siparişin alındı!
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Sipariş numaran:{" "}
          <span className="font-semibold text-brand-yellow">
            #{order.orderNumber}
          </span>
        </p>
        <p className="mt-1 text-xs text-white/45">
          Hazırlandığında SMS ile bilgilendireceğiz.
        </p>
      </div>

      {/* Details */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-md">
        <div className="grid grid-cols-2 gap-4 border-b border-white/10 p-6 sm:grid-cols-4">
          <Stat label="Tutar" value={fmt(Number(order.total))} highlight />
          <Stat label="Ürün" value={`${order.items.length} kalem`} />
          <Stat label="Teslimat" value={deliveryLabel[order.deliveryType]} />
          <Stat
            label="Tarih"
            value={order.createdAt.toLocaleDateString("tr-TR")}
          />
        </div>

        <ul className="divide-y divide-white/5">
          {order.items.map((it) => (
            <li
              key={it.id}
              className="flex items-center justify-between gap-3 px-6 py-4"
            >
              <div className="min-w-0">
                <div className="line-clamp-1 text-sm font-medium text-white">
                  {it.name}
                </div>
                <div className="text-xs text-white/40">SKU · {it.sku}</div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-white/55">×{it.quantity}</span>
                <span className="font-semibold text-white">
                  {fmt(Number(it.price) * it.quantity)}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <div className="space-y-1.5 border-t border-white/10 p-6 text-sm">
          <Row label="Ara toplam" value={fmt(Number(order.subtotal))} />
          <Row
            label="Kargo"
            value={
              Number(order.shippingFee) === 0
                ? "Ücretsiz"
                : fmt(Number(order.shippingFee))
            }
          />
          <div className="my-2 h-px bg-white/10" />
          <div className="flex items-end justify-between">
            <span className="text-sm text-white/60">Toplam</span>
            <span className="text-2xl font-bold text-gradient-gold">
              {fmt(Number(order.total))}
            </span>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {order.invoicePdfUrl && (
          <a
            href={order.invoicePdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-6 py-3 text-sm font-medium text-emerald-200 hover:bg-emerald-500/15"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v8M4 8l4 4 4-4M3 14h10" />
            </svg>
            Faturayı İndir
          </a>
        )}
        <Link
          href="/hesabim/siparislerim"
          className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:border-brand-yellow/50 hover:text-brand-yellow"
        >
          Siparişlerim
        </Link>
        <Link
          href="/urunler"
          className="group inline-flex items-center gap-2 rounded-full bg-brand-yellow px-6 py-3 text-sm font-semibold text-brand-black shadow-[0_18px_40px_-12px_rgba(255,215,0,0.7)]"
        >
          Alışverişe Devam Et
          <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-white/40">
        {label}
      </div>
      <div
        className={`mt-0.5 text-base font-semibold ${
          highlight ? "text-gradient-gold" : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/55">{label}</span>
      <span className="text-white/90">{value}</span>
    </div>
  );
}
