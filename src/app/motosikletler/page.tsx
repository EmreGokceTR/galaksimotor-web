import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/config/site";

export const revalidate = 120;

export function generateMetadata(): Metadata {
  const title = `Vitrin — Satılık Motosikletler | ${SITE.name}`;
  const description =
    "Galaksi Motor vitrininde satılık ikinci el motosiklet ilanları. Fotoğraf, teknik özellik ve fiyat bilgisi — satış mağazamızda elden, noter huzurunda yapılır.";
  return {
    title,
    description,
    alternates: { canonical: `${SITE.url}/motosikletler` },
    openGraph: { type: "website", locale: "tr_TR", url: `${SITE.url}/motosikletler`, siteName: SITE.name, title, description },
    twitter: { card: "summary", title, description },
  };
}

const fmt = (n: number) => n.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export default async function MotorcycleShowcasePage() {
  const listings = await prisma.motorcycleListing.findMany({
    where: { isActive: true },
    orderBy: [{ stokDurumu: "desc" }, { createdAt: "desc" }],
  });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Anasayfa", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Vitrin", item: `${SITE.url}/motosikletler` },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <header className="mb-8">
        <span className="text-xs font-medium uppercase tracking-[0.25em] text-brand-yellow/80">· Vitrin</span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
          Satılık <span className="text-gradient-gold">Motosikletler</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
          Vitrinimizdeki araçlar yalnızca ilan amaçlıdır — sitemiz üzerinden ödeme alınmaz. Beğendiğiniz aracı
          incelemek ve satın almak için mağazamıza gelmeniz yeterli; işlem elden ve noter huzurunda, tamamen yasal
          şekilde tamamlanır.
        </p>
      </header>

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center">
          <p className="text-sm text-white/55">Şu anda vitrinde ilan bulunmuyor. Yakında yeni araçlar eklenecek.</p>
          <Link href="/iletisim" className="mt-4 inline-block text-sm text-brand-yellow underline">
            Elinde satılık motosiklet mi var? Bize ulaş
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((m) => (
            <Link
              key={m.id}
              href={`/motosikletler/${m.id}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-md transition-all duration-300 hover:border-brand-yellow/50 hover:shadow-[0_18px_40px_-15px_rgba(255,215,0,0.35)]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-white/[0.04] to-black/30">
                {m.images[0] ? (
                  <Image
                    src={m.images[0]}
                    alt={`${m.marka} ${m.model}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-white/20">🏍</div>
                )}
                {!m.stokDurumu && (
                  <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur-md">
                    Satıldı
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1 p-5">
                <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/55">{m.marka}</span>
                <h3 className="text-[15px] font-semibold leading-snug text-white transition-colors group-hover:text-brand-yellow">
                  {m.model}
                </h3>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-white/45">
                  <span>{m.yil}</span>
                  {m.cc && <span>{m.cc} cc</span>}
                  {m.km != null && <span>{m.km.toLocaleString("tr-TR")} km</span>}
                </div>
                <div className="mt-3 border-t border-white/5 pt-3 text-xl font-bold text-gradient-gold">
                  {fmt(Number(m.fiyat))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
