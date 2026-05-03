"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/stores/cart";

type VariantOption = { id: string; value: string; sku: string | null };
type VariantGroup = { name: string; options: VariantOption[] };

type Props = {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  price: number;
  image: string | null;
  stock: number;
  variantGroups: VariantGroup[];
};

export function ProductPurchasePanel({
  productId,
  slug,
  name,
  sku,
  price,
  image,
  stock,
  variantGroups,
}: Props) {
  const [selected, setSelected] = useState<Record<string, VariantOption>>({});
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const add = useCart((s) => s.add);

  const allRequiredSelected = useMemo(
    () => variantGroups.every((g) => selected[g.name]),
    [variantGroups, selected]
  );

  const disabled = stock === 0 || !allRequiredSelected;

  function handleAddToCart() {
    if (disabled) return;
    // First selected variant determines the variantId/sku for cart line
    const selectedEntries = Object.entries(selected);
    const firstVariant = selectedEntries[0]?.[1];
    const variantLabel =
      selectedEntries.length > 0
        ? selectedEntries.map(([k, v]) => `${k}: ${v.value}`).join(" · ")
        : null;

    add({
      productId,
      variantId: firstVariant?.id ?? null,
      slug,
      name,
      variantLabel,
      sku: firstVariant?.sku ?? sku,
      price,
      image,
      stockCap: stock,
      quantity: qty,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-md">
      {variantGroups.map((g) => (
        <div key={g.name}>
          <label className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-white/60">
            <span>{g.name}</span>
            {selected[g.name] && (
              <span className="text-brand-yellow normal-case tracking-normal">
                {selected[g.name].value}
              </span>
            )}
          </label>
          <div className="flex flex-wrap gap-2">
            {g.options.map((opt) => {
              const isActive = selected[g.name]?.id === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    setSelected((s) => ({ ...s, [g.name]: opt }))
                  }
                  className={`relative rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                    isActive
                      ? "border-brand-yellow bg-brand-yellow text-brand-black shadow-[0_0_18px_-2px_rgba(255,215,0,0.6)]"
                      : "border-white/15 bg-white/[0.04] text-white/80 hover:border-brand-yellow/50 hover:text-brand-yellow"
                  }`}
                >
                  {opt.value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-4">
        <label className="text-xs font-medium uppercase tracking-wider text-white/60">
          Adet
        </label>
        <div className="flex items-center rounded-full border border-white/15 bg-white/5">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-9 w-9 items-center justify-center text-white/70 hover:text-brand-yellow"
            disabled={qty <= 1}
            aria-label="Azalt"
          >
            −
          </button>
          <span className="w-9 text-center text-sm font-semibold">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(stock || 99, q + 1))}
            className="flex h-9 w-9 items-center justify-center text-white/70 hover:text-brand-yellow disabled:cursor-not-allowed disabled:opacity-30"
            disabled={qty >= stock}
            aria-label="Arttır"
          >
            +
          </button>
        </div>
        {stock > 0 && stock <= 5 && (
          <span className="text-xs text-rose-300">
            Son {stock} adet
          </span>
        )}
      </div>

      <motion.button
        type="button"
        disabled={disabled}
        onClick={handleAddToCart}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-brand-yellow py-3.5 text-sm font-semibold text-brand-black shadow-[0_18px_40px_-12px_rgba(255,215,0,0.6)] transition disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-enabled:group-hover:translate-x-full" />

        <AnimatePresence mode="wait">
          {justAdded ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="relative flex items-center gap-2"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 8 4 4 6-8" />
              </svg>
              Sepete Eklendi
            </motion.span>
          ) : (
            <motion.span
              key="default"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="relative flex items-center gap-2"
            >
              {stock === 0
                ? "Tükendi"
                : !allRequiredSelected
                ? "Lütfen seçim yap"
                : (
                  <>
                    Sepete Ekle
                    <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </>
                )}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
