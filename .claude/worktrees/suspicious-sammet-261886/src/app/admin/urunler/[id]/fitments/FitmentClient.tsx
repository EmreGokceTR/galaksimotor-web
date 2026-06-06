"use client";

import { useMemo, useState, useTransition } from "react";
import { saveFitments } from "./actions";

type Moto = { id: string; brand: string; model: string; year: number };

export function FitmentClient({
  productId,
  motorcycles,
  initialSelected,
}: {
  productId: string;
  motorcycles: Moto[];
  initialSelected: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return motorcycles;
    return motorcycles.filter(
      (m) =>
        m.brand.toLowerCase().includes(q) ||
        m.model.toLowerCase().includes(q) ||
        String(m.year).includes(q)
    );
  }, [motorcycles, search]);

  // Markaya göre grupla
  const grouped = useMemo(() => {
    const map = new Map<string, Moto[]>();
    for (const m of filtered) {
      if (!map.has(m.brand)) map.set(m.brand, []);
      map.get(m.brand)!.push(m);
    }
    return map;
  }, [filtered]);

  const initial = useMemo(() => new Set(initialSelected), [initialSelected]);
  const dirty =
    selected.size !== initial.size ||
    Array.from(selected).some((id) => !initial.has(id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(filtered.map((m) => m.id)));
  }

  function clearAll() {
    setSelected(new Set());
  }

  function save() {
    startTransition(async () => {
      await saveFitments(productId, Array.from(selected));
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2000);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Marka, model veya yıl ara..."
          className="flex-1 min-w-[200px] rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand-yellow"
        />
        <button
          onClick={selectAll}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:text-brand-yellow"
        >
          Görünenleri Seç
        </button>
        <button
          onClick={clearAll}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:text-rose-300"
        >
          Tümünü Kaldır
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-md">
        {grouped.size === 0 ? (
          <p className="py-6 text-center text-sm text-white/45">Sonuç yok.</p>
        ) : (
          <div className="space-y-5">
            {Array.from(grouped.entries()).map(([brand, list]) => (
              <div key={brand}>
                <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-yellow/80">
                  {brand}
                </h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((m) => {
                    const checked = selected.has(m.id);
                    return (
                      <label
                        key={m.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition ${
                          checked
                            ? "border-brand-yellow/50 bg-brand-yellow/10"
                            : "border-white/10 bg-white/[0.02] hover:border-white/25"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(m.id)}
                          className="h-4 w-4 accent-brand-yellow"
                        />
                        <span className="text-sm text-white">
                          {m.model}{" "}
                          <span className="text-xs text-white/45">({m.year})</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sticky bottom-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/60 px-5 py-3 backdrop-blur-md">
        <span className="text-sm text-white/65">
          <span className="text-white">{selected.size}</span> motosiklet seçili
        </span>
        <button
          onClick={save}
          disabled={!dirty || pending}
          className="rounded-full bg-brand-yellow px-5 py-2 text-sm font-semibold text-brand-black disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
        >
          {pending ? "Kaydediliyor..." : savedAt ? "✓ Kaydedildi" : "Kaydet"}
        </button>
      </div>
    </div>
  );
}