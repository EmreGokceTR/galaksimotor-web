import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductCatalog } from "@/components/ProductCatalog";
import { AddRecordButton } from "@/components/AddRecordButton";
import { buildPageMetadata } from "@/lib/page-meta";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/urunler", {
    title: "Tüm Ürünler - Galaksi Motor",
    description: "Motosiklet yedek parça, bakım ürünleri ve aksesuarları.",
  });
}

export default async function ProductsPage() {
  const [brands, categories] = await Promise.all([
    prisma.product.findMany({
      where: { brand: { not: null } },
      distinct: ["brand"],
      select: { brand: true },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, slug: true, name: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-brand-yellow">Tüm Ürünler</h1>
        <AddRecordButton
          kind="product"
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          label="Yeni Ürün"
        />
      </div>
      <ProductCatalog
        brands={brands.map((b) => b.brand!).filter(Boolean)}
        showCategoryFilter
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
      />
    </div>
  );
}
