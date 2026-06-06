"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Galaksi Motor]", error);
  }, [error]);

  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Arka plan parıltısı — kırmızımsı ton */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/8 blur-[120px]"
      />

      {/* Büyük hata kodu */}
      <p className="select-none text-[120px] font-black leading-none tracking-tighter text-white/5 md:text-[180px]">
        500
      </p>

      {/* İçerik kartı */}
      <div className="-mt-8 max-w-md rounded-2xl border border-white/10 bg-white/[0.025] p-8 backdrop-blur-md">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 ring-1 ring-rose-400/20 mx-auto">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-white">Bir şeyler ters gitti</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          Sunucuda beklenmedik bir hata oluştu. Lütfen sayfayı yenilemeyi dene. Sorun devam ederse bizimle iletişime geçebilirsin.
        </p>

        {error.digest && (
          <p className="mt-3 rounded-lg bg-white/5 px-3 py-1.5 font-mono text-[11px] text-white/30">
            Hata kodu: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-yellow px-5 py-2.5 text-sm font-semibold text-brand-black shadow-[0_8px_24px_-8px_rgba(255,215,0,0.5)] transition hover:brightness-105"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2v4H9" /><path d="M13 6A6 6 0 1 1 7 1" />
            </svg>
            Tekrar Dene
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:border-brand-yellow/40 hover:text-brand-yellow"
          >
            Ana Sayfa
          </Link>
        </div>
      </div>
    </div>
  );
}
