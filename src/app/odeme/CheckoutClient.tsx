"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/stores/cart";
import { FreeShippingBar } from "@/components/FreeShippingBar";
import type { ShippingConfig } from "@/lib/shipping";
import { computeShippingFromConfig } from "@/lib/shipping";
import { initPaymentForOrder } from "@/app/_actions/payment";

const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

function validateTCKN(value: string): boolean {
  if (!/^\d{11}$/.test(value) || value[0] === "0") return false;
  const d = value.split("").map(Number);
  const sumOdd = d[0] + d[2] + d[4] + d[6] + d[8];
  const sumEven = d[1] + d[3] + d[5] + d[7];
  const d10 = ((sumOdd * 7) - sumEven) % 10;
  if (d10 < 0 || d[9] !== d10) return false;
  const d11 = d.slice(0, 10).reduce((a, b) => a + b, 0) % 10;
  return d[10] === d11;
}

type Delivery = "CARGO" | "PICKUP";
type PayMethod = "ONLINE" | "DOOR";

export function CheckoutClient({
  defaultName,
  shipping,
  iyzicoEnabled,
}: {
  defaultName: string;
  defaultEmail: string;
  shipping: ShippingConfig;
  iyzicoEnabled: boolean;
}) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const hydrated = useCart((s) => s.hasHydrated);
  const appliedCoupon = useCart((s) => s.appliedCoupon);

  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [delivery, setDelivery] = useState<Delivery>("CARGO");

  // Fatura
  const [invoiceFullName, setInvoiceFullName] = useState("");
  const [invoiceTcNo, setInvoiceTcNo] = useState("");
  const [invoiceAddress, setInvoiceAddress] = useState("");
  const [sameAsShipping, setSameAsShipping] = useState(true);

  const [payMethod, setPayMethod] = useState<PayMethod>(
    iyzicoEnabled ? "ONLINE" : "DOOR"
  );
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const shippingInfo = computeShippingFromConfig(subtotal, shipping);
  const shippingFee = delivery === "CARGO" ? shippingInfo.fee : 0;
  const discount = appliedCoupon
    ? Math.min(appliedCoupon.discount, subtotal)
    : 0;
  const total = Math.max(0, subtotal + shippingFee - discount);

  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace("/sepet");
    }
  }, [hydrated, items.length, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!agreedTerms) {
      setError(
        "Lütfen Mesafeli Satış Sözleşmesi ve İptal Koşullarını onaylayın."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          deliveryType: delivery,
          shipping: { name, phone, address, city },
          invoice: {
            fullName: sameAsShipping ? name : invoiceFullName,
            tcNo: invoiceTcNo,
            address: sameAsShipping ? address : invoiceAddress,
          },
          couponCode: appliedCoupon?.code,
          legalAccepted: agreedTerms,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Sipariş oluşturulamadı.");
        setSubmitting(false);
        return;
      }

      // Online ödeme: Iyzico Checkout Form'a yönlendir
      if (payMethod === "ONLINE" && iyzicoEnabled) {
        startTransition(async () => {
          const init = await initPaymentForOrder(data.id);
          if (!init.ok) {
            setError(init.error);
            setSubmitting(false);
            return;
          }
          window.location.href = init.paymentPageUrl;
        });
        return;
      }

      // Kapıda ödeme: doğrudan başarı sayfası
      router.push(`/odeme/basari/${data.id}`);
    } catch {
      setError("Beklenmeyen bir hata oluştu.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <header className="mb-10">
        <Link
          href="/sepet"
          className="text-xs text-white/50 hover:text-brand-yellow"
        >
          ← Sepete dön
        </Link>
        <span className="mt-3 block text-xs font-medium uppercase tracking-[0.25em] text-brand-yellow/80">
          · Ödeme
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
          Sipariş <span className="text-gradient-gold">tamamlanıyor</span>
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]"
      >
        <div className="space-y-6">
          {/* Teslimat */}
          <Section title="Teslimat Yöntemi" icon="🚚">
            <div className="grid gap-3 sm:grid-cols-2">
              <DeliveryOption
                active={delivery === "CARGO"}
                onClick={() => setDelivery("CARGO")}
                title="Kargo"
                desc={`Adresine teslim · ${shipping.estimatedDays} iş günü`}
                fee={shippingInfo.free ? "Ücretsiz" : fmt(shipping.fee)}
              />
              <DeliveryOption
                active={delivery === "PICKUP"}
                onClick={() => setDelivery("PICKUP")}
                title="Mağazadan Teslim"
                desc="İnönü Mah., Küçükçekmece"
                fee="Ücretsiz"
              />
            </div>
          </Section>

          {/* İletişim */}
          <Section title="İletişim" icon="✉">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Ad Soyad"
                value={name}
                onChange={setName}
                required
                autoComplete="name"
              />
              <Field
                label="Telefon"
                value={phone}
                onChange={setPhone}
                required
                autoComplete="tel"
                placeholder="05XX XXX XX XX"
              />
            </div>
          </Section>

          {/* Adres */}
          <AnimatePresence initial={false}>
            {delivery === "CARGO" && (
              <motion.div
                key="addr"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <Section title="Teslimat Adresi" icon="📍">
                  <div className="grid gap-3">
                    <Field
                      label="Açık Adres"
                      value={address}
                      onChange={setAddress}
                      required
                      placeholder="Mah., sokak, bina no, daire"
                      textarea
                    />
                    <Field
                      label="Şehir"
                      value={city}
                      onChange={setCity}
                      required
                      placeholder="İstanbul"
                    />
                  </div>
                </Section>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fatura */}
          <Section title="Fatura Bilgileri" icon="🧾">
            <div className="grid gap-3">
              <Field
                label="TC Kimlik No (fatura için)"
                value={invoiceTcNo}
                onChange={(v) => setInvoiceTcNo(v.replace(/\D/g, "").slice(0, 11))}
                placeholder="11 hane"
                autoComplete="off"
                error={invoiceTcNo.length === 11 && !validateTCKN(invoiceTcNo) ? "Geçersiz TC Kimlik No" : undefined}
              />
              <label className="flex items-center gap-2 text-xs text-white/65">
                <input
                  type="checkbox"
                  className="accent-brand-yellow"
                  checked={sameAsShipping}
                  onChange={(e) => setSameAsShipping(e.target.checked)}
                />
                Fatura adresi teslimat adresi ile aynı
              </label>
              <AnimatePresence initial={false}>
                {!sameAsShipping && (
                  <motion.div
                    key="inv"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid gap-3 overflow-hidden"
                  >
                    <Field
                      label="Fatura Adı"
                      value={invoiceFullName}
                      onChange={setInvoiceFullName}
                      placeholder="Şirket veya kişi adı"
                    />
                    <Field
                      label="Fatura Adresi"
                      value={invoiceAddress}
                      onChange={setInvoiceAddress}
                      textarea
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Section>

          {/* Ödeme yöntemi */}
          <Section title="Ödeme" icon="💳">
            <div className="grid gap-3 sm:grid-cols-2">
              <DeliveryOption
                active={payMethod === "ONLINE"}
                onClick={() => iyzicoEnabled && setPayMethod("ONLINE")}
                title="Online (Iyzico)"
                desc={
                  iyzicoEnabled
                    ? "Kredi/Banka kartı · 3D Secure"
                    : "Yapılandırma bekleniyor"
                }
                fee={iyzicoEnabled ? "Hemen ödeme" : "—"}
              />
              <DeliveryOption
                active={payMethod === "DOOR"}
                onClick={() => setPayMethod("DOOR")}
                title="Kapıda Ödeme"
                desc="Teslimat sırasında nakit/kart"
                fee="Tahsilat anında"
              />
            </div>
          </Section>
        </div>

        {/* Özet */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
            <div className="border-b border-white/10 bg-gradient-to-br from-brand-yellow/10 via-transparent to-brand-yellow/5 p-5">
              <h2 className="text-base font-semibold text-white">
                Sipariş Özeti
              </h2>
              <p className="mt-1 text-xs text-white/50">
                {items.length} farklı ürün ·{" "}
                {items.reduce((a, i) => a + i.quantity, 0)} adet
              </p>
            </div>

            <ul className="max-h-72 overflow-y-auto border-b border-white/10 px-5 py-4">
              {items.map((it) => (
                <li
                  key={it.key}
                  className="flex items-center gap-3 py-2.5 text-sm"
                >
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/30">
                    {it.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.image}
                        alt={it.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-yellow text-[10px] font-bold text-brand-black">
                      {it.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 text-white/85">{it.name}</div>
                    {it.variantLabel && (
                      <div className="text-[11px] text-white/45">
                        {it.variantLabel}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-white/85">
                    {fmt(it.price * it.quantity)}
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-2 p-5">
              {!shippingInfo.free && delivery === "CARGO" && (
                <div className="mb-2">
                  <FreeShippingBar subtotal={subtotal} />
                </div>
              )}
              <Row label="Ara toplam" value={fmt(subtotal)} />
              <Row
                label="Kargo"
                value={shippingFee === 0 ? "Ücretsiz" : fmt(shippingFee)}
              />
              {discount > 0 && (
                <Row
                  label={`Kupon (${appliedCoupon?.code})`}
                  value={
                    <span className="text-emerald-300">-{fmt(discount)}</span>
                  }
                />
              )}
              <div className="my-2 h-px bg-white/10" />
              <div className="flex items-end justify-between">
                <span className="text-sm text-white/60">Toplam</span>
                <span className="text-2xl font-bold text-gradient-gold">
                  {fmt(total)}
                </span>
              </div>

              {/* Yasal onay — tüm online ödemeler için zorunlu */}
              <label
                className={`mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-xs leading-relaxed transition ${
                  agreedTerms
                    ? "border-brand-yellow/40 bg-brand-yellow/[0.06] text-white/85"
                    : "border-white/10 bg-white/[0.02] text-white/65 hover:border-white/20"
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-brand-yellow"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                />
                <span>
                  <a
                    href="/mesafeli-satis-sozlesmesi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-yellow underline-offset-2 hover:underline"
                  >
                    Mesafeli Satış Sözleşmesi
                  </a>
                  &apos;ni ve{" "}
                  <a
                    href="/iptal-iade-kosullari"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-yellow underline-offset-2 hover:underline"
                  >
                    İptal & İade Koşulları
                  </a>
                  &apos;nı okudum, onaylıyorum.
                </span>
              </label>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={
                  submitting || isPending || items.length === 0 || !agreedTerms
                }
                className="group mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand-yellow py-3.5 text-sm font-semibold text-brand-black shadow-[0_18px_40px_-12px_rgba(255,215,0,0.7)] transition hover:shadow-[0_24px_50px_-10px_rgba(255,215,0,0.9)] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none"
              >
                {submitting || isPending ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeOpacity={0.25}
                        strokeWidth={3}
                      />
                      <path
                        d="M22 12a10 10 0 0 1-10 10"
                        stroke="currentColor"
                        strokeWidth={3}
                        strokeLinecap="round"
                      />
                    </svg>
                    {payMethod === "ONLINE"
                      ? "Ödemeye yönlendiriliyor..."
                      : "Sipariş alınıyor..."}
                  </>
                ) : (
                  <>
                    {payMethod === "ONLINE" ? "Ödemeye Geç" : "Siparişi Tamamla"}
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
                  </>
                )}
              </button>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-white/40">
                <svg
                  viewBox="0 0 16 16"
                  className="h-3 w-3 text-emerald-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="7" width="10" height="7" rx="1" />
                  <path d="M5 7V5a3 3 0 0 1 6 0v2" />
                </svg>
                256-bit SSL · iyzico 3D Secure ile güvenli ödeme
              </p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 backdrop-blur-md">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-yellow/10 text-base ring-1 ring-brand-yellow/20">
          {icon}
        </span>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  autoComplete,
  placeholder,
  textarea,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  textarea?: boolean;
  error?: string;
}) {
  const cls =
    "input-glass w-full rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none";
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-white/55">{label}</span>
      {textarea ? (
        <textarea
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className={cls + " resize-none"}
        />
      ) : (
        <input
          type="text"
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
      {error && <span className="mt-1 block text-xs text-rose-400">{error}</span>}
    </label>
  );
}

function DeliveryOption({
  active,
  onClick,
  title,
  desc,
  fee,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  fee: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition ${
        active
          ? "border-brand-yellow bg-brand-yellow/10 shadow-[0_0_0_1px_rgba(255,215,0,0.4),0_0_30px_-6px_rgba(255,215,0,0.4)]"
          : "border-white/10 bg-white/[0.025] hover:border-white/30"
      }`}
    >
      <span
        className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
          active
            ? "border-brand-yellow bg-brand-yellow"
            : "border-white/30 bg-transparent"
        }`}
      >
        {active && (
          <svg
            viewBox="0 0 12 12"
            className="h-3 w-3 text-brand-black"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m2 6 3 3 5-7" />
          </svg>
        )}
      </span>
      <span className="text-sm font-semibold text-white">{title}</span>
      <span className="text-xs text-white/55">{desc}</span>
      <span className="mt-1 text-xs font-semibold text-brand-yellow">{fee}</span>
    </button>
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
