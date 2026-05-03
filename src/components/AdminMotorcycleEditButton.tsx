"use client";

import { useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { inlineUpdateMotorcycleListing } from "@/app/admin/motosikletler/actions";

export type MotorcycleSnapshot = {
  id: string;
  marka: string;
  model: string;
  yil: number;
  cc: number | null;
  fiyat: number;
  stokDurumu: boolean;
  gorsel: string | null;
  aciklama: string | null;
};

const spring = { type: "spring" as const, stiffness: 420, damping: 32 };

export function AdminMotorcycleEditButton({ moto }: { moto: MotorcycleSnapshot }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [marka, setMarka] = useState(moto.marka);
  const [model, setModel] = useState(moto.model);
  const [yil, setYil] = useState(String(moto.yil));
  const [cc, setCc] = useState(moto.cc ? String(moto.cc) : "");
  const [fiyat, setFiyat] = useState(String(moto.fiyat));
  const [stokDurumu, setStokDurumu] = useState(moto.stokDurumu);
  const [gorsel, setGorsel] = useState(moto.gorsel ?? "");
  const [aciklama, setAciklama] = useState(moto.aciklama ?? "");

  useEffect(() => {
    if (open) {
      setMarka(moto.marka);
      setModel(moto.model);
      setYil(String(moto.yil));
      setCc(moto.cc ? String(moto.cc) : "");
      setFiyat(String(moto.fiyat));
      setStokDurumu(moto.stokDurumu);
      setGorsel(moto.gorsel ?? "");
      setAciklama(moto.aciklama ?? "");
    }
  }, [open, moto]);

  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
    return null;
  }

  function handleSave() {
    startTransition(async () => {
      await inlineUpdateMotorcycleListing(moto.id, {
        marka: marka.trim() || moto.marka,
        model: model.trim() || moto.model,
        yil: parseInt(yil) || moto.yil,
        cc: cc.trim() ? parseInt(cc) : null,
        fiyat: parseFloat(fiyat) || moto.fiyat,
        stokDurumu,
        gorsel: gorsel.trim() || null,
        aciklama: aciklama.trim() || null,
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
        aria-label="Motosikleti düzenle"
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
            <motion.div
              className="absolute inset-0 bg-black/65 backdrop-blur-sm"
              onClick={() => !isPending && setOpen(false)}
            />

            <motion.div
              className="glass-strong relative z-10 w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]"
              initial={{ scale: 0.88, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.88, y: 20, opacity: 0 }}
              transition={spring}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Motosikleti Düzenle</h2>
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
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Marka</span>
                    <input className="input-glass w-full" value={marka} onChange={(e) => setMarka(e.target.value)} disabled={isPending} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Model</span>
                    <input className="input-glass w-full" value={model} onChange={(e) => setModel(e.target.value)} disabled={isPending} />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Yıl</span>
                    <input className="input-glass w-full" type="number" min={1900} max={2100} value={yil} onChange={(e) => setYil(e.target.value)} disabled={isPending} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">CC</span>
                    <input className="input-glass w-full" type="number" min={0} placeholder="Opsiyonel" value={cc} onChange={(e) => setCc(e.target.value)} disabled={isPending} />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Fiyat (₺)</span>
                    <input className="input-glass w-full" type="number" min={0} step={0.01} value={fiyat} onChange={(e) => setFiyat(e.target.value)} disabled={isPending} />
                  </label>
                  <div className="block">
                    <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Stok Durumu</span>
                    <button
                      type="button"
                      onClick={() => setStokDurumu((v) => !v)}
                      disabled={isPending}
                      className={`mt-0.5 flex h-[42px] w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all ring-1 ${
                        stokDurumu
                          ? "bg-emerald-500/20 text-emerald-300 ring-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 ring-rose-500/30"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${stokDurumu ? "bg-emerald-400" : "bg-rose-400"}`} />
                      {stokDurumu ? "Stokta" : "Tükendi"}
                    </button>
                  </div>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Görsel URL</span>
                  <input className="input-glass w-full" placeholder="https://..." value={gorsel} onChange={(e) => setGorsel(e.target.value)} disabled={isPending} />
                  {gorsel && (
                    <div className="mt-2 h-20 w-20 overflow-hidden rounded-lg border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={gorsel} alt="önizleme" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  )}
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">Açıklama</span>
                  <textarea
                    className="input-glass w-full resize-none"
                    rows={3}
                    value={aciklama}
                    onChange={(e) => setAciklama(e.target.value)}
                    disabled={isPending}
                  />
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
