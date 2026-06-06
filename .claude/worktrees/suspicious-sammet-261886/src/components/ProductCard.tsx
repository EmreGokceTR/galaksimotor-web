"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FavoriteButton } from "./FavoriteButton";
import { AdminEditButton } from "./AdminEditButton";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  brand: string | null;
  image: string | null;
  category: { name: string; slug: string };
};

export function ProductCard({
  product,
  index = 0,
}: {
  product: ProductCardData;
  index?: number;
}) {
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
      {/* admin edit button — outside Link to prevent navigation on click */}
      <div className="absolute right-2 top-2 z-20">
        <AdminEditButton
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            stock: product.stock,
            image: product.image,
          }}
        />
      </div>

      <Link
        href={`/urun/${product.slug}`}
        className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-md transition-all duration-300 hover:border-brand-yellow/50 hover:shadow-[0_0_0_1px_rgba(255,215,0,0.25),0_30px_60px_-20px_rgba(255,215,0,0.25),0_18px_40px_-15px_rgba(0,0,0,0.7)]"
      >
        {/* corner gradient sheen on hover */}
        <span className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-yellow/0 via-transparent to-brand-yellow/0 opacity-0 transition-opacity duration-500 group-hover:from-brand-yellow/10 group-hover:to-brand-yellow/5 group-hover:opacity-100" />

        {/* image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-white/[0.04] to-black/30">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading={index !== undefined && index < 3 ? "eager" : "lazy"}
              priority={index !== undefined && index < 3}
              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/30">
              <svg viewBox="0 0 64 64" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth={1.4}>
                <rect x="6" y="12" width="52" height="40" rx="3" />
                <path d="M6 42l14-14 12 12 8-8 18 18" />
                <circle cx="22" cy="22" r="4" />
              </svg>
            </div>
          )}

          {/* top overlays */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/80 backdrop-blur-md">
              {product.category.name}
            </span>
            {product.stock > 0 ? (
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

          {/* gradient bottom fade */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />

          {/* favorite button (bottom-left of image) */}
          <div className="absolute bottom-2 left-2 z-10">
            <FavoriteButton productId={product.id} />
          </div>
        </div>

        {/* body */}
        <div className="flex flex-1 flex-col gap-1 p-5">
          {product.brand && (
            <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/40">
              {product.brand}
            </span>
          )}
          <h3 className="line-clamp-2 min-h-[2.75rem] text-[15px] font-semibold leading-snug text-white transition-colors group-hover:text-brand-yellow">
            {product.name}
          </h3>
          <span className="text-[11px] text-white/30">SKU · {product.sku}</span>

          <div className="mt-3 flex items-end justify-between border-t border-white/5 pt-3">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-white/40">
                Fiyat
              </span>
              <span className="text-xl font-bold text-gradient-gold">
                {product.price.toLocaleString("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                })}
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
