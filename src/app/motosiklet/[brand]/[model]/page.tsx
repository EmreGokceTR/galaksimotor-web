import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE } from "@/config/site";
import {
  getMotoBrands,
  resolveModel,
  compatibleProducts,
} from "@/lib/moto";
import { MotoProductGrid } from "../../MotoProductGrid";

export const revalidate = 600;

export async function generateStaticParams() {
  const brands = await getMotoBrands();
  const params: { brand: string; model: string }[] = [];
  for (const b of brands) {
    for (const m of b.models) params.push({ brand: b.brandSlug, model: m.slug });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: { brand: string; model: string };
}): Promise<Metadata> {
  const m = await resolveModel(params.brand, params.model);
  if (!m) return { title: "Model bulunamadı" };
  const full = `${m.brand} ${m.model}`;
  const title = `${full} Yedek Parça & Aksesuar | ${SITE.name}`;
  const description = `${full} için uygun motosiklet yedek parça, aksesuar, bakım ve onarım. ${full} modeline uyumlu ürünler — Küçükçekmece / İstanbul Galaksi Motor, hızlı kargo ve uzman servis.`;
  return {
    title,
    description,
    keywords: [
      `${full} yedek parça`,
      `${m.model} yedek parça`,
      `${m.brand} yedek parça`,
      `${full} aksesuar`,
      `${full} servis`,
      `${m.brand} ${m.model} tamir`,
    ],
    alternates: { canonical: `${SITE.url}/motosiklet/${params.brand}/${params.model}` },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: `${SITE.url}/motosiklet/${params.brand}/${params.model}`,
      siteName: SITE.name,
      title,
      description,
    },
  };
}

export default async function ModelPage({
  params,
}: {
  params: { brand: string; model: string };
}) {
  const m = await resolveModel(params.brand, params.model);
  if (!m) notFound();

  const full = `${m.brand} ${m.model}`;
  const products = await compatibleProducts(m.motorcycleIds);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Anasayfa", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Motosiklet Markaları", item: `${SITE.url}/motosiklet` },
      { "@type": "ListItem", position: 3, name: m.brand, item: `${SITE.url}/motosiklet/${params.brand}` },
      { "@type": "ListItem", position: 4, name: full, item: `${SITE.url}/motosiklet/${params.brand}/${params.model}` },
    ],
  };
  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${full} Yedek Parça & Aksesuar`,
    description: `${full} modeline uyumlu motosiklet yedek parça ve aksesuarlar.`,
    url: `${SITE.url}/motosiklet/${params.brand}/${params.model}`,
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collection) }} />

      <nav className="mb-4 text-sm text-white/50">
        <Link href="/motosiklet" className="hover:text-brand-yellow">Motosikletler</Link>
        <span className="mx-2">/</span>
        <Link href={`/motosiklet/${params.brand}`} className="hover:text-brand-yellow">{m.brand}</Link>
        <span className="mx-2">/</span>
        <span className="text-white">{m.model}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white md:text-4xl">
          {full} <span className="text-gradient-gold">Yedek Parça &amp; Aksesuar</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
          {full} için uygun orijinal yedek parça, aksesuar, periyodik bakım ve
          onarım. Küçükçekmece / İstanbul Galaksi Motor olarak {full} modeline
          özel parça temini ve uzman servis sağlıyoruz.
          {m.years.length > 0 && (
            <> Desteklenen yıllar: {m.years.join(", ")}.</>
          )}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/randevu" className="rounded-full bg-brand-yellow px-5 py-2.5 text-sm font-semibold text-brand-black hover:bg-brand-yellow/80">
            Servis Randevusu Al
          </Link>
          <Link href="/iletisim" className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-white/80 hover:border-brand-yellow/40 hover:text-brand-yellow">
            Parça Sor
          </Link>
        </div>
      </header>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/70">
          {full} Uyumlu Ürünler
        </h2>
        <MotoProductGrid products={products} />
      </section>
    </div>
  );
}
