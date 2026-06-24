"use client";

import { useState, useTransition } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { saveSiteTexts } from "./actions";
import type { Section } from "./fields";

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40 placeholder:text-white/25";

export function SiteTextsEditor({
  sections,
  values,
}: {
  sections: Section[];
  values: Record<string, string>;
}) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false);
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveSiteTexts(fd);
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3500);
      } else {
        setError(res.error ?? "Hata oluştu.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {sections.map((section, i) => (
        <details
          key={section.title}
          open={i === 0}
          className="group rounded-2xl border border-white/10 bg-white/[0.025]"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">
              {section.title}
            </span>
            <span className="text-white/40 transition group-open:rotate-180">▾</span>
          </summary>
          <div className="space-y-4 border-t border-white/10 px-5 py-4">
            {section.note && <p className="text-[11px] text-white/40">{section.note}</p>}
            {section.fields.map((f) =>
              f.type === "image" ? (
                <ImageUploader
                  key={f.key}
                  name={f.key}
                  label={f.label}
                  defaultValue={values[f.key] ?? ""}
                  folder="site"
                  size="small"
                />
              ) : (
                <label key={f.key} className="block">
                  <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">
                    {f.label}
                  </span>
                  {f.type === "textarea" ? (
                    <textarea
                      name={f.key}
                      rows={2}
                      defaultValue={values[f.key] ?? ""}
                      placeholder={f.def}
                      className={inputCls + " resize-none"}
                    />
                  ) : (
                    <input
                      name={f.key}
                      defaultValue={values[f.key] ?? ""}
                      placeholder={f.def}
                      className={inputCls}
                    />
                  )}
                </label>
              )
            )}
          </div>
        </details>
      ))}

      {/* Yapışkan kaydet çubuğu */}
      <div className="sticky bottom-4 z-10 flex items-center gap-4 rounded-2xl border border-brand-yellow/20 bg-[#0f0f0f]/95 px-5 py-3 backdrop-blur">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-brand-yellow px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-brand-yellow/80 disabled:opacity-50"
        >
          {isPending ? "Kaydediliyor…" : "Tüm Değişiklikleri Kaydet"}
        </button>
        {saved && <span className="text-sm font-medium text-emerald-400">✓ Kaydedildi</span>}
        {error && <span className="text-sm text-rose-400">{error}</span>}
        <span className="ml-auto hidden text-[11px] text-white/35 sm:block">
          Boş bırakılan alan, varsayılan metni gösterir.
        </span>
      </div>
    </form>
  );
}
