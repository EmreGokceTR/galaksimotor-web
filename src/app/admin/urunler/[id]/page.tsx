import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { ImageUploader } from "@/components/ImageUploader";
import {
  updateProductDetails,
  addProductImage,
  deleteProductImage,
  upsertVariant,
  deleteVariant,
} from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ürün Düzenle · Admin" };

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40 placeholder:text-white/25";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: { name: "asc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/urunler" className="text-xs text-white/50 hover:text-brand-yellow">
          ← Ürünler
        </Link>
        <div className="flex gap-2">
          <Link href={`/admin/urunler/${product.id}/fitments`} className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/75 hover:text-brand-yellow">
            🔧 Uyumluluk
          </Link>
          <Link href={`/urun/${product.slug}`} target="_blank" className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/75 hover:text-brand-yellow">
            ↗ Sitede gör
          </Link>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-white">{product.name}</h1>

      {/* ── Ana bilgiler ── */}
      <form action={updateProductDetails} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <input type="hidden" name="id" value={product.id} />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">Ürün Bilgileri</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <L label="Ürün Adı *"><input name="name" required defaultValue={product.name} className={inputCls} /></L>
          <L label="Slug (URL) *"><input name="slug" required defaultValue={product.slug} className={inputCls} /></L>
          <L label="SKU *"><input name="sku" required defaultValue={product.sku} className={inputCls} /></L>
          <L label="Marka"><input name="brand" defaultValue={product.brand ?? ""} className={inputCls} /></L>
          <L label="Fiyat (₺) *"><input name="price" type="number" step="0.01" required defaultValue={Number(product.price)} className={inputCls} /></L>
          <L label="Stok *"><input name="stock" type="number" required defaultValue={product.stock} className={inputCls} /></L>
        </div>
        <L label="Kategori *">
          <select name="categoryId" required defaultValue={product.categoryId} className={inputCls}>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-brand-black">{c.name}</option>
            ))}
          </select>
        </L>
        <L label="Açıklama">
          <textarea name="description" rows={4} defaultValue={product.description ?? ""} className={inputCls + " resize-none"} />
        </L>
        <label className="flex cursor-pointer items-center gap-3">
          <input type="checkbox" name="isActive" value="1" defaultChecked={product.isActive} className="h-4 w-4 accent-brand-yellow" />
          <span className="text-sm text-white/80">Aktif (sitede satışta görünür)</span>
        </label>
        <div className="flex justify-end border-t border-white/10 pt-4">
          <button type="submit" className="rounded-xl bg-brand-yellow px-6 py-2.5 text-sm font-semibold text-black hover:bg-brand-yellow/80">
            Kaydet
          </button>
        </div>
      </form>

      {/* ── Görseller ── */}
      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">
          Görseller ({product.images.length})
        </h2>
        {product.images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {product.images.map((img) => (
              <div key={img.id} className="relative overflow-hidden rounded-lg border border-white/10 bg-black/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt ?? product.name} className="aspect-square w-full object-cover" />
                <form action={deleteProductImage} className="absolute right-1.5 top-1.5">
                  <input type="hidden" name="imageId" value={img.id} />
                  <button type="submit" className="rounded-full bg-black/70 px-2 py-1 text-[11px] text-white/90 backdrop-blur-sm hover:bg-rose-500/80" title="Görseli sil">✕</button>
                </form>
              </div>
            ))}
          </div>
        )}
        <form action={addProductImage} className="space-y-3 border-t border-white/10 pt-4">
          <input type="hidden" name="productId" value={product.id} />
          <ImageUploader name="imageUrl" label="Yeni görsel ekle" folder="products" required />
          <input name="alt" placeholder="Görsel açıklaması (alt — SEO/erişilebilirlik)" className={inputCls} />
          <div className="flex justify-end">
            <button type="submit" className="rounded-xl border border-brand-yellow/40 bg-brand-yellow/10 px-5 py-2 text-sm font-semibold text-brand-yellow hover:bg-brand-yellow/20">
              + Görsel Ekle
            </button>
          </div>
        </form>
      </section>

      {/* ── Varyantlar ── */}
      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">
          Varyantlar ({product.variants.length})
        </h2>
        <p className="text-[11px] text-white/40">
          Renk, beden gibi seçenekler. Kendi SKU, fiyat ve stoğu olabilir. Fiyat
          boşsa ana ürün fiyatı geçerlidir.
        </p>

        {product.variants.map((v) => (
          <div key={v.id} className="flex flex-wrap items-end gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <form action={upsertVariant} className="flex flex-1 flex-wrap items-end gap-2">
              <input type="hidden" name="variantId" value={v.id} />
              <input type="hidden" name="productId" value={product.id} />
              <L label="Tür" className="min-w-[110px] flex-1"><input name="name" defaultValue={v.name} placeholder="Renk" className={inputCls} /></L>
              <L label="Değer" className="min-w-[110px] flex-1"><input name="value" defaultValue={v.value} placeholder="Kırmızı" className={inputCls} /></L>
              <L label="SKU" className="min-w-[100px] flex-1"><input name="sku" defaultValue={v.sku ?? ""} className={inputCls} /></L>
              <L label="Fiyat" className="w-24"><input name="price" type="number" step="0.01" defaultValue={v.price !== null ? Number(v.price) : ""} className={inputCls} /></L>
              <L label="Stok" className="w-20"><input name="stock" type="number" defaultValue={v.stock} className={inputCls} /></L>
              <button type="submit" className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white hover:bg-white/20">Kaydet</button>
            </form>
            <form action={deleteVariant}>
              <input type="hidden" name="variantId" value={v.id} />
              <button type="submit" className="rounded-lg border border-white/15 px-3 py-2 text-xs text-rose-400/80 hover:text-rose-400" title="Varyantı sil">Sil</button>
            </form>
          </div>
        ))}

        {/* Yeni varyant */}
        <form action={upsertVariant} className="flex flex-wrap items-end gap-2 border-t border-white/10 pt-4">
          <input type="hidden" name="productId" value={product.id} />
          <L label="Tür" className="min-w-[110px] flex-1"><input name="name" placeholder="Renk / Beden" className={inputCls} /></L>
          <L label="Değer" className="min-w-[110px] flex-1"><input name="value" placeholder="Kırmızı / XL" className={inputCls} /></L>
          <L label="SKU" className="min-w-[100px] flex-1"><input name="sku" className={inputCls} /></L>
          <L label="Fiyat" className="w-24"><input name="price" type="number" step="0.01" placeholder="(ops.)" className={inputCls} /></L>
          <L label="Stok" className="w-20"><input name="stock" type="number" defaultValue={0} className={inputCls} /></L>
          <button type="submit" className="rounded-lg border border-brand-yellow/40 bg-brand-yellow/10 px-4 py-2 text-xs font-semibold text-brand-yellow hover:bg-brand-yellow/20">+ Ekle</button>
        </form>
      </section>
    </div>
  );
}

function L({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/55">{label}</span>
      {children}
    </label>
  );
}
