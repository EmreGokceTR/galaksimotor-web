"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { useGarage, type GarageBike } from "@/stores/garage";

export function GarageSelector() {
  const { status } = useSession();
  const active = useGarage((s) => s.active);
  const setActive = useGarage((s) => s.setActive);
  const hydrated = useGarage((s) => s.hasHydrated);
  const [open, setOpen] = useState(false);
  const [bikes, setBikes] = useState<GarageBike[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // hydrate
  useEffect(() => {
    useGarage.persist.rehydrate();
  }, []);

  // Outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  async function load() {
    if (status !== "authenticated") return;
    setLoading(true);
    try {
      const res = await fetch("/api/garage");
      const data = await res.json();
      setBikes(
        (data.items ?? []).map((it: { motorcycleId: string; brand: string; model: string; year: number; nickname: string | null }) => ({
          motorcycleId: it.motorcycleId,
          brand: it.brand,
          model: it.model,
          year: it.year,
          nickname: it.nickname,
        }))
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, status]);

  if (!hydrated) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
          active
            ? "border-brand-yellow/40 bg-brand-yellow/10 text-brand-yellow"
            : "border-white/15 bg-white/5 text-white/75 hover:border-brand-yellow/40 hover:text-brand-yellow"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
          <circle cx="5" cy="17" r="3" />
          <circle cx="19" cy="17" r="3" />
          <path d="M8 17h8l-3-7h-2l-1 2H7l3 5Z" strokeLinejoin="round" />
        </svg>
        <span className="hidden sm:inline">
          {active ? `${active.brand} ${active.model}` : "Garajım"}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 z-50 mt-2 w-72 origin-top-right overflow-hidden rounded-2xl border border-white/10 bg-brand-black/90 shadow-2xl backdrop-blur-xl"
          >
            <header className="border-b border-white/10 px-4 py-3">
              <h3 className="text-sm font-semibold text-white">Garajım</h3>
              <p className="text-[11px] text-white/50">
                Aktif motoruna uygun ürünleri otomatik filtreleriz.
              </p>
            </header>

            {status !== "authenticated" ? (
              <div className="px-4 py-5 text-center">
                <p className="mb-3 text-xs text-white/55">
                  Garaj kullanmak için giriş yap.
                </p>
                <Link
                  href="/giris?callbackUrl=/hesabim/garaj"
                  onClick={() => setOpen(false)}
                  className="inline-block rounded-full bg-brand-yellow px-4 py-1.5 text-xs font-semibold text-brand-black"
                >
                  Giriş Yap
                </Link>
              </div>
            ) : loading ? (
              <div className="px-4 py-6 text-center text-xs text-white/45">
                Yükleniyor...
              </div>
            ) : bikes.length === 0 ? (
              <div className="px-4 py-5 text-center">
                <p className="mb-3 text-xs text-white/55">
                  Henüz motor eklemedin.
                </p>
                <Link
                  href="/hesabim/garaj"
                  onClick={() => setOpen(false)}
                  className="inline-block rounded-full bg-brand-yellow px-4 py-1.5 text-xs font-semibold text-brand-black"
                >
                  + Motor Ekle
                </Link>
              </div>
            ) : (
              <ul className="max-h-72 overflow-y-auto p-2">
                {active && (
                  <li className="mb-1">
                    <button
                      onClick={() => {
                        setActive(null);
                        setOpen(false);
                      }}
                      className="w-full rounded-lg border border-white/10 px-3 py-2 text-center text-xs text-white/55 hover:bg-white/5"
                    >
                      Filtreyi kaldır
                    </button>
                  </li>
                )}
                {bikes.map((b) => {
                  const isActive = active?.motorcycleId === b.motorcycleId;
                  return (
                    <li key={b.motorcycleId}>
                      <button
                        onClick={() => {
                          setActive(b);
                          setOpen(false);
                        }}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                          isActive
                            ? "bg-brand-yellow/10 text-brand-yellow ring-1 ring-brand-yellow/30"
                            : "text-white/85 hover:bg-white/5"
                        }`}
                      >
                        <span>
                          <strong>{b.brand}</strong> {b.model}
                          <span className="ml-1 text-[11px] text-white/40">
                            {b.year}
                          </span>
                          {b.nickname && (
                            <span className="ml-1 text-[10px] text-white/40">
                              · {b.nickname}
                            </span>
                          )}
                        </span>
                        {isActive && (
                          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
                            <path d="m3 8 4 4 6-8" />
                          </svg>
                        )}
                      </button>
                    </li>
                  );
                })}
                <li className="mt-1 border-t border-white/10 pt-2">
                  <Link
                    href="/hesabim/garaj"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-center text-xs text-white/60 hover:bg-white/5"
                  >
                    + Motor Ekle / Düzenle
                  </Link>
                </li>
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
