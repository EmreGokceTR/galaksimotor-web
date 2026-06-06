"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { EditableWrapper } from "./EditableWrapper";

const EASE = [0.16, 1, 0.3, 1] as const;
const R = ["/"];

export type HeroSettings = {
  badge: string;
  title1: string;
  title2: string;
  title3: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  stat1v: string; stat1l: string;
  stat2v: string; stat2l: string;
  stat3v: string; stat3l: string;
  stat4v: string; stat4l: string;
  scrollText: string;
};

export function HomeHero({ settings: s }: { settings: HeroSettings }) {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div aria-hidden initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: EASE }}
          className="absolute left-[8%] top-[15%] h-72 w-72 rounded-full bg-brand-yellow/15 blur-[110px]" />
        <motion.div aria-hidden initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: EASE, delay: 0.2 }}
          className="absolute right-[5%] top-[25%] h-96 w-96 rounded-full bg-brand-yellow/10 blur-[140px]" />
        <motion.div aria-hidden initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, ease: EASE, delay: 0.4 }}
          className="absolute bottom-[-10%] left-[30%] h-80 w-80 rounded-full bg-brand-yellow/8 blur-[120px]" />
      </div>

      {/* Grid backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,215,0,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.18) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 80%)",
        }}
      />

      <div className="mx-auto flex min-h-[80vh] max-w-7xl flex-col items-center justify-center px-6 py-24 text-center">
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-yellow opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-yellow" />
          </span>
          <EditableWrapper table="siteSetting" id="hero_badge" field="value" value={s.badge} label="Hero Badge" revalidatePaths={R} as="span">
            {s.badge}
          </EditableWrapper>
        </motion.div>

        {/* Title */}
        <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.05 }}
          className="text-balance text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-[88px]"
        >
          <EditableWrapper table="siteSetting" id="hero_title_1" field="value" value={s.title1} label="Hero Satır 1" revalidatePaths={R} as="span" className="block text-white">
            <span className="block text-white">{s.title1}</span>
          </EditableWrapper>
          <EditableWrapper table="siteSetting" id="hero_title_2" field="value" value={s.title2} label="Hero Satır 2 (altın)" revalidatePaths={R} as="span" className="block text-gradient-gold">
            <span className="block text-gradient-gold">{s.title2}</span>
          </EditableWrapper>
          <EditableWrapper table="siteSetting" id="hero_title_3" field="value" value={s.title3} label="Hero Satır 3" revalidatePaths={R} as="span" className="block text-white">
            <span className="block text-white">{s.title3}</span>
          </EditableWrapper>
        </motion.h1>

        {/* Subtitle */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.25 }} className="mt-6 max-w-2xl">
          <EditableWrapper table="siteSetting" id="hero_subtitle" field="value" value={s.subtitle} label="Hero Alt Yazı" fieldType="textarea" revalidatePaths={R}>
            <p className="text-pretty text-base text-white/65 md:text-lg">{s.subtitle}</p>
          </EditableWrapper>
        </motion.div>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.4 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link href="/urunler" className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-brand-yellow px-7 py-3.5 text-sm font-semibold text-brand-black shadow-[0_18px_40px_-12px_rgba(255,215,0,0.7)] transition-all hover:shadow-[0_24px_50px_-10px_rgba(255,215,0,0.9)]">
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <EditableWrapper table="siteSetting" id="hero_cta_primary" field="value" value={s.ctaPrimary} label="Hero Birincil CTA" revalidatePaths={R} as="span" className="relative">
              <span className="relative">{s.ctaPrimary}</span>
            </EditableWrapper>
            <svg viewBox="0 0 16 16" className="relative h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
          <Link href="/randevu" className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:border-brand-yellow/60 hover:bg-white/10 hover:text-brand-yellow">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
            </svg>
            <EditableWrapper table="siteSetting" id="hero_cta_secondary" field="value" value={s.ctaSecondary} label="Hero İkincil CTA" revalidatePaths={R} as="span">
              {s.ctaSecondary}
            </EditableWrapper>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.6 }}
          className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md sm:grid-cols-4"
        >
          {([
            { vk: "hero_stat_1_v", lk: "hero_stat_1_l", v: s.stat1v, l: s.stat1l },
            { vk: "hero_stat_2_v", lk: "hero_stat_2_l", v: s.stat2v, l: s.stat2l },
            { vk: "hero_stat_3_v", lk: "hero_stat_3_l", v: s.stat3v, l: s.stat3l },
            { vk: "hero_stat_4_v", lk: "hero_stat_4_l", v: s.stat4v, l: s.stat4l },
          ] as const).map((x) => (
            <div key={x.lk} className="bg-black/20 px-4 py-5 text-center">
              <EditableWrapper table="siteSetting" id={x.vk} field="value" value={x.v} label={`Stat: ${x.l} (değer)`} revalidatePaths={R}>
                <div className="text-2xl font-bold text-gradient-gold md:text-3xl">{x.v}</div>
              </EditableWrapper>
              <EditableWrapper table="siteSetting" id={x.lk} field="value" value={x.l} label={`Stat: ${x.l} (etiket)`} revalidatePaths={R}>
                <div className="mt-0.5 text-[11px] uppercase tracking-wider text-white/50">{x.l}</div>
              </EditableWrapper>
            </div>
          ))}
        </motion.div>

        {/* Scroll cue */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-14 flex flex-col items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-white/30"
        >
          <EditableWrapper table="siteSetting" id="hero_scroll" field="value" value={s.scrollText} label="Scroll Göstergesi" revalidatePaths={R} as="span">
            {s.scrollText}
          </EditableWrapper>
          <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: [0.4, 0, 0.6, 1] }}
            className="inline-block h-6 w-px bg-gradient-to-b from-white/40 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
