"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEditMode } from "@/context/EditModeContext";
import {
  createCoupon,
  deleteCoupon,
  toggleCouponActive,
} from "@/app/_actions/coupon";

const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

export type AdminCoupon = {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  amount: number;
  minOrderAmount: number | null;
  expiryDate: string | null;
  isActive: boolean;
  usageLimit: number | null;
  timesUsed: number;
};

export function CouponAdminPanel({ coupons }: { coupons: AdminCoupon[] }) {
  const { data: session } = useSession();
  const { isEditMode } = useEditMode();
  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  if (!isAdmin || !isEditMode) return null;

  return (
    <section className="mb-8 rounded-2xl border border-brand-yellow/30 bg-gradient-to-br from-brand-yellow/[0.06] via-white/[0.02] to-transparent p-5 backdrop-blur-md">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-yellow">
            🎟 Kupon Yönetimi
          </h2>
          <p className="text-[11px] text-white/45">
            Edit Mode aktifken yeni kupon oluştur, listele ya da pasifleştir.
          </p>
        </div>
      </header>

      <CouponForm />

      {coupons.length === 0 ? (
        <p className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center text-[11px] text-white/45">
          Henüz tanımlı kupon yok.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {coupons.map((c) => (
            <CouponRow key={c.id} coupon={c} />
          ))}
        </ul>
      )}
    </section>
  );
}

function CouponForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [amount, setAmount] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const res = await createCoupon({
        code,
        type,
        amount: parseFloat(amount),
        minOrderAmount: minOrder ? parseFloat(minOrder) : null,
        expiryDate: expiry || null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(true);
      setCode("");
      setAmount("");
      setMinOrder("");
      setExpiry("");
      setUsageLimit("");
      router.refresh();
      setTimeout(() => setSuccess(false), 2000);
    });
  }

  return (
    <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-4 md:grid-cols-6">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="KOD"
        className="input-glass px-2 py-1.5 text-xs uppercase tracking-wider md:col-span-2"
        disabled={isPending}
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value as "PERCENT" | "FIXED")}
        className="input-glass px-2 py-1.5 text-xs"
        disabled={isPending}
      >
        <option value="PERCENT" className="bg-brand-black">
          Yüzde (%)
        </option>
        <option value="FIXED" className="bg-brand-black">
          Sabit (₺)
        </option>
      </select>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder={type === "PERCENT" ? "%" : "Tutar"}
        className="input-glass px-2 py-1.5 text-xs"
        disabled={isPending}
      />
      <input
        type="number"
        value={minOrder}
        onChange={(e) => setMinOrder(e.target.value)}
        placeholder="Min sepet"
        className="input-glass px-2 py-1.5 text-xs"
        disabled={isPending}
      />
      <input
        type="date"
        value={expiry}
        onChange={(e) => setExpiry(e.target.value)}
        className="input-glass px-2 py-1.5 text-xs text-white/70"
        disabled={isPending}
      />
      <input
        type="number"
        value={usageLimit}
        onChange={(e) => setUsageLimit(e.target.value)}
        placeholder="Kullanım limiti"
        className="input-glass px-2 py-1.5 text-xs md:col-span-5"
        disabled={isPending}
      />
      <button
        type="button"
        onClick={handleCreate}
        disabled={isPending || !code.trim() || !amount}
        className="rounded-lg bg-brand-yellow px-3 py-1.5 text-xs font-semibold text-brand-black transition hover:brightness-110 disabled:opacity-40 md:col-span-1"
      >
        {isPending ? "..." : "+ Kupon"}
      </button>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="md:col-span-6 text-[11px] text-rose-300"
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="md:col-span-6 text-[11px] text-emerald-300"
          >
            ✓ Kupon oluşturuldu.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function CouponRow({ coupon }: { coupon: AdminCoupon }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleCouponActive(coupon.id);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm(`"${coupon.code}" kuponunu silmek istiyor musun?`)) return;
    startTransition(async () => {
      await deleteCoupon(coupon.id);
      router.refresh();
    });
  }

  const expired =
    coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now();

  return (
    <li
      className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 transition ${
        coupon.isActive && !expired
          ? "border-emerald-400/20 bg-emerald-500/5"
          : "border-white/10 bg-white/[0.02] opacity-60"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm font-bold text-brand-yellow">
          {coupon.code}
        </span>
        <span className="text-xs text-white/65">
          {coupon.type === "PERCENT"
            ? `%${coupon.amount} indirim`
            : `${fmt(coupon.amount)} indirim`}
        </span>
        {coupon.minOrderAmount && (
          <span className="text-[10px] text-white/40">
            min {fmt(coupon.minOrderAmount)}
          </span>
        )}
        {coupon.expiryDate && (
          <span
            className={`text-[10px] ${
              expired ? "text-rose-300" : "text-white/40"
            }`}
          >
            son: {new Date(coupon.expiryDate).toLocaleDateString("tr-TR")}
          </span>
        )}
        {coupon.usageLimit && (
          <span className="text-[10px] text-white/40">
            {coupon.timesUsed}/{coupon.usageLimit} kullanım
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition disabled:opacity-50 ${
            coupon.isActive
              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
              : "border-white/15 bg-white/5 text-white/55 hover:bg-white/10"
          }`}
        >
          {coupon.isActive ? "Aktif" : "Pasif"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-full border border-rose-400/20 bg-rose-500/5 px-2.5 py-0.5 text-[10px] font-medium text-rose-300 transition hover:bg-rose-500/15 disabled:opacity-50"
        >
          Sil
        </button>
      </div>
    </li>
  );
}
