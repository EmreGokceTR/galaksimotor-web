"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { EditableWrapper } from "@/components/EditableWrapper";

type Bike = {
  id: string;
  motorcycleId: string;
  nickname: string | null;
  brand: string;
  model: string;
  year: number;
};

type GarageSettings = {
  title: string;
  subtitle: string;
  emptyText: string;
  addBtnLabel: string;
};

const R = ["/hesabim/garaj"];
const currentYear = new Date().getFullYear();

export function GarageClient({
  bikes: initial,
  settings: s,
}: {
  bikes: Bike[];
  settings: GarageSettings;
}) {
  const router = useRouter();
  const [bikes, setBikes] = useState<Bike[]>(initial);
  const [adding, setAdding] = useState(initial.length === 0);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number>(currentYear);
  const [nickname, setNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/garage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, model, year, nickname }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Eklenemedi.");
        setSubmitting(false);
        return;
      }
      setBrand(""); setModel(""); setNickname(""); setAdding(false);
      router.refresh();
      const r = await fetch("/api/garage");
      const d = await r.json();
      setBikes(d.items);
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Bu motoru garajdan sileceğim, onaylıyor musun?")) return;
    const res = await fetch(`/api/garage/${id}`, { method: "DELETE" });
    if (res.ok) setBikes((b) => b.filter((x) => x.id !== id));
  }

  return (
    <div>
      <header className="mb-5 flex items-center justify-between">
        <div>
          <EditableWrapper
            table="siteSetting"
            id="garage_title"
            field="value"
            value={s.title}
            label="Garaj Başlık"
            revalidatePaths={R}
          >
            <h2 className="text-xl font-bold text-white">{s.title}</h2>
          </EditableWrapper>
          <EditableWrapper
            table="siteSetting"
            id="garage_subtitle"
            field="value"
            value={s.subtitle}
            label="Garaj Alt Yazı"
            fieldType="textarea"
            revalidatePaths={R}
          >
            <p className="text-sm text-white/55">{s.subtitle}</p>
          </EditableWrapper>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="rounded-full bg-brand-yellow px-4 py-2 text-sm font-semibold text-brand-black"
          >
            <EditableWrapper
              table="siteSetting"
              id="garage_add_btn"
              field="value"
              value={s.addBtnLabel}
              label="Motor Ekle Butonu"
              revalidatePaths={R}
              as="span"
            >
              {s.addBtnLabel}
            </EditableWrapper>
          </button>
        )}
      </header>

      <AnimatePresence>
        {adding && (
          <motion.form
            onSubmit={add}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-md"
          >
            <div className="grid gap-3 p-5 sm:grid-cols-4">
              <Field label="Marka" value={brand} onChange={setBrand} placeholder="Honda" required />
              <Field label="Model" value={model} onChange={setModel} placeholder="PCX 160" required />
              <Field label="Yıl" type="number" value={year.toString()} onChange={(v) => setYear(Number(v))} required />
              <Field label="Lakap (ops.)" value={nickname} onChange={setNickname} placeholder="Yıldırım" />
            </div>
            {error && (
              <div className="border-t border-rose-400/20 bg-rose-500/10 px-5 py-2 text-xs text-rose-200">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-2 border-t border-white/10 bg-black/20 px-5 py-3">
              <button type="button" onClick={() => setAdding(false)} className="rounded-full border border-white/15 px-4 py-1.5 text-xs text-white/70">
                İptal
              </button>
              <button type="submit" disabled={submitting || !brand || !model} className="rounded-full bg-brand-yellow px-4 py-1.5 text-xs font-semibold text-brand-black disabled:opacity-50">
                {submitting ? "Ekleniyor..." : "Garaja Ekle"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {bikes.length === 0 ? (
        <EditableWrapper
          table="siteSetting"
          id="garage_empty"
          field="value"
          value={s.emptyText}
          label="Boş Garaj Mesajı"
          revalidatePaths={R}
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-white/45">
            {s.emptyText}
          </div>
        </EditableWrapper>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          <AnimatePresence>
            {bikes.map((b) => (
              <motion.li
                key={b.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-yellow/15 text-brand-yellow ring-1 ring-brand-yellow/30">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6}>
                      <circle cx="5" cy="17" r="3" />
                      <circle cx="19" cy="17" r="3" />
                      <path d="M8 17h8l-3-7h-2l-1 2H7l3 5Z" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {b.brand} {b.model}
                    </div>
                    <div className="text-xs text-white/45">
                      {b.year}{b.nickname && ` · ${b.nickname}`}
                    </div>
                  </div>
                </div>
                <button onClick={() => remove(b.id)} className="text-xs text-white/40 hover:text-rose-300" aria-label="Sil">
                  Sil
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-wider text-white/55">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-glass w-full rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none"
      />
    </label>
  );
}
