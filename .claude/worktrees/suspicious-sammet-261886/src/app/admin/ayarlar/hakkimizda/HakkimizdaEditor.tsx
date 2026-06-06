"use client";

import { useState, useTransition } from "react";
import { saveHakkimizda } from "./actions";

type Props = {
  stat1_num: string; stat1_desc: string;
  stat2_num: string; stat2_desc: string;
  stat3_num: string; stat3_desc: string;
  story: string; mission: string; vision: string;
};

function Field({
  label, name, defaultValue, rows = 0,
}: { label: string; name: string; defaultValue: string; rows?: number }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
        {label}
      </label>
      {rows > 0 ? (
        <textarea name={name} defaultValue={defaultValue} rows={rows}
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40"
        />
      ) : (
        <input type="text" name={name} defaultValue={defaultValue}
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40"
        />
      )}
    </div>
  );
}

export function HakkimizdaEditor(props: Props) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaved(false); setError("");
    startTransition(async () => {
      const res = await saveHakkimizda(fd);
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else setError(res.error ?? "Hata oluştu.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {/* İstatistikler */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-yellow">
          İstatistik Kartları
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {([1,2,3] as const).map((n) => (
            <div key={n} className="space-y-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <Field label={`Sayı ${n}`} name={`about_stat${n}_num`}
                defaultValue={(props as Record<string,string>)[`stat${n}_num`]} />
              <Field label={`Açıklama ${n}`} name={`about_stat${n}_desc`}
                defaultValue={(props as Record<string,string>)[`stat${n}_desc`]} />
            </div>
          ))}
        </div>
      </section>

      {/* Hikaye */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-yellow">
          Hikayemiz
        </h2>
        <p className="mb-3 text-xs text-white/35">
          Paragrafları ayırmak için boş satır bırakın.
        </p>
        <Field label="Hikaye metni" name="about_story" defaultValue={props.story} rows={5} />
      </section>

      {/* Misyon / Vizyon */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-yellow">
          Misyon &amp; Vizyon
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Misyonumuz" name="about_mission" defaultValue={props.mission} rows={3} />
          <Field label="Vizyonumuz" name="about_vision" defaultValue={props.vision} rows={3} />
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={isPending}
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
