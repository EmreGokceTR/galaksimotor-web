"use client";

import { useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { inlineUpdateService } from "./inlineUpdateService";

type ServiceSnapshot = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number | null;
};

const spring = { type: "spring" as const, stiffness: 420, damping: 32 };

export function ServiceEditButton({ service }: { service: ServiceSnapshot }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description ?? "");
  const [duration, setDuration] = useState(String(service.duration));
  const [price, setPrice] = useState(service.price != null ? String(service.price) : "");

  useEffect(() => {
    if (open) {
      setName(service.name);
      setDescription(service.description ?? "");
      setDuration(String(service.duration));
      setPrice(service.price != null ? String(service.price) : "");
      setError("");
    }
  }, [open, service]);

  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
    return null;
  }

  function handleSave() {
    setError("");
    startTransition(async () => {
      const res = await inlineUpdateService(service.id, {
        name: name.trim() || service.name,
        description: description.trim() || null,
        duration: parseInt(duration) || service.duration,
        price: price.trim() ? parseFloat(price) : null,
      });
      if (res.ok) {
        setOpen(false);
      } else {
        setError(res.error ?? "Kayıt başarısız.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label="Hizmeti düzenle"
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white/80 backdrop-blur-md ring-1 ring-white/20 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-brand-yellow hover:text-brand-black hover:ring-brand-yellow hover:shadow-[0_0_12px_rgba(255,215,0,0.5)]"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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
              className="glass-strong relative z-10 w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]"
              initial={{ scale: 0.88, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.88, y: 20, opacity: 0 }}
              transition={spring}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Hizmeti Düzenle</h2>
                <button
                  type="button"
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
                    Hizmet Adı
                  </span>
                  <input
                    className="input-glass w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isPending}
                    placeholder="Fren Bakımı"
                  />
                </label>

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
                    placeholder="Balata değişimi, hidrolik kontrolü ve disk yenileme."
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">
                      Süre (dakika)
                    </span>
                    <input
                      className="input-glass w-full"
                      type="number"
                      min={1}
                      step={1}
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      disabled={isPending}
                      placeholder="60"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">
                      Fiyat ₺ (boş = ücretsiz)
                    </span>
                    <input
                      className="input-glass w-full"
                      type="number"
                      min={0}
                      step={0.01}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={isPending}
                      placeholder="0"
                    />
                  </label>
                </div>

                {error && (
                  <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                    {error}
                  </p>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => !isPending && setOpen(false)}
                  disabled={isPending}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/10 disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  type="button"
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
