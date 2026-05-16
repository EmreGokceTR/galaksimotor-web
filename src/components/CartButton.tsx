"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/stores/cart";

export function CartButton({ className = "" }: { className?: string }) {
  const open = useCart((s) => s.open);
  const count = useCart((s) => (s.hasHydrated ? s.count() : 0));

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Sepeti aç"
      className={`group relative flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/85 backdrop-blur-md transition hover:border-brand-yellow/60 hover:text-brand-yellow ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 transition-transform group-hover:scale-110"
      >
        <path d="M5 7h14l-1.6 10.2a2 2 0 0 1-2 1.8H8.6a2 2 0 0 1-2-1.8L5 7Z" />
        <path d="M9 7V5a3 3 0 0 1 6 0v2" />
      </svg>

      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-yellow px-1 text-[11px] font-bold text-brand-black shadow-[0_0_12px_-2px_rgba(255,215,0,0.7)]"
          >
            {count > 99 ? "99+" : count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
