import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createProduct } from "./actions";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Yeni Ürün Ekle</h2>
          <p className="text-sm text-white/55">Tüm zorunlu alanları doldur.</p>
        </div>
        <Link
          href="/admin/urunler"
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-brand-yellow"
        >
          ← Geri
        </Link>
      </header>

      <form
        action={createProduct}
        className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.025] p-6 backdrop-blur-md"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ürün Adı *" name="name" required placeholder="CVT Kayışı Honda PCX" />
          <Field label="Slug (URL) *" name="slug" required placeholder="cvt-kayisi-honda-pcx" />
          <Field label="SKU *" name="sku" required placeholder="CVT-XYZ-001" />
          <Field label="Marka" name="brand" placeholder="Honda / Bajaj / vs." />
          <Field
            label="Fiyat (₺) *"
            name="price"
            type="number"
            step="0.01"
            required
          />
          <Field
            label="Stok *"
            name="stock"
            type="number"
            required
            defaultValue="0"
          />
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/55">
            Kategori *
          </span>
          <select
            name="categoryId"
            required
            className="input-glass w-full rounded-lg px-3 py-2.5 text-sm outline-none"
          >
            <option value="">— Seç —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-brand-black">
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <Field
          label="Görsel URL"
          name="imageUrl"
          placeholder="/urunler/cvt.jpg veya https://..."
        />

        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/55">
            Açıklama
          </span>
          <textarea
            name="description"
            rows={4}
            placeholder="Ürün hakkında detaylı bilgi..."
            className="input-glass w-full resize-none rounded-lg px-3 py-2.5 text-sm outline-none"
          />
        </label>

        <div className="flex justify-end gap-2 border-t border-white/10 pt-5">
          <Link
            href="/admin/urunler"
            className="rounded-full border border-white/15 px-5 py-2 text-sm text-white/70"
          >
            İptal
          </Link>
          <button
            type="submit"
            className="rounded-full bg-brand-yellow px-5 py-2 text-sm font-semibold text-brand-black"
          >
            Ürünü Oluştur
          </button>
        </div>
      </form>
    </div>
  );
}

function Field(props: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/55">
        {props.label}
      </span>
      <input
        {...props}
        className="input-glass w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none"
      />
    </label>
  );
}
