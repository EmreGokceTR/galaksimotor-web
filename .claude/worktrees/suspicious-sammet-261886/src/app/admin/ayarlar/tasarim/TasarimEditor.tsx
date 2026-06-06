"use client";

import { useState, useTransition } from "react";
import { saveTasarim } from "./actions";

const FONTS = [
  { value: "inter",   label: "Inter",   sample: "Hızlı kahverengi tilki" },
  { value: "poppins", label: "Poppins", sample: "Hızlı kahverengi tilki" },
  { value: "roboto",  label: "Roboto",  sample: "Hızlı kahverengi tilki" },
];

const SCALES = [
  { value: "87",  label: "Küçük (87%)",  desc: "Daha kompakt, daha fazla içerik" },
  { value: "100", label: "Normal (100%)", desc: "Varsayılan boyut" },
  { value: "112", label: "Büyük (112%)",  desc: "Daha okunaklı, daha büyük metin" },
];

type Props = { font: string; scale: string };

export function TasarimEditor({ font: initFont, scale: initScale }: Props) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [font, setFont] = useState(initFont || "inter");
  const [scale, setScale] = useState(initScale || "100");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false); setError("");
    startTransition(async () => {
      const fd = new FormData(e.currentTarget);
      const res = await saveTasarim(fd);
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else setError(res.error ?? "Hata oluştu.");
    });
  }

  const fontFamily =
    font === "poppins" ? "Poppins, sans-serif" :
    font === "roboto"  ? "Roboto, sans-serif"  :
    "Inter, sans-serif";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Font ailesi */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">Yazı Tipi</h2>
        <input type="hidden" name="theme_font" value={font} />
        <div className="grid gap-3 sm:grid-cols-3">
          {FONTS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFont(f.value)}
              className={`rounded-xl border p-4 text-left transition ${
                font === f.value
                  ? "border-brand-yellow bg-brand-yellow/10 ring-1 ring-brand-yellow/40"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <div className="text-sm font-semibold text-white">{f.label}</div>
              <div
                className="mt-2 text-xs text-white/55"
                style={{ fontFamily: f.value === "poppins" ? "Poppins, sans-serif" : f.value === "roboto" ? "Roboto, sans-serif" : "Inter, sans-serif" }}
              >
                {f.sample}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Font boyutu */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">Yazı Boyutu</h2>
        <input type="hidden" name="theme_font_scale" value={scale} />
        <div className="grid gap-3 sm:grid-cols-3">
          {SCALES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setScale(s.value)}
              className={`rounded-xl border p-4 text-left transition ${
                scale === s.value
                  ? "border-brand-yellow bg-brand-yellow/10 ring-1 ring-brand-yellow/40"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <div className="text-sm font-semibold text-white">{s.label}</div>
              <div className="mt-1 text-xs text-white/55">{s.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Önizleme */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-yellow">Önizleme</h2>
        <div
          style={{
            fontFamily,
            fontSize: `${parseInt(scale) / 100}rem`,
          }}
          className="space-y-1 text-white/80"
        >
          <div className="text-2xl font-bold">Galaksi Motor</div>
          <div className="text-base">Motorunun tüm ihtiyacı, tek adreste.</div>
          <div className="text-sm text-white/55">Orijinal yedek parça, profesyonel bakım ürünleri ve şık aksesuarlar.</div>
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={isPending}
          className="rounded-xl bg-brand-yellow px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-brand-yellow/80 disabled:opacity-50">
          {isPending ? "Uygulanıyor…" : "Değişiklikleri Uygula"}
        </button>
        {saved && <span className="text-sm font-medium text-emerald-400">✓ Uygulandı — sayfa yenilendiğinde görünür</span>}
        {error && <span className="text-sm text-rose-400">{error}</span>}
      </div>
    </form>
  );
}
