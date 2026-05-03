import { prisma } from "@/lib/prisma";
import { ProductCatalog } from "@/components/ProductCatalog";

export const metadata = {
  title: "Tüm Ürünler - Galaksi Motor",
  description: "Motosiklet yedek parça, bakım ürünleri ve aksesuarları.",
};

export default async function ProductsPage() {
  const [brands, categories] = await Promise.all([
    prisma.product.findMany({
      where: { brand: { not: null } },
      distinct: ["brand"],
      select: { brand: true },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold text-brand-yellow">Tüm Ürünler</h1>
      <ProductCatalog
        brands={brands.map((b) => b.brand!).filter(Boolean)}
        showCategoryFilter
        categories={categories}
      />
    </div>
  );
}
