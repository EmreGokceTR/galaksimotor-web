import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/ProductGallery";
import { SITE } from "@/config/site";

export const revalidate = 120;
export const dynamicParams = true;

export async function generateStaticParams() {
  const listings = await prisma.motorcycleListing.findMany({
    where: { isActive: true },
    select: { id: true },
  });
  return listings.map((l) => ({ id: l.id }));
}

type Props = { params: { id: string } };

const fmt = (n: number) => n.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = await prisma.motorcycleListing.findUnique({ where: { id: params.id } });
  if (!m || !m.isActive) return { title: "İlan bulunamadı" };
  const title = `${m.marka} ${m.model} (${m.yil}) — ${fmt(Number(m.fiyat))} | Vitrin`;
  const description = m.aciklama ?? `${m.marka} ${m.model} ${m.yil} model, ${fmt(Number(m.fiyat))} fiyatla Galaksi Motor vitrininde. Mağazamızdan inceleyebilirsiniz.`;
  const image = m.images[0];
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
      images: image ? [{ url: image, alt: `${m.marka} ${m.model}` }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
    robots: m.stokDurumu ? undefined : { index: false, follow: true },
  };
}

export default async function MotorcycleListingDetailPage({ params }: Props) {
  const m = await prisma.motorcycleListing.findUnique({ where: { id: params.id } });
  if (!m || !m.isActive) notFound();

  const waMessage = encodeURIComponent(`Merhaba, vitrindeki ${m.marka} ${m.model} (${m.yil}) ile ilgileniyorum.`);
  const waHref = `https://wa.me/${SITE.whatsapp}?text=${waMessage}`;
  const telHref = `tel:${SITE.phone.replace(/\s+/g, "")}`;

  const specs: { label: string; value: string }[] = [
    { label: "Marka", value: m.marka },
    { label: "Model", value: m.model },
    { label: "Yıl", value: String(m.yil) },
    ...(m.cc ? [{ label: "Motor Hacmi", value: `${m.cc} cc` }] : []),
    ...(m.km != null ? [{ label: "Kilometre", value: `${m.km.toLocaleString("tr-TR")} km` }] : []),
    ...(m.renk ? [{ label: "Renk", value: m.renk }] : []),
    { label: "Durum", value: m.stokDurumu ? "Satılık" : "Satıldı" },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Anasayfa", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Vitrin", item: `${SITE.url}/motosikletler` },
      { "@type": "ListItem", position: 3, name: `${m.marka} ${m.model}`, item: `${SITE.url}/motosikletler/${m.id}` },
    ],
  };

  // Vehicle şeması — Product/Offer DEĞİL: sitede satın alma akışı yok, ilan bilgilendirme amaçlı.
  const vehicleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Motorcycle",
    name: `${m.marka} ${m.model}`,
    brand: { "@type": "Brand", name: m.marka },
    model: m.model,
    vehicleModelDate: String(m.yil),
    ...(m.cc ? { vehicleEngine: { "@type": "EngineSpecification", engineDisplacement: `${m.cc} cc` } } : {}),
    ...(m.km != null ? { mileageFromOdometer: { "@type": "QuantitativeValue", value: m.km, unitCode: "KMT" } } : {}),
    ...(m.renk ? { color: m.renk } : {}),
    image: m.images.length > 0 ? m.images : undefined,
    url: `${SITE.url}/motosikletler/${m.id}`,
    offers: {
      "@type": "Offer",
      price: Number(m.fiyat).toFixed(2),
      priceCurrency: "TRY",
      availability: m.stokDurumu ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      seller: { "@type": "Organization", name: SITE.name, url: SITE.url },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleJsonLd) }} />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <nav className="mb-4 text-sm text-white/50">
          <Link href="/" className="hover:text-brand-yellow">Anasayfa</Link>
          <span className="mx-2">/</span>
          <Link href="/motosikletler" className="hover:text-brand-yellow">Vitrin</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{m.marka} {m.model}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-2">
          <ProductGallery images={m.images.map((url) => ({ url, alt: `${m.marka} ${m.model}` }))} />

          <div className="space-y-4">
            <div>
              <span className="text-sm uppercase text-white/50">{m.marka}</span>
              <h1 className="text-3xl font-bold text-white">{m.model}</h1>
              <span className="mt-1 block text-sm text-white/45">{m.yil} model</span>
            </div>

            <div className="text-3xl font-bold text-brand-yellow">{fmt(Number(m.fiyat))}</div>

            {m.stokDurumu ? (
              <div className="inline-block rounded bg-green-500/20 px-3 py-1 text-sm text-green-400">Satılık</div>
            ) : (
              <div className="inline-block rounded bg-red-500/20 px-3 py-1 text-sm text-red-400">Satıldı</div>
            )}

            {m.aciklama && <p className="whitespace-pre-line text-white/80 leading-relaxed">{m.aciklama}</p>}

            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <h3 className="mb-2 text-sm font-semibold text-brand-yellow">Özellikler</h3>
              <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
                {specs.map((s) => (
                  <div key={s.label} className="contents">
                    <dt className="text-white/50">{s.label}</dt>
                    <dd className="text-white/85">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {m.stokDurumu && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-6 py-3 text-sm font-semibold text-brand-black shadow-[0_18px_40px_-12px_rgba(255,215,0,0.7)] transition hover:brightness-110"
                  >
                    WhatsApp'tan Sor
                  </a>
                  <a
                    href={telHref}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:border-brand-yellow/50 hover:text-brand-yellow"
                  >
                    Bizi Ara
                  </a>
                </div>
                <p className="text-xs leading-relaxed text-white/45">
                  Bu ilan yalnızca bilgilendirme amaçlıdır — sitemiz üzerinden ödeme alınmaz. Satış işlemi
                  mağazamızda ({SITE.address.district} / {SITE.address.city}), aracı yerinde inceledikten sonra
                  elden ve noter huzurunda, yasal şekilde tamamlanır.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
