"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/stores/cart";
import type { ShippingConfig } from "@/lib/shipping";
import { computeShippingFromConfig } from "@/lib/shipping";
import { CouponInput } from "@/components/CouponInput";

const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

export function CartContent({ shipping }: { shipping: ShippingConfig }) {
  const items = useCart((s) => s.items);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);
  const setQty = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart((s) => s.subtotal());
  const hydrated = useCart((s) => s.hasHydrated);
  const appliedCoupon = useCart((s) => s.appliedCoupon);

  const shippingInfo = computeShippingFromConfig(subtotal, shipping);
  // Kupon indirimi sepet tutarını geçemez (subtotal'dan büyük olamaz)
  const discount = appliedCoupon
    ? Math.min(appliedCoupon.discount, subtotal)
    : 0;
  const total = Math.max(0, subtotal + shippingInfo.fee - discount);

  return (
    <>
      {!hydrated ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-12 text-center text-white/40 backdrop-blur-md">
          Yükleniyor...
        </div>
      ) : items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {items.map((it) => (
                <motion.li
                  key={it.key}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-[100px_1fr_auto] items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-4 backdrop-blur-md"
                >
                  <Link
                    href={`/urun/${it.slug}`}
                    className="relative h-24 w-24 overflow-hidden rounded-xl bg-black/30"
                  >
                    {it.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.image}
                        alt={it.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/30">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-8 w-8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.4}
                        >
                          <rect x="3" y="5" width="18" height="14" rx="2" />
                          <path d="m3 17 6-6 5 5 3-3 4 4" />
                        </svg>
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0">
                    <Link
                      href={`/urun/${it.slug}`}
                      className="line-clamp-2 text-base font-semibold text-white hover:text-brand-yellow"
                    >
                      {it.name}
                    </Link>
                    {it.variantLabel && (
                      <p className="mt-0.5 text-xs text-white/50">
                        {it.variantLabel}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-white/30">
                      SKU · {it.sku}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-white/15 bg-white/5">
                        <button
                          onClick={() => dec(it.key)}
                          className="flex h-8 w-8 items-center justify-center text-white/70 hover:text-brand-yellow"
                          aria-label="Azalt"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={it.stockCap}
                          value={it.quantity}
                          onChange={(e) =>
                            setQty(
                              it.key,
                              parseInt(e.target.value || "1", 10)
                            )
                          }
                          className="w-10 bg-transparent text-center text-sm font-semibold outline-none"
                        />
                        <button
                          onClick={() => inc(it.key)}
                          disabled={it.quantity >= it.stockCap}
                          className="flex h-8 w-8 items-center justify-center text-white/70 hover:text-brand-yellow disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Arttır"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => remove(it.key)}
                        className="text-xs text-white/40 hover:text-rose-300"
                      >
                        Kaldır
                      </button>
                      {it.quantity >= it.stockCap && (
                        <span className="text-[11px] text-amber-300/80">
                          stok sınırı: {it.stockCap}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-gradient-gold">
                      {fmt(it.price * it.quantity)}
                    </div>
                    <div className="text-xs text-white/40">
                      {fmt(it.price)} × {it.quantity}
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-2 text-sm">
              <button
                onClick={() => {
                  if (confirm("Sepeti tamamen temizlemek istiyor musun?"))
                    clear();
                }}
                className="text-white/50 hover:text-rose-300"
              >
                Sepeti temizle
              </button>
              <Link
                href="/urunler"
                className="text-white/60 hover:text-brand-yellow"
              >
                ← Alışverişe devam et
              </Link>
            </div>
          </ul>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
              <div className="border-b border-white/10 bg-gradient-to-br from-brand-yellow/10 via-transparent to-brand-yellow/5 p-5">
                <h2 className="text-base font-semibold text-white">
                  Sipariş Özeti
                </h2>
                <p className="mt-1 text-xs text-white/50">
                  Tahmini teslim: {shipping.estimatedDays} iş günü
                </p>
              </div>
              <div className="space-y-3 p-5">
                <CouponInput />
                <div className="my-2 h-px bg-white/10" />
                <Row label="Ara toplam" value={fmt(subtotal)} />
                <Row
                  label="Kargo"
                  value={
                    shippingInfo.free ? (
                      <span className="text-emerald-300">Ücretsiz</span>
                    ) : (
                      fmt(shippingInfo.fee)
                    )
                  }
                />
                {discount > 0 && (
                  <Row
                    label={`Kupon (${appliedCoupon?.code})`}
                    value={
                      <span className="text-emerald-300">
                        -{fmt(discount)}
                      </span>
                    }
                  />
                )}
                {!shippingInfo.free && shippingInfo.remainingForFree > 0 && (
                  <p className="text-[11px] text-white/40">
                    {fmt(shippingInfo.remainingForFree)} daha eklersen kargo
                    bedava!
                  </p>
                )}
                <div className="my-2 h-px bg-white/10" />
                <div className="flex items-end justify-between">
                  <span className="text-sm text-white/60">Toplam</span>
                  <span className="text-2xl font-bold text-gradient-gold">
                    {fmt(total)}
                  </span>
                </div>
                <Link
                  href="/odeme"
                  className="group mt-4 flex items-center justify-center gap-2 rounded-full bg-brand-yellow py-3.5 text-sm font-semibold text-brand-black shadow-[0_18px_40px_-12px_rgba(255,215,0,0.7)] transition hover:shadow-[0_24px_50px_-10px_rgba(255,215,0,0.9)]"
                >
                  Ödemeye Geç
                  <svg
                    viewBox="0 0 16 16"
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] p-3 text-xs text-white/55 backdrop-blur-md">
              <span className="text-brand-yellow">🔒</span>
              Ödeme sayfası SSL ile şifrelenmiştir.
            </div>
          </aside>
        </div>
      )}
    </>
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

function EmptyCart() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-white/10 bg-white/[0.025] p-12 text-center backdrop-blur-md">
      <div className="relative">
        <div className="absolute inset-0 -z-10 rounded-full bg-brand-yellow/15 blur-2xl" />
        <span className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-brand-yellow">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.4}
            className="h-10 w-10"
          >
            <path d="M5 7h14l-1.6 10.2a2 2 0 0 1-2 1.8H8.6a2 2 0 0 1-2-1.8L5 7Z" />
            <path d="M9 7V5a3 3 0 0 1 6 0v2" />
          </svg>
        </span>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-white">Sepetin boş</h3>
      <p className="mt-1 text-sm text-white/55">
        Ürünleri keşfetmeye başla — birkaç tık ötede.
      </p>
      <Link
        href="/urunler"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-yellow px-6 py-2.5 text-sm font-semibold text-brand-black"
      >
        Ürünleri Keşfet
        <svg
          viewBox="0 0 16 16"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
        >
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </Link>
    </div>
  );
}

export function CartHeader() {
  const items = useCart((s) => s.items);
  const total = items.reduce((a, i) => a + i.quantity, 0);
  return (
    <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
      {items.length === 0 ? "Sepetin boş" : `${total} ürün hazır`}
    </h1>
  );
}
