"use client";

import { useState, useTransition } from "react";
import { saveSssItems, type FaqItem } from "./actions";

export function SssEditor({ initialItems }: { initialItems: FaqItem[] }) {
  const [items, setItems] = useState<FaqItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function update(index: number, field: "q" | "a", value: string) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }
  function remove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }
  function add() {
    setItems((prev) => [...prev, { q: "", a: "" }]);
  }
  function moveUp(index: number) {
    if (index === 0) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }
  function moveDown(index: number) {
    if (index === items.length - 1) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }
  function handleSave() {
    setSaved(false); setError("");
    startTransition(async () => {
      const res = await saveSssItems(items);
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else setError(res.error ?? "Hata oluştu.");
    });
  }

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i}
          className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-yellow">
              Soru {i + 1}
            </span>
            <div className="flex gap-1">
              <button onClick={() => moveUp(i)} disabled={i === 0}
                className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/50 hover:text-white disabled:opacity-25"
                title="Yukarı taşı"
              >↑</button>
              <button onClick={() => moveDown(i)} disabled={i === items.length - 1}
                className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/50 hover:text-white disabled:opacity-25"
                title="Aşağı taşı"
              >↓</button>
              <button onClick={() => remove(i)}
                className="rounded-lg border border-rose-400/30 px-2 py-1 text-xs text-rose-400 hover:bg-rose-500/10"
                title="Sil"
              >✕</button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wider text-white/40">Soru</label>
            <input type="text" value={item.q} onChange={(e) => update(i, "q", e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40"
              placeholder="Soru metni…"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wider text-white/40">Cevap</label>
            <textarea value={item.a} onChange={(e) => update(i, "a", e.target.value)} rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40"
              placeholder="Cevap metni…"
            />
          </div>
        </div>
      ))}

      {/* Yeni soru ekle */}
      <button onClick={add}
        className="w-full rounded-2xl border border-dashed border-white/20 py-3 text-sm text-white/50 transition hover:border-brand-yellow/40 hover:text-brand-yellow"
      >
        + Yeni Soru Ekle
      </button>

      {/* Kaydet */}
      <div className="flex items-center gap-4 pt-2">
        <button onClick={handleSave} disabled={isPending}
          className="rounded-xl bg-brand-yellow px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-brand-yellow/80 disabled:opacity-50"
        >
          {isPending ? "Kaydediliyor…" : "Değişiklikleri Kaydet"}
        </button>
        {saved && <span className="text-sm font-medium text-emerald-400">✓ Kaydedildi</span>}
        {error && <span className="text-sm text-rose-400">{error}</span>}
      </div>
    </div>
  );
}
