"use client";

import { useState, useTransition } from "react";
import { saveSocialLinks } from "./actions";

type FieldDef = { key: string; label: string; placeholder: string };

const FIELDS: FieldDef[] = [
  { key: "social_facebook", label: "Facebook", placeholder: "https://facebook.com/galaksimotor" },
  { key: "social_instagram", label: "Instagram", placeholder: "https://instagram.com/galaksimotor" },
  { key: "social_youtube", label: "YouTube", placeholder: "https://youtube.com/@galaksimotor" },
  { key: "social_x", label: "X (Twitter)", placeholder: "https://x.com/galaksimotor" },
  { key: "social_tiktok", label: "TikTok", placeholder: "https://tiktok.com/@galaksimotor" },
];

export function SocialEditor({ values }: { values: Record<string, string> }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false);
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveSocialLinks(fd);
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(res.error ?? "Hata oluştu.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
              {f.label}
            </span>
            <input
              type="url"
              name={f.key}
              defaultValue={values[f.key] ?? ""}
              placeholder={f.placeholder}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40 placeholder:text-white/25"
            />
          </label>
        ))}
        <p className="text-[11px] text-white/35">
          Boş bıraktığınız platformlar sitede gösterilmez. Linkler footer&apos;da
          ikon olarak çıkar ve SEO yapısal verisine eklenir.
        </p>
      </section>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-brand-yellow px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-brand-yellow/80 disabled:opacity-50"
        >
          {isPending ? "Kaydediliyor…" : "Değişiklikleri Kaydet"}
        </button>
        {saved && <span className="text-sm font-medium text-emerald-400">✓ Kaydedildi</span>}
        {error && <span className="text-sm text-rose-400">{error}</span>}
      </div>
    </form>
  );
}
