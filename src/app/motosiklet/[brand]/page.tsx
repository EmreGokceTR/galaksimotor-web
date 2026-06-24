import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE } from "@/config/site";
import {
  getMotoBrands,
  resolveBrand,
  compatibleProductsByBrand,
} from "@/lib/moto";
import { MotoProductGrid } from "../MotoProductGrid";

export const revalidate = 600;

export async function generateStaticParams() {
  const brands = await getMotoBrands();
  return brands.map((b) => ({ brand: b.brandSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: { brand: string };
}): Promise<Metadata> {
  const b = await resolveBrand(params.brand);
  if (!b) return { title: "Marka bulunamadı" };
  const title = `${b.brand} Yedek Parça & Aksesuar — Servis | ${SITE.name}`;
  const description = `${b.brand} motosiklet yedek parça, aksesuar, bakım ve onarım. ${b.brand} modellerine uygun ürünler — Küçükçekmece / İstanbul Galaksi Motor, hızlı kargo ve uzman servis.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE.url}/motosiklet/${b.brandSlug}` },
    openGraph: { type: "website", locale: "tr_TR", url: `${SITE.url}/motosiklet/${b.brandSlug}`, siteName: SITE.name, title, description },
  };
}

export default async function BrandPage({
  params,
}: {
  params: { brand: string };
}) {
  const b = await resolveBrand(params.brand);
  if (!b) notFound();

  const products = await compatibleProductsByBrand(b.brand);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Anasayfa", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Motosiklet Markaları", item: `${SITE.url}/motosiklet` },
      { "@type": "ListItem", position: 3, name: b.brand, item: `${SITE.url}/motosiklet/${b.brandSlug}` },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <nav className="mb-4 text-sm text-white/50">
        <Link href="/motosiklet" className="hover:text-brand-yellow">Motosikletler</Link>
        <span className="mx-2">/</span>
        <span className="text-white">{b.brand}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white md:text-4xl">
          {b.brand} <span className="text-gradient-gold">Yedek Parça &amp; Aksesuar</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
          {b.brand} motosikletleriniz için orijinal yedek parça, aksesuar, bakım
          ve onarım hizmeti. Küçükçekmece / İstanbul Galaksi Motor olarak {b.brand}{" "}
          modellerine uygun ürünleri temin ediyor, uzman servis sağlıyoruz.
        </p>
      </header>

      {/* Modeller */}
      {b.models.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/70">
            {b.brand} Modelleri
          </h2>
          <div className="flex flex-wrap gap-2">
            {b.models.map((m) => (
              <Link
                key={m.slug}
                href={`/motosiklet/${b.brandSlug}/${m.slug}`}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/80 transition hover:border-brand-yellow/40 hover:text-brand-yellow"
              >
                {b.brand} {m.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/70">
          {b.brand} Uyumlu Ürünler
        </h2>
        <MotoProductGrid products={products} />
      </section>
    </div>
  );
}
