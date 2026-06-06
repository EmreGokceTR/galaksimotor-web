import type { ReactNode } from "react";
import { InfoPageHero } from "@/components/InfoPageHero";

export function LegalPage({
  eyebrow,
  title,
  description,
  updatedAt,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  updatedAt?: string;
  children: ReactNode;
}) {
  return (
    <>
      <InfoPageHero
        eyebrow={eyebrow}
        title={title}
        description={description}
      />
      <div className="mx-auto max-w-3xl px-6 py-14">
        {updatedAt && (
          <p className="mb-6 inline-block rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-wider text-white/50">
            Son güncelleme: {updatedAt}
          </p>
        )}
        <article className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.025] p-8 leading-relaxed text-white/75 backdrop-blur-md">
          {children}
        </article>
      </div>
    </>
  );
}

export function LegalSection({
  number,
  title,
  children,
}: {
  number?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-brand-yellow">
        {number && (
          <span className="mr-2 inline-block min-w-[1.75rem] text-brand-yellow/60">
            {number}.
          </span>
        )}
        {title}
      </h2>
      <div className="space-y-3 text-[15px] text-white/70">{children}</div>
    </section>
  );
}

export function LegalSubheading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-4 text-sm font-semibold uppercase tracking-wider text-white">
      {children}
    </h3>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="ml-5 list-disc space-y-1.5 text-[15px] text-white/70 marker:text-brand-yellow/60">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
