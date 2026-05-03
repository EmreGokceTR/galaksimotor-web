"use client";

import { useState, useTransition } from "react";
import { updateProduct } from "./actions";

type Props = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  initialPrice: number;
  initialStock: number;
  initialActive: boolean;
};

export function ProductRow(p: Props) {
  const [price, setPrice] = useState(p.initialPrice.toString());
  const [stock, setStock] = useState(p.initialStock.toString());
  const [active, setActive] = useState(p.initialActive);
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const dirty =
    Number(price) !== p.initialPrice ||
    Number(stock) !== p.initialStock ||
    active !== p.initialActive;

  function save() {
    startTransition(async () => {
      await updateProduct(p.id, {
        price: Number(price),
        stock: parseInt(stock, 10),
        isActive: active,
      });
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 1500);
    });
  }

  return (
    <tr className="hover:bg-white/[0.02]">
      <td className="px-4 py-3">
        <div className="font-medium text-white line-clamp-1">{p.name}</div>
        <div className="text-[11px] text-white/40">
          {p.category} · SKU {p.sku}
        </div>
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-24 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-right text-sm outline-none focus:border-brand-yellow"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className={`w-20 rounded-md border bg-white/[0.04] px-2 py-1 text-right text-sm outline-none focus:border-brand-yellow ${
            Number(stock) === 0
              ? "border-rose-400/40 text-rose-300"
              : Number(stock) <= 5
              ? "border-amber-400/40 text-amber-300"
              : "border-white/10"
          }`}
        />
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => setActive((v) => !v)}
          className={`relative h-5 w-10 rounded-full transition ${
            active ? "bg-emerald-500/80" : "bg-white/15"
          }`}
          aria-label="Aktif"
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
              active ? "left-5" : "left-0.5"
            }`}
          />
        </button>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={save}
          disabled={!dirty || pending}
          className="rounded-full bg-brand-yellow px-4 py-1 text-xs font-semibold text-brand-black disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
        >
          {pending ? "..." : savedAt ? "✓ Kaydedildi" : "Kaydet"}
        </button>
      </td>
    </tr>
  );
}
