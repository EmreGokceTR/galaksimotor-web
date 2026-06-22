"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ClaimStatus, ClaimType } from "@prisma/client";
import { updateClaimStatus, updateClaimDetails, deleteClaim } from "../actions";

type Props = {
  claim: {
    id: string;
    type: ClaimType;
    status: ClaimStatus;
    adminNote: string;
    faultStatus: string;
    estimatedValue: string;
  };
};

const STATUSES: { value: ClaimStatus; label: string }[] = [
  { value: "NEW", label: "Yeni" },
  { value: "CONTACTED", label: "İletişim kuruldu" },
  { value: "IN_PROGRESS", label: "Süreçte" },
  { value: "COMPLETED", label: "Sonuçlandı" },
  { value: "REJECTED", label: "İptal / Uygun değil" },
];

const TYPES: { value: ClaimType; label: string }[] = [
  { value: "DEGER_KAYBI", label: "Değer Kaybı" },
  { value: "HASAR_IHBAR", label: "Hasar İhbar" },
  { value: "HER_IKISI", label: "Değer Kaybı + Hasar" },
];

export function ClaimManager({ claim }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<ClaimStatus>(claim.status);
  const [type, setType] = useState<ClaimType>(claim.type);
  const [adminNote, setAdminNote] = useState(claim.adminNote);
  const [faultStatus, setFaultStatus] = useState(claim.faultStatus);
  const [estimatedValue, setEstimatedValue] = useState(claim.estimatedValue);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function changeStatus(next: ClaimStatus) {
    setStatus(next);
    setError(null);
    startTransition(async () => {
      const res = await updateClaimStatus(claim.id, next);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  function saveDetails() {
    setError(null);
    setSaved(false);
    const ev = estimatedValue.trim() ? parseFloat(estimatedValue) : null;
    if (estimatedValue.trim() && (isNaN(ev as number) || (ev as number) < 0)) {
      setError("Tahmini değer geçerli bir sayı olmalı.");
      return;
    }
    startTransition(async () => {
      const res = await updateClaimDetails({
        id: claim.id,
        type,
        adminNote: adminNote.trim() || null,
        faultStatus: faultStatus.trim() || null,
        estimatedValue: ev,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteClaim(claim.id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/admin/hasar-dosyalari");
    });
  }

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40 placeholder:text-white/25";

  return (
    <aside className="space-y-4 rounded-2xl border border-brand-yellow/20 bg-brand-yellow/[0.03] p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">
        Dosya Yönetimi
      </h3>

      {/* Durum */}
      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">Durum</label>
        <div className="grid grid-cols-1 gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              disabled={isPending}
              onClick={() => changeStatus(s.value)}
              className={`rounded-lg px-3 py-1.5 text-left text-xs transition disabled:opacity-50 ${
                status === s.value
                  ? "bg-brand-yellow font-semibold text-black"
                  : "border border-white/10 text-white/70 hover:bg-white/5"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tür */}
      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">Talep Türü</span>
        <select value={type} onChange={(e) => setType(e.target.value as ClaimType)} className={inputCls}>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">Kusur Durumu</span>
        <input type="text" value={faultStatus} onChange={(e) => setFaultStatus(e.target.value)} placeholder="%0 kusursuz" className={inputCls} />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">Tahmini Değer Kaybı (₺)</span>
        <input type="number" min={0} step={0.01} value={estimatedValue} onChange={(e) => setEstimatedValue(e.target.value)} placeholder="0.00" className={inputCls} />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">Dahili Not</span>
        <textarea rows={3} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Sürece dair notlar (müşteriye gösterilmez)" className={inputCls} />
      </label>

      {error && <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={saveDetails}
          className="rounded-xl bg-brand-yellow px-5 py-2 text-sm font-semibold text-black hover:bg-brand-yellow/80 disabled:opacity-50"
        >
          {isPending ? "Kaydediliyor…" : "Kaydet"}
        </button>
        {saved && <span className="text-xs font-medium text-emerald-400">✓ Kaydedildi</span>}
      </div>

      <div className="border-t border-white/10 pt-3">
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <button type="button" disabled={isPending} onClick={handleDelete} className="rounded-full bg-rose-500/20 px-3 py-1 text-xs text-rose-300 ring-1 ring-rose-400/30 hover:bg-rose-500/30 disabled:opacity-50">
              {isPending ? "Siliniyor…" : "Evet, dosyayı sil"}
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/60 hover:text-white">İptal</button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmDelete(true)} className="text-xs text-rose-400/70 hover:text-rose-400">
            Dosyayı sil
          </button>
        )}
      </div>
    </aside>
  );
}
