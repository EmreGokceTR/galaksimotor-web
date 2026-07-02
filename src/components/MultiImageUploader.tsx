"use client";

/**
 * Birden çok görseli sırayla yükleyip yönetmek için — Vitrin (motosiklet ilanı)
 * gibi tek görsel dizisi (String[]) tutan formlarda kullanılır. Her URL, aynı
 * `name`'e sahip ayrı bir hidden input olarak render edilir; server action
 * formData.getAll(name) ile diziyi okur.
 */

import { useState } from "react";
import { ImageUploader } from "./ImageUploader";

export function MultiImageUploader({
  name,
  defaultValues = [],
  folder = "uploads",
  label = "Görseller",
}: {
  name: string;
  defaultValues?: string[];
  folder?: string;
  className?: string;
  label?: string;
}) {
  const [images, setImages] = useState<string[]>(defaultValues);
  const [draft, setDraft] = useState("");

  function confirmAdd() {
    const url = draft.trim();
    if (!url) return;
    setImages((prev) => [...prev, url]);
    setDraft("");
  }

  function removeAt(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  return (
    <div className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/55">
        {label} {images.length > 0 && <span className="text-white/35">({images.length})</span>}
      </span>

      {images.map((url) => (
        <input key={url} type="hidden" name={name} value={url} />
      ))}

      {images.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((url, idx) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-white/15 bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Görsel ${idx + 1}`} className="h-full w-full object-cover" />
              {idx === 0 && (
                <span className="absolute left-1 top-1 rounded-full bg-brand-yellow px-1.5 py-0.5 text-[9px] font-bold text-brand-black">
                  Kapak
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/60 opacity-0 transition group-hover:opacity-100">
                {idx > 0 && (
                  <button type="button" onClick={() => move(idx, -1)} className="rounded-full bg-white/15 px-1.5 py-1 text-[10px] text-white hover:bg-white/25" title="Sola taşı">
                    ←
                  </button>
                )}
                <button type="button" onClick={() => removeAt(idx)} className="rounded-full bg-rose-500/80 px-1.5 py-1 text-[10px] text-white hover:bg-rose-500" title="Kaldır">
                  ✕
                </button>
                {idx < images.length - 1 && (
                  <button type="button" onClick={() => move(idx, 1)} className="rounded-full bg-white/15 px-1.5 py-1 text-[10px] text-white hover:bg-white/25" title="Sağa taşı">
                    →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ImageUploader value={draft} onChange={setDraft} folder={folder} compact size="small" placeholder="Görsel URL'i yapıştır" />
      {draft.trim() && (
        <button
          type="button"
          onClick={confirmAdd}
          className="mt-2 rounded-full bg-brand-yellow px-4 py-1.5 text-xs font-semibold text-brand-black hover:brightness-110"
        >
          + Galeriye Ekle
        </button>
      )}
    </div>
  );
}
