"use client";

import { useState, useTransition } from "react";
import { clearTestData } from "./_actions/danger";

export function DangerZone() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleClear() {
    setError(null);
    startTransition(async () => {
      const res = await clearTestData(text);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setDone(true);
      setTimeout(() => {
        setOpen(false);
        setDone(false);
        setText("");
      }, 2000);
    });
  }

  return (
    <div className="mt-10 rounded-2xl border border-rose-400/30 bg-rose-500/[0.04] p-5">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-300">
            Tehlikeli Bölge
          </h3>
          <p className="mt-1 text-xs text-white/55">
            Tüm test ürün, motosiklet, sipariş, blog ve fitment kayıtlarını siler. Kategoriler, kullanıcılar ve site ayarları korunur.
          </p>
        </div>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="rounded-full border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/20"
          >
            Test Verilerini Temizle
          </button>
        )}
      </header>

      {open && (
        <div className="mt-4 space-y-3 border-t border-rose-400/20 pt-4">
          {done ? (
            <p className="text-sm text-emerald-300">✅ Veriler temizlendi.</p>
          ) : (
            <>
              <p className="text-xs text-white/65">
                Onaylamak için aşağıya büyük harflerle <code className="rounded bg-rose-500/15 px-1.5 py-0.5 text-rose-200">SIL</code> yaz.
              </p>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="SIL"
                className="w-40 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-rose-400"
              />
              {error && <p className="text-xs text-rose-300">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  disabled={pending || text !== "SIL"}
                  className="rounded-full bg-rose-500 px-5 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
                >
                  {pending ? "Siliniyor..." : "Kalıcı Olarak Sil"}
                </button>
                <button
                  onClick={() => { setOpen(false); setText(""); setError(null); }}
                  className="rounded-full border border-white/15 px-5 py-2 text-xs text-white/70"
                >
                  İptal
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}