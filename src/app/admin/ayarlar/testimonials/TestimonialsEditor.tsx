"use client";

import { useState, useTransition } from "react";
import { saveTestimonials } from "./actions";

type T = { name: string; bike: string; rating: string; text: string };
type Props = { items: T[] };

function Field({ label, name, defaultValue, rows = 0 }: {
  label: string; name: string; defaultValue: string; rows?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
        {label}
      </label>
      {rows > 0 ? (
        <textarea name={name} defaultValue={defaultValue} rows={rows}
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40" />
      ) : (
        <input type="text" name={name} defaultValue={defaultValue}
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40" />
      )}
    </div>
  );
}

export function TestimonialsEditor({ items }: Props) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false); setError("");
    startTransition(async () => {
      const res = await saveTestimonials(new FormData(e.currentTarget));
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else setError(res.error ?? "Hata oluştu.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {items.map((item, i) => {
        const n = i + 1;
        return (
          <section key={n} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">
              Yorum {n}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="İsim" name={`t${n}_name`} defaultValue={item.name} />
              <Field label="Motosiklet" name={`t${n}_bike`} defaultValue={item.bike} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                Puan (1–5)
              </label>
              <select name={`t${n}_rating`} defaultValue={item.rating}
                className="w-24 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40">
                {[1,2,3,4,5].map((v) => (
                  <option key={v} value={v} className="bg-zinc-900">{v}</option>
                ))}
              </select>
            </div>
            <Field label="Yorum metni" name={`t${n}_text`} defaultValue={item.text} rows={3} />
          </section>
        );
      })}

      <div className="flex items-center gap-4">
        <button type="submit" disabled={isPending}
          className="rounded-xl bg-brand-yellow px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-brand-yellow/80 disabled:opacity-50">
          {isPending ? "Kaydediliyor…" : "Değişiklikleri Kaydet"}
        </button>
        {saved && <span className="text-sm font-medium text-emerald-400">✓ Kaydedildi</span>}
        {error && <span className="text-sm text-rose-400">{error}</span>}
      </div>
    </form>
  );
}
