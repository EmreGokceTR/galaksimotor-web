import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sayfa Bulunamadı (404)",
  description: "Aradığınız sayfa mevcut değil.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Arka plan parıltısı */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-yellow/6 blur-[120px]"
      />

      {/* Büyük hata kodu */}
      <p className="select-none text-[120px] font-black leading-none tracking-tighter text-white/5 md:text-[180px]">
        404
      </p>

      {/* İçerik kartı */}
      <div className="-mt-8 max-w-md rounded-2xl border border-white/10 bg-white/[0.025] p-8 backdrop-blur-md">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-yellow/10 text-brand-yellow ring-1 ring-brand-yellow/20 mx-auto">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-white">Sayfa bulunamadı</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          Aradığın sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir. Endişelenme — seni doğru rotaya alalım.
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-yellow px-5 py-2.5 text-sm font-semibold text-brand-black shadow-[0_8px_24px_-8px_rgba(255,215,0,0.5)] transition hover:brightness-105"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 8L8 2l6 6" /><path d="M3 7v7h4v-4h2v4h4V7" />
            </svg>
            Ana Sayfa
          </Link>
          <Link
            href="/iletisim"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:border-brand-yellow/40 hover:text-brand-yellow"
          >
            İletişim
          </Link>
        </div>
      </div>
    </div>
  );
}
