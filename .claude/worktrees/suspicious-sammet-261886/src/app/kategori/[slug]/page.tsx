import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCatalog } from "@/components/ProductCatalog";
import { SITE } from "@/config/site";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await prisma.category.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true },
  });
  if (!cat) return { title: "Kategori bulunamadı" };
  const title = `${cat.name} - ${SITE.name}`;
  const description = cat.description ?? `${cat.name} kategorisindeki tüm motosiklet yedek parça ve aksesuarlar.`;
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

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
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
