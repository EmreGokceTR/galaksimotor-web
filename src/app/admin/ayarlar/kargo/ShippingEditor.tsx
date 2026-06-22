"use client";

import { useState, useTransition } from "react";
import { saveShippingSettings } from "./actions";

type Props = { fee: number; freeLimit: number; estimatedDays: number };

export function ShippingEditor({ fee, freeLimit, estimatedDays }: Props) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false);
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveShippingSettings(fd);
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(res.error ?? "Hata oluştu.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <NumberField
          label="Kargo Ücreti (₺)"
          name="shipping_fee"
          defaultValue={fee}
          step={0.01}
          hint="Sabit kargo bedeli. Mağazadan teslimde ücret alınmaz."
        />
        <NumberField
          label="Ücretsiz Kargo Eşiği (₺)"
          name="free_shipping_limit"
          defaultValue={freeLimit}
          step={0.01}
          hint="Bu tutar ve üzeri sepetlerde kargo ücretsiz olur."
        />
        <NumberField
          label="Tahmini Teslim Süresi (gün)"
          name="estimated_delivery_days"
          defaultValue={estimatedDays}
          step={1}
          hint="Ödeme sayfasında ve kargo seçeneğinde gösterilir."
        />
      </section>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-brand-yellow px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-brand-yellow/80 disabled:opacity-50"
        >
          {isPending ? "Kaydediliyor…" : "Değişiklikleri Kaydet"}
        </button>
        {saved && (
          <span className="text-sm font-medium text-emerald-400">✓ Kaydedildi</span>
        )}
        {error && <span className="text-sm text-rose-400">{error}</span>}
      </div>
    </form>
  );
}

function NumberField({
  label,
  name,
  defaultValue,
  step,
  hint,
}: {
  label: string;
  name: string;
  defaultValue: number;
  step: number;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
        {label}
      </label>
      <input
        type="number"
        name={name}
        min={0}
        step={step}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40"
      />
      {hint && <p className="mt-1 text-[11px] text-white/35">{hint}</p>}
    </div>
  );
}
