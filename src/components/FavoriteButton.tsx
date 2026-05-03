"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useFavorites } from "@/stores/favorites";

type Props = {
  productId: string;
  /** "icon" small heart, "pill" expanded with text */
  variant?: "icon" | "pill";
  className?: string;
};

export function FavoriteButton({ productId, variant = "icon", className = "" }: Props) {
  const { status } = useSession();
  const router = useRouter();
  const isFav = useFavorites((s) => s.ids.has(productId));
  const load = useFavorites((s) => s.load);
  const toggle = useFavorites((s) => s.toggle);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (status === "authenticated") void load();
  }, [status, load]);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authenticated") {
      router.push(`/giris?callbackUrl=${window.location.pathname}`);
      return;
    }
    setPulse(true);
    setTimeout(() => setPulse(false), 600);
    await toggle(productId);
  }

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
          isFav
            ? "border-rose-400/40 bg-rose-500/10 text-rose-300"
            : "border-white/15 bg-white/5 text-white/75 hover:border-rose-400/40 hover:text-rose-300"
        } ${className}`}
        aria-pressed={isFav}
        aria-label={isFav ? "Favorilerden çıkar" : "Favorilere ekle"}
      >
        <Heart filled={isFav} pulsing={pulse} />
        {isFav ? "Favorilerimde" : "Favorilere Ekle"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isFav}
      aria-label={isFav ? "Favorilerden çıkar" : "Favorilere ekle"}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white/85 backdrop-blur-md transition hover:scale-110 hover:text-rose-300 ${className}`}
    >
      <Heart filled={isFav} pulsing={pulse} />
    </button>
  );
}

function Heart({ filled, pulsing }: { filled: boolean; pulsing: boolean }) {
  return (
    <span className="relative flex">
      <AnimatePresence>
        {pulsing && filled && (
          <motion.span
            key="ring"
            initial={{ scale: 0.4, opacity: 0.7 }}
            animate={{ scale: 2.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-rose-400/30"
          />
        )}
      </AnimatePresence>
      <motion.svg
        viewBox="0 0 24 24"
        className="relative h-4 w-4"
        animate={pulsing ? { scale: [1, 1.4, 1] } : { scale: 1 }}
        transition={{ duration: 0.4 }}
        fill={filled ? "#fb7185" : "none"}
        stroke={filled ? "#fb7185" : "currentColor"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </motion.svg>
    </span>
  );
}
