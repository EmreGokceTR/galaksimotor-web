"use client";

import { useState } from "react";
import NextImage from "next/image";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  images: { url: string; alt: string }[];
};

export function ProductGallery({ images }: Props) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025] text-white/40 backdrop-blur-md">
        <div className="flex flex-col items-center gap-2 text-sm">
          <svg
            viewBox="0 0 64 64"
            className="h-12 w-12"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.4}
          >
            <rect x="6" y="12" width="52" height="40" rx="3" />
            <path d="M6 42l14-14 12 12 8-8 18 18" />
            <circle cx="22" cy="22" r="4" />
          </svg>
          Görsel yok
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-black/40 backdrop-blur-md">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active].url}
            alt={images[active].alt}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>

        {/* gradient corners */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-transparent" />

        {/* counter */}
        {images.length > 1 && (
          <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] text-white/80 backdrop-blur-md">
            {active + 1} / {images.length}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg transition-all ${
                i === active
                  ? "ring-2 ring-brand-yellow ring-offset-2 ring-offset-brand-black scale-105"
                  : "ring-1 ring-white/10 opacity-60 hover:opacity-100"
              }`}
            >
              <NextImage
                src={img.url}
                alt={img.alt}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
