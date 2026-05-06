"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/stores/cart";
import { applyCouponForCart } from "@/app/_actions/coupon";

const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

export function CouponInput() {
  const subtotal = useCart((s) => s.subtotal());
  const applied = useCart((s) => s.appliedCoupon);
  const apply = useCart((s) => s.applyCoupon);
  const removeCoupon = useCart((s) => s.removeCoupon);

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleApply() {
    const trimmed = code.trim();
    if (!trimmed) return;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await applyCouponForCart(trimmed, subtotal);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      apply({ code: res.code, type: res.type, discount: res.discount });
      setSuccess(res.message);
      setCode("");
    });
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-base">🎟</span>
          <div>
            <div className="font-semibold text-emerald-200">
              {applied.code}
            </div>
            <div className="text-[11px] text-emerald-100/70">
              -{fmt(applied.discount)} indirim aktif
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => removeCoupon()}
          className="text-xs text-emerald-100/60 underline-offset-2 hover:underline"
        >
          Kaldır
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleApply();
            }
          }}
          placeholder="Kupon kodu"
          className="input-glass flex-1 px-3 py-2 text-sm uppercase tracking-wider"
          disabled={isPending}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={isPending || !code.trim()}
          className="rounded-xl border border-brand-yellow/40 bg-brand-yellow/15 px-4 py-2 text-xs font-semibold text-brand-yellow transition hover:bg-brand-yellow/25 disabled:opacity-40"
        >
          {isPending ? "..." : "Uygula"}
        </button>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-xs text-rose-300"
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-xs text-emerald-300"
          >
            {success}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
