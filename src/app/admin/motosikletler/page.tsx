import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createMotorcycleListing, deleteMotorcycleListing } from "./actions";

export const metadata = { title: "Motosikletler - Admin" };

export default async function AdminMotorcyclesPage() {
  const listings = await prisma.motorcycleListing.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Motosiklet İlanları</h1>
        <Link
          href="/motosikletler"
          className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/70 hover:border-brand-yellow/50 hover:text-brand-yellow"
          target="_blank"
        >
          Ön Yüzü Gör ↗
        </Link>
      </div>

      {/* Add form */}
      <form
        action={createMotorcycleListing}
        className="mb-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6"
      >
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-yellow">Yeni İlan Ekle</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">Marka *</span>
            <input name="marka" required className="input-glass w-full mt-1" placeholder="Honda" />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">Model *</span>
            <input name="model" required className="input-glass w-full mt-1" placeholder="CB500F" />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">Yıl *</span>
            <input name="yil" type="number" required min={1900} max={2100} className="input-glass w-full mt-1" placeholder="2022" />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">CC</span>
            <input name="cc" type="number" min={0} className="input-glass w-full mt-1" placeholder="500" />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">Fiyat (₺) *</span>
            <input name="fiyat" type="number" required min={0} step={0.01} className="input-glass w-full mt-1" placeholder="150000" />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">Stok Durumu</span>
            <select name="stokDurumu" className="input-glass w-full mt-1">
              <option value="true">Stokta</option>
              <option value="false">Tükendi</option>
            </select>
          </label>
          <label className="block sm:col-span-2 lg:col-span-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">Görsel URL</span>
            <input name="gorsel" className="input-glass w-full mt-1" placeholder="https://..." />
          </label>
          <label className="block sm:col-span-2 lg:col-span-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">Açıklama</span>
            <textarea name="aciklama" rows={2} className="input-glass w-full mt-1 resize-none" />
          </label>
        </div>
        <button
          type="submit"
          className="mt-4 rounded-xl bg-brand-yellow px-6 py-2.5 text-sm font-semibold text-brand-black hover:brightness-110"
        >
          İlan Ekle
        </button>
      </form>

      {/* Listings table */}
      {listings.length === 0 ? (
        <p className="text-center text-white/40 py-10">Henüz ilan yok.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-left text-[11px] uppercase tracking-wider text-white/40">
                <th className="px-4 py-3">Araç</th>
                <th className="px-4 py-3">Yıl</th>
                <th className="px-4 py-3">CC</th>
                <th className="px-4 py-3">Fiyat</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {listings.map((m) => (
                <tr key={m.id} className="bg-white/[0.015] hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3 font-medium text-white">
                    {m.marka} {m.model}
                  </td>
                  <td className="px-4 py-3 text-white/60">{m.yil}</td>
                  <td className="px-4 py-3 text-white/60">{m.cc ?? "—"}</td>
                  <td className="px-4 py-3 font-semibold text-brand-yellow">
                    {Number(m.fiyat).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${
                      m.stokDurumu
                        ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20"
                        : "bg-rose-500/15 text-rose-300 ring-rose-400/20"
                    }`}>
                      {m.stokDurumu ? "Stokta" : "Tükendi"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/motosikletler/${m.id}`}
                        target="_blank"
                        className="text-xs text-white/40 hover:text-brand-yellow"
                      >
                        Görüntüle
                      </Link>
                      <form action={deleteMotorcycleListing.bind(null, m.id)}>
                        <button
                          type="submit"
                          className="text-xs text-rose-400/60 hover:text-rose-400"
                          onClick={(e) => {
                            if (!confirm(`"${m.marka} ${m.model}" ilanı silinsin mi?`)) e.preventDefault();
                          }}
                        >
                          Sil
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
