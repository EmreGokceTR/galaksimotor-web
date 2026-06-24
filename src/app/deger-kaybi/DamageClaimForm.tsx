"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitDamageClaim, type DamageClaimInput } from "@/app/_actions/damage-claim";

type ClaimType = DamageClaimInput["type"];

const TYPE_OPTIONS: { value: ClaimType; label: string; desc: string }[] = [
  { value: "DEGER_KAYBI", label: "Değer Kaybı", desc: "Kaza sonrası aracın piyasa değer kaybı" },
  { value: "HASAR_IHBAR", label: "Hasar İhbar", desc: "Kasko / trafik hasar dosyası açma" },
  { value: "HER_IKISI", label: "Her İkisi", desc: "Hem değer kaybı hem hasar süreci" },
];

export function DamageClaimForm() {
  const [type, setType] = useState<ClaimType>("DEGER_KAYBI");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [plate, setPlate] = useState("");
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [accidentDate, setAccidentDate] = useState("");
  const [faultStatus, setFaultStatus] = useState("");
  const [description, setDescription] = useState("");

  const [kvkk, setKvkk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!kvkk) {
      setError("Devam etmek için KVKK aydınlatma metnini onaylamanız gerekir.");
      return;
    }
    startTransition(async () => {
      const res = await submitDamageClaim({
        type,
        fullName,
        phone,
        email: email || undefined,
        plate: plate || undefined,
        vehicleBrand: vehicleBrand || undefined,
        vehicleModel: vehicleModel || undefined,
        vehicleYear: vehicleYear || undefined,
        accidentDate: accidentDate || undefined,
        faultStatus: faultStatus || undefined,
        description: description || undefined,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(res.message);
      setFullName("");
      setPhone("");
      setEmail("");
      setPlate("");
      setVehicleBrand("");
      setVehicleModel("");
      setVehicleYear("");
      setAccidentDate("");
      setFaultStatus("");
      setDescription("");
      setKvkk(false);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-strong rounded-2xl border border-white/10 p-6 backdrop-blur-md"
    >
      <header className="mb-5">
        <span className="text-[11px] uppercase tracking-[0.2em] text-brand-yellow/70">
          · Ücretsiz Ön Başvuru
        </span>
        <h3 className="mt-1.5 text-xl font-bold text-white">
          Dosyanızı <span className="text-gradient-gold">başlatın</span>
        </h3>
        <p className="mt-1 text-xs text-white/45">
          Bilgilerinizi bırakın, uzman ekibimiz sizi arayıp süreci başlatsın.
          Başvuru ücretsizdir.
        </p>
      </header>

      {/* Talep türü */}
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        {TYPE_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setType(o.value)}
            className={`rounded-xl border p-3 text-left transition ${
              type === o.value
                ? "border-brand-yellow bg-brand-yellow/10"
                : "border-white/10 bg-white/[0.025] hover:border-white/25"
            }`}
          >
            <div className="text-sm font-semibold text-white">{o.label}</div>
            <div className="mt-0.5 text-[11px] text-white/50">{o.desc}</div>
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Ad Soyad *" value={fullName} onChange={setFullName} required disabled={isPending} autoComplete="name" />
        <Field label="Telefon *" value={phone} onChange={setPhone} required disabled={isPending} autoComplete="tel" placeholder="05XX XXX XX XX" />
        <Field label="E-posta" type="email" value={email} onChange={setEmail} disabled={isPending} autoComplete="email" placeholder="Teyit e-postası için" />
        <Field label="Plaka" value={plate} onChange={setPlate} disabled={isPending} placeholder="34 ABC 123" />
        <Field label="Araç Markası" value={vehicleBrand} onChange={setVehicleBrand} disabled={isPending} placeholder="Honda, Yamaha..." />
        <Field label="Araç Modeli" value={vehicleModel} onChange={setVehicleModel} disabled={isPending} />
        <Field label="Model Yılı" value={vehicleYear} onChange={(v) => setVehicleYear(v.replace(/\D/g, "").slice(0, 4))} disabled={isPending} placeholder="2021" />
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/55">Kaza Tarihi</span>
          <input type="date" value={accidentDate} onChange={(e) => setAccidentDate(e.target.value)} disabled={isPending}
            className="input-glass w-full rounded-lg px-3.5 py-2.5 text-sm text-white outline-none disabled:opacity-50" />
        </label>
      </div>

      <div className="mt-3">
        <Field label="Kusur Durumu" value={faultStatus} onChange={setFaultStatus} disabled={isPending} placeholder="Örn: %0 kusursuz, karşı taraf kusurlu" />
      </div>

      <div className="mt-3">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/55">
            Kaza / Hasar Açıklaması
          </span>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
            placeholder="Kazanın nasıl olduğunu, hasarı ve elinizdeki belgeleri (kaza tutanağı, ekspertiz vb.) kısaca yazın..."
            className="input-glass w-full resize-none rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none disabled:opacity-50"
          />
        </label>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div key="err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-200">
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div key="ok" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-200">
            ✓ {success}
          </motion.div>
        )}
      </AnimatePresence>

      <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs leading-relaxed text-white/70">
        <input
          type="checkbox"
          checked={kvkk}
          onChange={(e) => setKvkk(e.target.checked)}
          disabled={isPending}
          className="mt-0.5 h-4 w-4 shrink-0 accent-brand-yellow"
        />
        <span>
          Kişisel verilerimin bu başvuru ve dosya süreci kapsamında işlenmesine
          ilişkin{" "}
          <a
            href="/kvkk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-yellow underline-offset-2 hover:underline"
          >
            KVKK Aydınlatma Metni
          </a>
          ni okudum, onaylıyorum.
        </span>
      </label>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-[10px] text-white/35">
          Bilgileriniz yalnızca dosyanız için kullanılır.
        </p>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={isPending || !kvkk}
          className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-6 py-2.5 text-sm font-semibold text-brand-black shadow-[0_8px_24px_-8px_rgba(255,215,0,0.65)] transition hover:shadow-[0_10px_32px_-6px_rgba(255,215,0,0.85)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Gönderiliyor..." : "Başvuruyu Gönder"}
        </motion.button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  autoComplete,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/55">
        {label}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        disabled={disabled}
        className="input-glass w-full rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none disabled:opacity-50"
      />
    </label>
  );
}
