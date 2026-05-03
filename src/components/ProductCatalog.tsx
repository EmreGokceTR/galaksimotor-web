"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard, ProductCardData } from "./ProductCard";
import { useGarage } from "@/stores/garage";

type Props = {
  initialCategorySlug?: string;
  brands: string[];
  showCategoryFilter?: boolean;
  categories?: { slug: string; name: string }[];
};

export function ProductCatalog({
  initialCategorySlug,
  brands,
  showCategoryFilter = false,
  categories = [],
}: Props) {
  const [categorySlug, setCategorySlug] = useState(initialCategorySlug ?? "");
  const [brand, setBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStock, setInStock] = useState(false);
  const [search, setSearch] = useState("");
  const [filterByMyBike, setFilterByMyBike] = useState(false);

  const activeBike = useGarage((s) => s.active);

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  // Garaj seçimi yoksa filtreyi otomatik kapat
  useEffect(() => {
    if (!activeBike && filterByMyBike) setFilterByMyBike(false);
  }, [activeBike, filterByMyBike]);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (categorySlug) p.set("category", categorySlug);
    if (brand) p.set("brand", brand);
    if (minPrice) p.set("minPrice", minPrice);
    if (maxPrice) p.set("maxPrice", maxPrice);
    if (inStock) p.set("inStock", "true");
    if (search) p.set("search", search);
    if (filterByMyBike && activeBike)
      p.set("motoId", activeBike.motorcycleId);
    return p.toString();
  }, [categorySlug, brand, minPrice, maxPrice, inStock, search, filterByMyBike, activeBike]);

  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    const handle = setTimeout(() => {
      fetch(`/api/products?${queryString}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((data) => {
          setProducts(data.products ?? []);
          setLoading(false);
        })
        .catch(() => {});
    }, 200);
    return () => {
      controller.abort();
      clearTimeout(handle);
    };
  }, [queryString]);

  function clearFilters() {
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
    setSearch("");
    setFilterByMyBike(false);
    if (showCategoryFilter) setCategorySlug("");
  }

  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      <aside className="space-y-6 rounded-lg border border-white/10 bg-white/5 p-5">
        {activeBike && (
          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-brand-yellow/30 bg-brand-yellow/[0.05] p-3 text-sm">
            <input
              type="checkbox"
              checked={filterByMyBike}
              onChange={(e) => setFilterByMyBike(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-brand-yellow"
            />
            <span>
              <span className="block text-brand-yellow">
                Sadece motorum için
              </span>
              <span className="text-[11px] text-white/55">
                {activeBike.brand} {activeBike.model} ({activeBike.year})
              </span>
            </span>
          </label>
        )}

        <div>
          <label className="mb-1 block text-sm text-white/70">Arama</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ürün adı..."
            className="w-full rounded bg-white/5 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-brand-yellow"
          />
        </div>

        {showCategoryFilter && categories.length > 0 && (
          <div>
            <label className="mb-1 block text-sm text-white/70">Kategori</label>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="w-full rounded bg-white/5 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-brand-yellow"
            >
              <option value="">Tümü</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm text-white/70">Marka</label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full rounded bg-white/5 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-brand-yellow"
          >
            <option value="">Tümü</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-white/70">Fiyat (₺)</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-1/2 rounded bg-white/5 px-2 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-brand-yellow"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-1/2 rounded bg-white/5 px-2 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-brand-yellow"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            className="h-4 w-4 accent-brand-yellow"
          />
          Sadece stokta olanlar
        </label>

        <button
          onClick={clearFilters}
          className="w-full rounded border border-white/20 py-2 text-sm hover:border-brand-yellow hover:text-brand-yellow"
        >
          Filtreleri Temizle
        </button>
      </aside>

      <section>
        <div className="mb-4 flex items-center justify-between text-sm text-white/60">
          <span>
            {loading ? "Yükleniyor..." : `${products.length} ürün bulundu`}
          </span>
        </div>

        {!loading && products.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-10 text-center text-white/60">
            Filtrelere uygun ürün bulunamadı.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
