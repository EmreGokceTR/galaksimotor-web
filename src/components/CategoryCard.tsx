"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EditableWrapper } from "./EditableWrapper";

type Props = {
  slug: string;
  name: string;
  description?: string | null;
  index?: number;
  ctaText: string;
  iconUrl?: string;
  iconSettingKey: string;
};

const ICONS: Record<string, ReactNode> = {
  "motosiklet-yedek-parcalari": (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="44" r="10" /><circle cx="48" cy="44" r="10" />
      <circle cx="16" cy="44" r="2" fill="currentColor" /><circle cx="48" cy="44" r="2" fill="currentColor" />
      <path d="M22 44h12l8-14h6l4 6" /><path d="M30 30l4-8h10" /><path d="M40 16h8" />
    </svg>
  ),
  "bakim-ve-tamir-urunleri": (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M40 12l-4 4 4 4 4-4-4-4Z" />
      <path d="M36 16L18 34a4 4 0 0 0 0 6l4 4a4 4 0 0 0 6 0l18-18" />
      <circle cx="48" cy="46" r="8" /><path d="M48 42v8M44 46h8" />
    </svg>
  ),
  aksesuarlar: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 30c0-10 8-18 18-18s18 8 18 18v14H14V30Z" />
      <path d="M22 44v6h6v-6M36 44v6h6v-6" /><path d="M22 28h20" /><circle cx="32" cy="22" r="2" fill="currentColor" />
    </svg>
  ),
};

const FALLBACK_ICON = (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="12" y="14" width="40" height="36" rx="4" />
    <path d="M22 26h20M22 34h14M22 42h10" />
  </svg>
);

const R = ["/"];

export function CategoryCard({ slug, name, description, index = 0, ctaText, iconUrl, iconSettingKey }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: Math.min(index * 0.08, 0.3) }}
    >
      <Link
        href={`/kategori/${slug}`}
        className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-7 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-yellow/50 hover:shadow-[0_0_0_1px_rgba(255,215,0,0.25),0_30px_60px_-20px_rgba(255,215,0,0.25)]"
      >
        <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-yellow/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Icon — image override or SVG fallback */}
        <EditableWrapper
          table="siteSetting"
          id={iconSettingKey}
          field="value"
          value={iconUrl ?? ""}
          label={`${name} İkonu (URL)`}
          fieldType="image"
          revalidatePaths={R}
          as="span"
        >
          <span className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-brand-yellow/10 text-brand-yellow ring-1 ring-brand-yellow/20 transition-all duration-500 group-hover:bg-brand-yellow group-hover:text-brand-black group-hover:shadow-[0_0_24px_-4px_rgba(255,215,0,0.7)] group-hover:rotate-[-6deg] overflow-hidden">
            {iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={iconUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <span className="block h-7 w-7">{ICONS[slug] ?? FALLBACK_ICON}</span>
            )}
          </span>
        </EditableWrapper>

        <div className="flex-1">
          <h3 className="text-xl font-semibold tracking-tight text-white transition-colors group-hover:text-brand-yellow">
            {name}
          </h3>
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-white/55">{description}</p>
          )}
        </div>

        <span className="inline-flex items-center gap-2 text-sm font-medium text-white/60 transition-colors group-hover:text-brand-yellow">
          <EditableWrapper
            table="siteSetting"
            id="cat_cta"
            field="value"
            value={ctaText}
            label="Kategori Kart CTA"
            revalidatePaths={R}
            as="span"
          >
            {ctaText}
          </EditableWrapper>
          <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </span>
      </Link>
    </motion.div>
  );
}
