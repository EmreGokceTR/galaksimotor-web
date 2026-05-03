"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const TESTIMONIALS = [
  {
    name: "Mert K.",
    bike: "Honda PCX 160",
    rating: 5,
    text: "Periyodik bakım için randevuyu site üzerinden aldım, dakikasında işlem başladı. Usta CVT kayışını gösterip durumu açıkladı, şeffaflık çok hoşuma gitti.",
  },
  {
    name: "Ayşe T.",
    bike: "Bajaj Pulsar F 250",
    rating: 5,
    text: "Koruma demirini ertesi gün elime aldım, montaj için de uğradım. 10/10 hizmet — fiyat-performans rakipsiz.",
  },
  {
    name: "Burak D.",
    bike: "Kymco DTX 360",
    rating: 5,
    text: "Telefonla soru sordum, sorunumu uzaktan teşhis ettiler. Ertesi gün uğradım yarım saatte hallettiler. Bayilerden çok daha rahat çalışıyorlar.",
  },
  {
    name: "Hakan E.",
    bike: "Yamaha MT-07",
    rating: 5,
    text: "Online sipariş ettim, aynı gün kargoya verdiler. Fatura, takip numarası her şey eksiksiz geldi. Müşteri ilişkisi profesyonel.",
  },
  {
    name: "Selin Y.",
    bike: "Honda CB 125F",
    rating: 5,
    text: "Kask seçerken çok yardımcı oldular. Bedenimi denedim, yanlış olduğunu söylediler. Doğru beden için tekrar uğradım — bu samimiyet az bulunur.",
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

export function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);
  const t = TESTIMONIALS[index];

  const go = (dir: -1 | 1) =>
    setIndex((i) => (i + dir + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -left-6 top-12 h-44 w-44 rounded-full bg-brand-yellow/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-6 -bottom-12 h-44 w-44 rounded-full bg-brand-yellow/8 blur-3xl" />

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-8 backdrop-blur-md md:p-12">
        {/* Big quote mark */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-6 left-6 select-none text-[160px] font-bold leading-none text-brand-yellow/10"
        >
          &ldquo;
        </span>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative"
          >
            <Stars rating={t.rating} />
            <blockquote className="mt-5 text-pretty text-lg leading-relaxed text-white/85 md:text-2xl">
              &ldquo;{t.text}&rdquo;
            </blockquote>
            <footer className="mt-6 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-yellow/15 text-base font-bold text-brand-yellow ring-1 ring-brand-yellow/30">
                {t.name.charAt(0)}
              </span>
              <div>
                <div className="text-sm font-semibold text-white">{t.name}</div>
                <div className="text-xs text-white/50">{t.bike}</div>
              </div>
            </footer>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex gap-1.5">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Yorum ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? "w-8 bg-brand-yellow"
                    : "w-1.5 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Önceki"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition hover:border-brand-yellow/50 hover:text-brand-yellow"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 3 5 8l5 5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Sonraki"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition hover:border-brand-yellow/50 hover:text-brand-yellow"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 3 5 5-5 5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill={n <= rating ? "#FFD700" : "none"}
          stroke="#FFD700"
          strokeWidth={1.5}
          strokeLinejoin="round"
        >
          <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
        </svg>
      ))}
    </div>
  );
}
