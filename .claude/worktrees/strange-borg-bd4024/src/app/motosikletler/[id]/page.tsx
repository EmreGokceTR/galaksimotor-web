import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminMotorcycleEditButton } from "@/components/AdminMotorcycleEditButton";
import { SITE } from "@/config/site";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = await prisma.motorcycleListing.findUnique({
    where: { id: params.id },
    select: { marka: true, model: true, yil: true, cc: true, fiyat: true, aciklama: true, gorsel: true },
  });
  if (!m) return { title: "Motosiklet bulunamadı" };
  const title = `${m.marka} ${m.model} (${m.yil}) - ${SITE.name}`;
  const description =
    m.aciklama ??
    `${m.yil} model ${m.marka} ${m.model}${m.cc ? ` ${m.cc}cc` : ""} satılık — ${SITE.name}.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE.url}/motosikletler/${params.id}` },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: `${SITE.url}/motosikletler/${params.id}`,
      siteName: SITE.name,
      title,
      description,
      ...(m.gorsel ? { images: [{ url: m.gorsel, alt: `${m.marka} ${m.model}` }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(m.gorsel ? { images: [m.gorsel] } : {}),
    },
  };
}

export default async function MotorcycleDetailPage({ params }: Props) {
  const moto = await prisma.motorcycleListing.findUnique({
    where: { id: params.id },
  });

  if (!moto || !moto.isActive) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-white/50">
        <Link href="/" className="hover:text-brand-yellow">Anasayfa</Link>
        <span className="mx-2">/</span>
        <Link href="/motosikletler" className="hover:text-brand-yellow">Motosikletler</Link>
        <span className="mx-2">/</span>
        <span className="text-white">{moto.marka} {moto.model}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Image */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] aspect-[4/3]">
          {moto.gorsel ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={moto.gorsel}
              alt={`${moto.marka} ${moto.model}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/15">
              <svg viewBox="0 0 64 64" className="h-20 w-20" fill="none" stroke="currentColor" strokeWidth={1.2}>
                <circle cx="14" cy="42" r="10" />
                <circle cx="50" cy="42" r="10" />
                <path d="M24 42h12M36 42l8-16h-8l-4 8H20l-4 6" />
                <path d="M44 26l-4-6h-8" />
              </svg>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-5">
          {/* Title row */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm uppercase tracking-wider text-white/40">{moto.marka}</span>
              <AdminMotorcycleEditButton
                moto={{
                  id: moto.id,
                  marka: moto.marka,
                  model: moto.model,
                  yil: moto.yil,
                  cc: moto.cc,
                  fiyat: Number(moto.fiyat),
                  stokDurumu: moto.stokDurumu,
                  gorsel: moto.gorsel,
                  aciklama: moto.aciklama,
                }}
              />
            </div>
            <h1 className="text-3xl font-bold text-white">
              {moto.marka} {moto.model}
            </h1>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">
              📅 {moto.yil} Model
            </span>
            {moto.cc && (
              <span className="rounded-full border border-brand-yellow/20 bg-brand-yellow/10 px-3 py-1 text-sm font-semibold text-brand-yellow">
                ⚡ {moto.cc} CC
              </span>
            )}
          </div>

          {/* Price */}
          <div className="text-4xl font-bold text-brand-yellow">
            {Number(moto.fiyat).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
          </div>

          {/* Stock */}
          {moto.stokDurumu ? (
            <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-300 ring-1 ring-emerald-400/25">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
              Müsait
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-lg bg-rose-500/15 px-4 py-2 text-sm font-medium text-rose-300 ring-1 ring-rose-400/25">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              Satıldı
            </div>
          )}

          {/* Description */}
          {moto.aciklama && (
            <p className="leading-relaxed text-white/70">{moto.aciklama}</p>
          )}

          {/* Specs table */}
          <div className="rounded-xl border border-white/10 bg-white/[0.025] overflow-hidden">
            <div className="border-b border-white/5 px-4 py-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Teknik Bilgiler</h3>
            </div>
            <div className="divide-y divide-white/5">
              {[
                { label: "Marka", value: moto.marka },
                { label: "Model", value: moto.model },
                { label: "Yıl", value: String(moto.yil) },
                ...(moto.cc ? [{ label: "Motor Hacmi", value: `${moto.cc} CC` }] : []),
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-white/50">{row.label}</span>
                  <span className="text-sm font-medium text-white">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/iletisim"
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-yellow py-3.5 text-sm font-bold text-brand-black shadow-[0_8px_24px_-8px_rgba(255,215,0,0.6)] transition hover:shadow-[0_12px_32px_-6px_rgba(255,215,0,0.8)] hover:brightness-105"
          >
            İletişime Geç
            <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
