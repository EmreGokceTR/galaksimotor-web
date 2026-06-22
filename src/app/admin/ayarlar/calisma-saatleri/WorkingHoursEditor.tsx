"use client";

import { useState, useTransition } from "react";
import { saveWorkingHours } from "./actions";

type Props = {
  start: number;
  end: number;
  slotMinutes: number;
  saturdayOpen: boolean;
  sundayOpen: boolean;
  weekdaysText: string;
  saturdayText: string;
  sundayText: string;
};

export function WorkingHoursEditor(props: Props) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false);
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveWorkingHours(fd);
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(res.error ?? "Hata oluştu.");
      }
    });
  }

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40 placeholder:text-white/25";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">
          Randevu Saatleri
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">Açılış (saat)</span>
            <input type="number" name="hours_start" min={0} max={23} defaultValue={props.start} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">Kapanış (saat)</span>
            <input type="number" name="hours_end" min={1} max={24} defaultValue={props.end} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">Randevu Aralığı (dk)</span>
            <input type="number" name="hours_slot_minutes" min={5} max={240} step={5} defaultValue={props.slotMinutes} className={inputCls} />
          </label>
        </div>
        <p className="text-[11px] text-white/35">
          Randevu sayfasındaki saat dilimleri bu aralığa göre oluşturulur.
          Örn: 09–20 arası 30 dakikada bir slot.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">
          Açık Günler
        </h2>
        <p className="text-[11px] text-white/35">
          Pazartesi–Cuma her zaman açıktır. Hafta sonu durumunu buradan ayarlayın.
          Kapalı günlerde randevu alınamaz ve takvimde gösterilmez.
        </p>
        <label className="flex cursor-pointer items-center gap-3">
          <input type="hidden" name="hours_open_saturday" value="0" />
          <input type="checkbox" name="hours_open_saturday" value="1" defaultChecked={props.saturdayOpen} className="h-4 w-4 rounded border-white/20 accent-brand-yellow" />
          <span className="text-sm text-white/80">Cumartesi açık</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3">
          <input type="hidden" name="hours_open_sunday" value="0" />
          <input type="checkbox" name="hours_open_sunday" value="1" defaultChecked={props.sundayOpen} className="h-4 w-4 rounded border-white/20 accent-brand-yellow" />
          <span className="text-sm text-white/80">Pazar açık</span>
        </label>
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">
          Gösterim Metinleri
        </h2>
        <p className="text-[11px] text-white/35">
          İletişim ve randevu sayfalarında görünen saat metinleri.
        </p>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">Hafta İçi</span>
          <input type="text" name="hours_weekdays_text" defaultValue={props.weekdaysText} placeholder="08:30 - 20:00" className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">Cumartesi</span>
          <input type="text" name="hours_saturday_text" defaultValue={props.saturdayText} placeholder="08:30 - 20:00" className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">Pazar</span>
          <input type="text" name="hours_sunday_text" defaultValue={props.sundayText} placeholder="Kapalı" className={inputCls} />
        </label>
      </section>

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
