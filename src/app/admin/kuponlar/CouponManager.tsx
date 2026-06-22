"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createCoupon,
  deleteCoupon,
  toggleCouponActive,
} from "@/app/_actions/coupon";

type CouponType = "PERCENT" | "FIXED";

type Coupon = {
  id: string;
  code: string;
  type: CouponType;
  amount: number;
  minOrderAmount: number | null;
  expiryDate: string | null;
  isActive: boolean;
  usageLimit: number | null;
  timesUsed: number;
};

const fmtTRY = (n: number) =>
  n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

export function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [type, setType] = useState<CouponType>("PERCENT");
  const [amount, setAmount] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [usageLimit, setUsageLimit] = useState("");

  function resetForm() {
    setCode("");
    setType("PERCENT");
    setAmount("");
    setMinOrderAmount("");
    setExpiryDate("");
    setUsageLimit("");
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amt = parseFloat(amount);
    if (!code.trim()) return setError("Kupon kodu zorunlu.");
    if (isNaN(amt) || amt <= 0) return setError("Geçerli bir tutar girin.");

    startTransition(async () => {
      const res = await createCoupon({
        code: code.trim(),
        type,
        amount: amt,
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        expiryDate: expiryDate || null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      resetForm();
      router.refresh();
    });
  }

  function handleToggle(id: string) {
    startTransition(async () => {
      await toggleCouponActive(id);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteCoupon(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {/* Yeni kupon formu */}
      <form
        onSubmit={handleCreate}
        className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">
          Yeni Kupon
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
              Kupon Kodu *
            </span>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="HOSGELDIN10"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm uppercase text-white outline-none focus:border-brand-yellow/40 placeholder:text-white/25"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
              İndirim Tipi
            </span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CouponType)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40"
            >
              <option value="PERCENT">Yüzde (%)</option>
              <option value="FIXED">Sabit Tutar (₺)</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
              {type === "PERCENT" ? "İndirim (%) *" : "İndirim (₺) *"}
            </span>
            <input
              type="number"
              min={0}
              step={type === "PERCENT" ? 1 : 0.01}
              max={type === "PERCENT" ? 100 : undefined}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={type === "PERCENT" ? "10" : "50.00"}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40 placeholder:text-white/25"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
              Min. Sepet Tutarı (₺)
            </span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              placeholder="Sınır yok"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40 placeholder:text-white/25"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
              Son Kullanma Tarihi
            </span>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
              Kullanım Limiti
            </span>
            <input
              type="number"
              min={1}
              step={1}
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              placeholder="Sınırsız"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40 placeholder:text-white/25"
            />
          </label>
        </div>

        {error && (
          <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {error}
          </p>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-brand-yellow px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-brand-yellow/80 disabled:opacity-50"
          >
            {isPending ? "Kaydediliyor…" : "Kupon Oluştur"}
          </button>
        </div>
      </form>

      {/* Mevcut kuponlar */}
      {coupons.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-white/45">
          Henüz kupon yok. Yukarıdan ekleyebilirsin.
        </div>
      ) : (
        <ul className="space-y-3">
          {coupons.map((c) => {
            const expired =
              c.expiryDate && new Date(c.expiryDate).getTime() < Date.now();
            const limitReached =
              c.usageLimit !== null && c.timesUsed >= c.usageLimit;
            return (
              <li
                key={c.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-base font-bold text-white">
                      {c.code}
                    </span>
                    <span className="rounded-full bg-brand-yellow/15 px-2 py-0.5 text-xs font-semibold text-brand-yellow">
                      {c.type === "PERCENT"
                        ? `%${c.amount} indirim`
                        : `${fmtTRY(c.amount)} indirim`}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ring-1 ${
                        c.isActive && !expired && !limitReached
                          ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30"
                          : "bg-white/10 text-white/55 ring-white/15"
                      }`}
                    >
                      {!c.isActive
                        ? "Pasif"
                        : expired
                        ? "Süresi doldu"
                        : limitReached
                        ? "Limit doldu"
                        : "Aktif"}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-white/45">
                    {c.minOrderAmount !== null && (
                      <span>Min. sepet: {fmtTRY(c.minOrderAmount)}</span>
                    )}
                    {c.expiryDate && (
                      <span>
                        Son: {new Date(c.expiryDate).toLocaleDateString("tr-TR")}
                      </span>
                    )}
                    <span>
                      Kullanım: {c.timesUsed}
                      {c.usageLimit !== null ? ` / ${c.usageLimit}` : ""}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleToggle(c.id)}
                    className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/75 hover:text-brand-yellow disabled:opacity-50"
                  >
                    {c.isActive ? "Pasifleştir" : "Aktifleştir"}
                  </button>
                  <DeleteButton
                    onConfirm={() => handleDelete(c.id)}
                    pending={isPending}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function DeleteButton({
  onConfirm,
  pending,
}: {
  onConfirm: () => void;
  pending: boolean;
}) {
  const [confirm, setConfirm] = useState(false);
  if (confirm) {
    return (
      <span className="flex items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={onConfirm}
          className="rounded-full bg-rose-500/20 px-3 py-1 text-xs text-rose-400 ring-1 ring-rose-400/30 hover:bg-rose-500/30 disabled:opacity-50"
        >
          {pending ? "Siliniyor…" : "Evet, sil"}
        </button>
        <button
          type="button"
          onClick={() => setConfirm(false)}
          className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/60 hover:text-white"
        >
          İptal
        </button>
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setConfirm(true)}
      className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-rose-400/80 hover:text-rose-400"
    >
      Sil
    </button>
  );
}
