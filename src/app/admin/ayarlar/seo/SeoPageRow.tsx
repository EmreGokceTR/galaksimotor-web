"use client";

import { useState, useTransition } from "react";
import { saveSeoPage } from "./actions";

type Props = {
  path: string;
  label: string;
  currentTitle: string;
  currentDesc: string;
  defaultTitle: string;
  defaultDesc: string;
};

export function SeoPageRow({ path, label, currentTitle, currentDesc, defaultTitle, defaultDesc }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const hasCustomTitle = currentTitle !== defaultTitle && currentTitle !== "";
  const hasCustomDesc  = currentDesc  !== defaultDesc  && currentDesc  !== "";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false); setError("");
    startTransition(async () => {
      const res = await saveSeoPage(path, new FormData(e.currentTarget));
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else setError(res.error ?? "Hata oluştu.");
    });
  }

  return (
    <li className="rounded-2xl border border-white/10 bg-white/[0.025] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.02]"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{label}</span>
            {(hasCustomTitle || hasCustomDesc) && (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-400/30">
                Özelleştirilmiş
              </span>
            )}
          </div>
          <span className="text-xs text-white/40">{path}</span>
        </div>
        <svg viewBox="0 0 16 16" className={`h-4 w-4 shrink-0 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="border-t border-white/10 px-5 pb-5 pt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
              Sayfa Başlığı (title)
            </label>
            <input
              type="text"
              name="title"
              defaultValue={currentTitle || defaultTitle}
              placeholder={defaultTitle}
              maxLength={70}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40 placeholder:text-white/25"
            />
            <p className="mt-1 text-[11px] text-white/35">Önerilen: 50–60 karakter. Tarayıcı sekmesinde ve Google'da görünür.</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
              Meta Açıklaması (description)
            </label>
            <textarea
              name="desc"
              rows={3}
              defaultValue={currentDesc || defaultDesc}
              placeholder={defaultDesc}
              maxLength={160}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40 placeholder:text-white/25"
            />
            <p className="mt-1 text-[11px] text-white/35">Önerilen: 120–160 karakter. Google arama sonuçlarında snippet olarak görünür.</p>
          </div>
          <div className="flex items-center gap-4">
            <button type="submit" disabled={isPending}
              className="rounded-xl bg-brand-yellow px-5 py-2 text-sm font-semibold text-black transition hover:bg-brand-yellow/80 disabled:opacity-50">
              {isPending ? "Kaydediliyor…" : "Kaydet"}
            </button>
            {saved && <span className="text-sm font-medium text-emerald-400">✓ Kaydedildi</span>}
            {error && <span className="text-sm text-rose-400">{error}</span>}
          </div>
        </form>
      )}
    </li>
  );
}
