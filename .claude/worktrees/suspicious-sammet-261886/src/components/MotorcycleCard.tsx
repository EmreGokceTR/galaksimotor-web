"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { AdminMotorcycleEditButton, type MotorcycleSnapshot } from "./AdminMotorcycleEditButton";

export type MotorcycleCardData = {
  id: string;
  marka: string;
  model: string;
  yil: number;
  cc: number | null;
  fiyat: number;
  stokDurumu: boolean;
  gorsel: string | null;
  aciklama: string | null;
};

export function MotorcycleCard({
  moto,
  index = 0,
}: {
  moto: MotorcycleCardData;
  index?: number;
}) {
  const snapshot: MotorcycleSnapshot = {
    id: moto.id,
    marka: moto.marka,
    model: moto.model,
    yil: moto.yil,
    cc: moto.cc,
    fiyat: moto.fiyat,
    stokDurumu: moto.stokDurumu,
    gorsel: moto.gorsel,
    aciklama: moto.aciklama,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
        delay: Math.min(index * 0.05, 0.4),
      }}
      whileHover={{ y: -6 }}
      className="group relative"
    >
      {/* admin edit — outside Link to prevent navigation */}
      <div className="absolute right-2 top-2 z-20">
        <AdminMotorcycleEditButton moto={snapshot} />
      </div>

      <Link
        href={`/motosikletler/${moto.id}`}
        className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-md transition-all duration-300 hover:border-brand-yellow/50 hover:shadow-[0_0_0_1px_rgba(255,215,0,0.25),0_30px_60px_-20px_rgba(255,215,0,0.25),0_18px_40px_-15px_rgba(0,0,0,0.7)]"
      >
        {/* hover sheen */}
        <span className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-yellow/0 via-transparent to-brand-yellow/0 opacity-0 transition-opacity duration-500 group-hover:from-brand-yellow/10 group-hover:to-brand-yellow/5 group-hover:opacity-100" />

        {/* image */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-white/[0.04] to-black/30">
          {moto.gorsel ? (
            <Image
              src={moto.gorsel}
              alt={`${moto.marka} ${moto.model}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading={index < 3 ? "eager" : "lazy"}
              priority={index < 3}
              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/20">
              <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth={1.2}>
                <circle cx="14" cy="42" r="10" />
                <circle cx="50" cy="42" r="10" />
                <path d="M24 42h12M36 42l8-16h-8l-4 8H20l-4 6" />
                <path d="M44 26l-4-6h-8" />
              </svg>
            </div>
          )}

          {/* top badges */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <div className="flex flex-col gap-1.5">
              <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/80 backdrop-blur-md">
                {moto.marka}
              </span>
              {moto.cc && (
                <span className="rounded-full bg-brand-yellow/20 px-2.5 py-0.5 text-[10px] font-semibold text-brand-yellow backdrop-blur-md ring-1 ring-brand-yellow/30">
                  {moto.cc} CC
                </span>
              )}
            </div>
            {moto.stokDurumu ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-400/30 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                Stokta
              </span>
            ) : (
              <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-medium text-rose-300 ring-1 ring-rose-400/30 backdrop-blur-md">
                Tükendi
              </span>
            )}
          </div>

          {/* year badge bottom-left */}
          <div className="absolute bottom-3 left-3">
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white/90 backdrop-blur-md ring-1 ring-white/10">
              {moto.yil}
            </span>
          </div>

          {/* gradient fade */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
        </div>

        {/* body */}
        <div className="flex flex-1 flex-col gap-1 p-5">
          <h3 className="line-clamp-1 text-[15px] font-bold leading-snug text-white transition-colors group-hover:text-brand-yellow">
            {moto.marka} {moto.model}
          </h3>
          <span className="text-[11px] text-white/40">{moto.yil} Model{moto.cc ? ` · ${moto.cc} CC` : ""}</span>

          {moto.aciklama && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/50">
              {moto.aciklama}
            </p>
          )}

          <div className="mt-3 flex items-end justify-between border-t border-white/5 pt-3">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-white/40">Fiyat</span>
              <span className="text-xl font-bold text-gradient-gold">
                {moto.fiyat.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
              </span>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-white/60 ring-1 ring-white/10 transition-all duration-300 group-hover:bg-brand-yellow group-hover:text-brand-black group-hover:ring-brand-yellow group-hover:shadow-[0_0_18px_-2px_rgba(255,215,0,0.6)]">
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
