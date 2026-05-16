"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/stores/cart";
import { FreeShippingBar } from "./FreeShippingBar";
import { computeShipping } from "@/config/site";

const EASE = [0.16, 1, 0.3, 1] as const;
const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const items = useCart((s) => s.items);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());

  const panelRef = useRef<HTMLElement>(null);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Focus trap: move initial focus into panel; keep Tab inside dialog
  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    if (!panel) return;

    // Move focus to the first focusable element (close button)
    const firstFocusable = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
    firstFocusable?.focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const els = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      ).filter((el) => !el.hasAttribute("disabled"));
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            aria-hidden="true"
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* panel — proper dialog role for screen readers */}
          <motion.aside
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: EASE }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-white/10 bg-brand-black/90 backdrop-blur-2xl shadow-[-30px_0_60px_-20px_rgba(0,0,0,0.6)]"
          >
            {/* header */}
            <header className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-yellow/15 text-brand-yellow ring-1 ring-brand-yellow/30">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="h-5 w-5">
                    <path d="M5 7h14l-1.6 10.2a2 2 0 0 1-2 1.8H8.6a2 2 0 0 1-2-1.8L5 7Z" />
                    <path d="M9 7V5a3 3 0 0 1 6 0v2" />
                  </svg>
                </span>
                <div>
                  <h2 id="cart-drawer-title" className="text-base font-semibold text-white">Sepetim</h2>
                  <p className="text-xs text-white/50">
                    {items.length === 0
                      ? "Henüz ürün eklenmedi"
                      : `${items.length} farklı ürün`}
                  </p>
                </div>
              </div>
              <button
                onClick={close}
                aria-label="Sepeti kapat"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-white/30 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="m6 6 12 12M6 18 18 6" />
                </svg>
              </button>
            </header>

            {/* items */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {items.length === 0 ? (
                <EmptyState onClose={close} />
              ) : (
                <ul className="space-y-3">
                  <AnimatePresence initial={false}>
                    {items.map((it) => (
                      <motion.li
                        key={it.key}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50, height: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="flex gap-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.025] p-3 backdrop-blur-md"
                      >
                        <Link
                          href={`/urun/${it.slug}`}
                          onClick={close}
                          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-black/30"
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
                              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.4}>
                                <rect x="3" y="5" width="18" height="14" rx="2" />
                                <path d="m3 17 6-6 5 5 3-3 4 4" />
                              </svg>
                            </div>
                          )}
                        </Link>

                        <div className="flex flex-1 flex-col">
                          <Link
                            href={`/urun/${it.slug}`}
                            onClick={close}
                            className="line-clamp-2 text-sm font-medium leading-snug text-white hover:text-brand-yellow"
                          >
                            {it.name}
                          </Link>
                          {it.variantLabel && (
                            <span className="mt-0.5 text-[11px] text-white/50">
                              {it.variantLabel}
                            </span>
                          )}

                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center rounded-full border border-white/10 bg-white/5">
                              <button
                                onClick={() => dec(it.key)}
                                className="flex h-11 w-11 items-center justify-center text-white/70 hover:text-brand-yellow"
                                aria-label={`${it.name} adetini azalt`}
                              >
                                −
                              </button>
                              <span className="w-7 text-center text-xs font-medium" aria-live="polite" aria-label={`Adet: ${it.quantity}`}>
                                {it.quantity}
                              </span>
                              <button
                                onClick={() => inc(it.key)}
                                disabled={it.quantity >= it.stockCap}
                                className="flex h-11 w-11 items-center justify-center text-white/70 hover:text-brand-yellow disabled:cursor-not-allowed disabled:opacity-30"
                                aria-label={`${it.name} adetini artır`}
                              >
                                +
                              </button>
                            </div>
                            <span className="text-sm font-semibold text-gradient-gold">
                              {fmt(it.price * it.quantity)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => remove(it.key)}
                          aria-label={`${it.name} ürününü sepetten kaldır`}
                          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-white/30 hover:text-rose-300"
                        >
                          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                            <path d="m4 4 8 8M4 12 12 4" />
                          </svg>
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* footer */}
            {items.length > 0 && (
              <footer className="border-t border-white/10 bg-black/40 px-6 py-5 backdrop-blur-md">
                <div className="mb-3">
                  <FreeShippingBar subtotal={subtotal} />
                </div>
                <div className="mb-1 flex items-center justify-between text-sm text-white/55">
                  <span>Ara toplam</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="mb-4 flex items-center justify-between text-sm text-white/55">
                  <span>Kargo</span>
                  <span className={computeShipping(subtotal).free ? "text-emerald-300" : ""}>
                    {computeShipping(subtotal).free ? "Ücretsiz" : fmt(computeShipping(subtotal).fee)}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    href="/odeme"
                    onClick={close}
                    className="group flex items-center justify-center gap-2 rounded-full bg-brand-yellow px-5 py-3 text-sm font-semibold text-brand-black shadow-[0_18px_40px_-12px_rgba(255,215,0,0.7)] transition hover:shadow-[0_24px_50px_-10px_rgba(255,215,0,0.9)]"
                  >
                    Ödemeye Geç
                    <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </Link>
                  <Link
                    href="/sepet"
                    onClick={close}
                    className="rounded-full border border-white/15 bg-white/5 py-2 text-center text-sm font-medium text-white/80 hover:border-brand-yellow/40 hover:text-brand-yellow"
                  >
                    Sepeti görüntüle
                  </Link>
                </div>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="relative">
        <div className="absolute inset-0 -z-10 rounded-full bg-brand-yellow/20 blur-2xl" />
        <span className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-brand-yellow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} className="h-10 w-10">
            <path d="M5 7h14l-1.6 10.2a2 2 0 0 1-2 1.8H8.6a2 2 0 0 1-2-1.8L5 7Z" />
            <path d="M9 7V5a3 3 0 0 1 6 0v2" />
          </svg>
        </span>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-white">
        Sepetin şu an boş
      </h3>
      <p className="mt-1 max-w-xs text-sm text-white/55">
        Ürünleri keşfetmeye başlayalım — birkaç tık ötede.
      </p>
      <Link
        href="/urunler"
        onClick={onClose}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-yellow px-5 py-2.5 text-sm font-semibold text-brand-black"
      >
        Ürünleri Keşfet
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </Link>
    </div>
  );
}
