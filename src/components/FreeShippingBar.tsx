"use client";

import { motion } from "framer-motion";
import { computeShipping, SITE } from "@/config/site";

const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

export function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const ship = computeShipping(subtotal);
  const pct =
    subtotal === 0
      ? 0
      : Math.min(100, (subtotal / SITE.shipping.freeOver) * 100);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3 backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between text-xs">
        {ship.free ? (
          <span className="font-semibold text-emerald-300">
            🎉 Kargon ücretsiz!
          </span>
        ) : (
          <>
            <span className="text-white/65">
              <strong className="text-brand-yellow">{fmt(ship.remaining)}</strong>{" "}
              daha alışveriş → ücretsiz kargo
            </span>
            <span className="text-white/55">{Math.round(pct)}%</span>
          </>
        )}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full ${
            ship.free
              ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
              : "bg-brand-yellow shadow-[0_0_10px_rgba(255,215,0,0.5)]"
          }`}
        />
      </div>
    </div>
  );
}
