"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

/**
 * Üyelik silme butonu — KVKK uyumlu, çift onaylı.
 *
 *  1) Tıklanır → modal açılır
 *  2) Kullanıcı "HESABIMI SIL" yazar → buton aktifleşir
 *  3) Onaylanır → API çağrısı + signOut + ana sayfaya yönlendir
 */
export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirm === "HESABIMI SIL";

  async function handleDelete() {
    if (!canDelete || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "HESABIMI SIL" }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Silme başarısız.");
      }
      // Oturumu kapat, ana sayfaya at
      await signOut({ callbackUrl: "/?account_deleted=1" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bilinmeyen hata.");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-200 transition hover:border-rose-400 hover:bg-rose-500/20 hover:text-rose-100"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
        Hesabımı Sil
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-brand-black/95 p-6 shadow-2xl">
            <h2
              id="delete-account-title"
              className="mb-3 text-lg font-bold text-white"
            >
              Hesabınızı silmek istediğinize emin misiniz?
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-white/65">
              Adınız, e-postanız, şifreniz, telefon numaranız ve diğer kişisel
              verileriniz <strong className="text-white">kalıcı olarak</strong>{" "}
              silinir. Favoriler, garaj, randevular kaybolur.
            </p>
            <p className="mb-5 rounded-md bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-200">
              <strong>Not:</strong> Sipariş geçmişiniz yasal yükümlülük
              (TBK md.146 — 10 yıl) gereği anonim olarak saklanır; ancak hiçbir
              kişisel bilgiyle ilişkilendirilemez.
            </p>

            <label className="mb-1.5 block text-xs uppercase tracking-wider text-white/55">
              Onaylamak için aşağıya{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-rose-300">
                HESABIMI SIL
              </code>{" "}
              yazın
            </label>
            <input
              type="text"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="off"
              placeholder="HESABIMI SIL"
              className="input-glass mb-4 w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none"
            />

            {error && (
              <p className="mb-3 rounded-md bg-rose-500/15 px-3 py-2 text-xs text-rose-200">
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setConfirm("");
                  setError(null);
                }}
                disabled={loading}
                className="rounded-full border border-white/15 px-5 py-2 text-sm text-white/70 hover:text-white disabled:opacity-50"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!canDelete || loading}
                className="rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:bg-rose-500/40"
              >
                {loading ? "Siliniyor..." : "Evet, hesabımı sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
