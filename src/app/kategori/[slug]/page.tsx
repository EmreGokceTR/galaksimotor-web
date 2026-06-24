import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCatalog } from "@/components/ProductCatalog";
import { SITE } from "@/config/site";

// ISR — kategori sayfası 60 saniyede bir yenilenir
export const revalidate = 60;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await prisma.category.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true },
  });
  if (!cat) return { title: "Kategori bulunamadı" };
  const title = `${cat.name} - Motosiklet Yedek Parça | ${SITE.name}`;
  const description =
    cat.description ??
    `${cat.name} kategorisinde orijinal motosiklet yedek parça ve aksesuarlar — Küçükçekmece / İstanbul Galaksi Motor'da uygun fiyat ve hızlı kargo ile.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE.url}/kategori/${params.slug}` },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: `${SITE.url}/kategori/${params.slug}`,
      siteName: SITE.name,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CategoryPage({ params }: Props) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });
  if (!category) notFound();

  const brandRows = await prisma.product.findMany({
    where: { categoryId: category.id, brand: { not: null } },
    distinct: ["brand"],
    select: { brand: true },
  });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Anasayfa", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Ürünler", item: `${SITE.url}/urunler` },
      { "@type": "ListItem", position: 3, name: category.name, item: `${SITE.url}/kategori/${category.slug}` },
    ],
  };
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} — ${SITE.name}`,
    description:
      category.description ??
      `${category.name} kategorisindeki motosiklet yedek parça ve aksesuarlar.`,
    url: `${SITE.url}/kategori/${category.slug}`,
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <h1 className="mb-2 text-3xl font-bold text-brand-yellow">
        {category.name}
      </h1>
      {category.description && (
        <p className="mb-6 text-white/60">{category.description}</p>
      )}
      <ProductCatalog
        initialCategorySlug={category.slug}
        brands={brandRows.map((b) => b.brand!).filter(Boolean)}
      />
    </div>
  );
}
