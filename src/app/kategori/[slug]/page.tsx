import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCatalog } from "@/components/ProductCatalog";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const cat = await prisma.category.findUnique({
    where: { slug: params.slug },
  });
  return {
    title: cat ? `${cat.name} - Galaksi Motor` : "Kategori",
    description: cat?.description ?? undefined,
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
