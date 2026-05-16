import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: ReactNode;
  description?: string;
};

export function InfoPageHero({ eyebrow, title, description }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(50% 60% at 50% 0%, rgba(255,215,0,0.15) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,215,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.08) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse 60% 80% at 50% 30%, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 80% at 50% 30%, black 30%, transparent 80%)",
        }}
      />
      <div className="mx-auto max-w-7xl px-6 py-16">
        <nav className="mb-4 text-xs text-white/55" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-brand-yellow">
            Anasayfa
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white/70">{eyebrow}</span>
        </nav>
        <span className="text-xs font-medium uppercase tracking-[0.25em] text-brand-yellow/80">
          · {eyebrow}
        </span>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-white md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/60">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}

export function InfoCard({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-7 backdrop-blur-md">
      {title && (
        <h3 className="mb-3 text-base font-semibold tracking-tight text-brand-yellow">
          {title}
        </h3>
      )}
      <div className="space-y-3 text-sm leading-relaxed text-white/75">
        {children}
      </div>
    </div>
  );
}
