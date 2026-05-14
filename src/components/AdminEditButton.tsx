"use client";

import { useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { inlineUpdateProduct } from "@/app/admin/urunler/inlineEdit";

type ProductSnapshot = {
  id: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  image: string | null;
  sku?: string;
  brand?: string | null;
  description?: string | null;
};

const spring = { type: "spring" as const, stiffness: 420, damping: 32 };

export function AdminEditButton({ product }: { product: ProductSnapshot }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock));
  const [imageUrl, setImageUrl] = useState(product.image ?? "");
  const [sku, setSku] = useState(product.sku ?? "");
  const [brand, setBrand] = useState(product.brand ?? "");
  const [description, setDescription] = useState(product.description ?? "");

  // Sync fields from (possibly refreshed) props when modal opens
  useEffect(() => {
    if (open) {
      setName(product.name);
      setPrice(String(product.price));
      setStock(String(product.stock));
      setImageUrl(product.image ?? "");
      setSku(product.sku ?? "");
      setBrand(product.brand ?? "");
      setDescription(product.description ?? "");
    }
  }, [open, product]);

  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
    return null;
  }

  function handleSave() {
    startTransition(async () => {
      await inlineUpdateProduct(product.id, {
        name: name.trim() || product.name,
        price: parseFloat(price) || product.price,
        stock: parseInt(stock) ?? product.stock,
        imageUrl: imageUrl.trim() || null,
        slug: product.slug,
        sku: sku.trim() || undefined,
        brand: brand.trim() || null,
        description: description.trim() || null,
      });
      setOpen(false);
    });
  }

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label="Ürünü düzenle"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white/80 backdrop-blur-md ring-1 ring-white/20 transition-all duration-200 hover:bg-brand-yellow hover:text-brand-black hover:ring-brand-yellow hover:shadow-[0_0_12px_rgba(255,215,0,0.5)]"
      >
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5z" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/65 backdrop-blur-sm"
              onClick={() => !isPending && setOpen(false)}
            />

            {/* card */}
            <motion.div
              className="glass-strong relative z-10 w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]"
              initial={{ scale: 0.88, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.88, y: 20, opacity: 0 }}
              transition={spring}
            >
              {/* header */}
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Ürünü Düzenle</h2>
                <button
                  onClick={() => !isPending && setOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                    <path d="M3 3l10 10M13 3L3 13" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">
                    Ürün Adı
                  </span>
                  <input
                    className="input-glass w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isPending}
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">
                      Fiyat (₺)
                    </span>
                    <input
                      className="input-glass w-full"
                      type="number"
                      min={0}
                      step={0.01}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={isPending}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">
                      Stok (adet)
                    </span>
                    <input
                      className="input-glass w-full"
                      type="number"
                      min={0}
                      step={1}
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      disabled={isPending}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">
                      SKU
                    </span>
                    <input
                      className="input-glass w-full"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      disabled={isPending}
                      placeholder="TLF-403"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">
                      Marka
                    </span>
                    <input
                      className="input-glass w-full"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      disabled={isPending}
                      placeholder="Honda, Bajaj…"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">
                    Açıklama
                  </span>
                  <textarea
                    className="input-glass w-full resize-none"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isPending}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">
                    Görsel URL
                  </span>
                  <input
                    className="input-glass w-full"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={isPending}
                  />
                  {imageUrl && (
                    <div className="mt-2 h-24 w-24 overflow-hidden rounded-lg border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="önizleme"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => !isPending && setOpen(false)}
                  disabled={isPending}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/10 disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="flex-1 rounded-xl bg-brand-yellow py-2.5 text-sm font-semibold text-brand-black transition-all hover:brightness-110 disabled:opacity-60"
                >
                  {isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                      Kaydediliyor…
                    </span>
                  ) : (
                    "Kaydet"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
