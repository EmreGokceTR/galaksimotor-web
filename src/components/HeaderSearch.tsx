"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SearchBox } from "./SearchBox";

/**
 * Header'da yer kaplamaması için varsayılan olarak sadece büyüteç ikonu
 * gösterir; tıklanınca arama kutusu açılır (dropdown), dışarı tıklayınca
 * veya Escape ile kapanır.
 */
export function HeaderSearch({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Sitede ara"
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/85 backdrop-blur-md transition hover:border-brand-yellow/60 hover:text-brand-yellow"
      >
        <svg viewBox="0 0 16 16" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <circle cx="7" cy="7" r="5" />
          <path d="M11 11l3 3" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-white/10 bg-brand-black/95 p-2 shadow-2xl backdrop-blur-md"
          >
            <SearchBox autoFocus onNavigate={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
