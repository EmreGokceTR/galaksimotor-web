import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductRow } from "./ProductRow";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Ürünler</h2>
          <p className="text-sm text-white/50">
            Toplam {products.length} ürün — fiyat, stok, görünürlük
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden rounded-xl border border-white/10 bg-white/[0.025] px-3 py-1.5 text-[11px] text-white/55 backdrop-blur-md md:block">
            💡 <code className="text-brand-yellow">npm run images</code> ile
            görsel
          </div>
          <Link
            href="/admin/urunler/yeni"
            className="rounded-full bg-brand-yellow px-4 py-2 text-sm font-semibold text-brand-black"
          >
            + Yeni Ürün
          </Link>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/[0.02] text-left text-[11px] uppercase tracking-wider text-white/45">
              <tr>
                <th className="px-4 py-3">Ürün</th>
                <th className="px-4 py-3">Fiyat (₺)</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3">Aktif</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p) => (
                <ProductRow
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  slug={p.slug}
                  sku={p.sku}
                  category={p.category.name}
                  initialPrice={Number(p.price)}
                  initialStock={p.stock}
                  initialActive={p.isActive}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 text-xs text-white/45">
        Detaylı düzenleme için ürünün{" "}
        <Link href="/urunler" className="text-brand-yellow underline">
          kamuya açık sayfasına
        </Link>{" "}
        gidebilirsin.
      </p>
    </div>
  );
}
