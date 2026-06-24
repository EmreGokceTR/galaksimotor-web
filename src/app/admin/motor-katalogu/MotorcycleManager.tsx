"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { upsertMotorcycle, deleteMotorcycle } from "./actions";

type Moto = {
  id: string;
  brand: string;
  model: string;
  year: number;
  fitmentCount: number;
  ownershipCount: number;
};

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40 placeholder:text-white/25";

export function MotorcycleManager({ motorcycles }: { motorcycles: Moto[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Moto | null>(null);
  const [q, setQ] = useState("");

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  function loadForm(m: Moto | null) {
    setEditing(m);
    setBrand(m?.brand ?? "");
    setModel(m?.model ?? "");
    setYear(m ? String(m.year) : "");
    setError(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await upsertMotorcycle({
        id: editing?.id ?? null,
        brand,
        model,
        year: Number(year),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      loadForm(null);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await deleteMotorcycle(id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  const filtered = q.trim()
    ? motorcycles.filter((m) =>
        `${m.brand} ${m.model} ${m.year}`.toLowerCase().includes(q.toLowerCase())
      )
    : motorcycles;

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">
          {editing ? `Düzenle: ${editing.brand} ${editing.model} ${editing.year}` : "Yeni Motosiklet"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">Marka *</span>
            <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Honda" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">Model *</span>
            <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="PCX 160" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">Yıl *</span>
            <input value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="2023" className={inputCls} />
          </label>
        </div>
        {error && <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{error}</p>}
        <div className="flex justify-end gap-2">
          {editing && (
            <button type="button" onClick={() => loadForm(null)} className="rounded-xl border border-white/15 px-5 py-2 text-sm text-white/70 hover:text-white">Vazgeç</button>
          )}
          <button type="submit" disabled={isPending} className="rounded-xl bg-brand-yellow px-6 py-2 text-sm font-semibold text-black hover:bg-brand-yellow/80 disabled:opacity-50">
            {isPending ? "Kaydediliyor…" : editing ? "Güncelle" : "Ekle"}
          </button>
        </div>
      </form>

      {motorcycles.length > 5 && (
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Katalogda ara…"
          className={inputCls}
        />
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-white/45">
          {motorcycles.length === 0 ? "Henüz motosiklet yok. Yukarıdan ekle." : "Sonuç yok."}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3">
              <div className="min-w-0 flex-1">
                <span className="text-sm font-semibold text-white">{m.brand} {m.model}</span>
                <span className="ml-2 text-xs text-white/45">{m.year}</span>
                <div className="mt-0.5 flex flex-wrap gap-x-3 text-[11px] text-white/40">
                  <span>{m.fitmentCount} uyumlu ürün</span>
                  {m.ownershipCount > 0 && <span>{m.ownershipCount} garajda</span>}
                </div>
              </div>
              <button type="button" onClick={() => { loadForm(m); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/75 hover:text-brand-yellow">
                Düzenle
              </button>
              <DeleteBtn onConfirm={() => handleDelete(m.id)} pending={isPending} disabled={m.ownershipCount > 0} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DeleteBtn({ onConfirm, pending, disabled }: { onConfirm: () => void; pending: boolean; disabled?: boolean }) {
  const [confirm, setConfirm] = useState(false);
  if (disabled) {
    return <span title="Bir müşterinin garajında kayıtlı — silinemez" className="cursor-not-allowed rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/25">Sil</span>;
  }
  if (confirm) {
    return (
      <span className="flex items-center gap-2">
        <button type="button" disabled={pending} onClick={onConfirm} className="rounded-full bg-rose-500/20 px-3 py-1 text-xs text-rose-400 ring-1 ring-rose-400/30 hover:bg-rose-500/30 disabled:opacity-50">{pending ? "…" : "Evet"}</button>
        <button type="button" onClick={() => setConfirm(false)} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/60 hover:text-white">İptal</button>
      </span>
    );
  }
  return <button type="button" onClick={() => setConfirm(true)} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-rose-400/80 hover:text-rose-400">Sil</button>;
}
