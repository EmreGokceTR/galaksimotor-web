import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { CategoryManager } from "./CategoryManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kategoriler · Admin" };

export default async function AdminCategoriesPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true, children: true } },
    },
    take: 500,
  });

  const data = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    parentId: c.parentId,
    productCount: c._count.products,
    childCount: c._count.children,
  }));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-white">Kategoriler</h1>
        <p className="mt-1 text-sm text-white/50">
          Ürün kategorilerini oluştur, düzenle, sırala. Alt kategori (üst
          kategori seçerek) tanımlayabilirsin. Bir kategori, içinde ürün veya
          alt kategori varken silinemez.
        </p>
      </header>

      <CategoryManager categories={data} />
    </div>
  );
}
