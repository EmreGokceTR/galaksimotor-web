import Link from "next/link";

export const metadata = { title: "Ödeme Hatası — Galaksi Motor" };

export default function PaymentErrorPage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  const reason = searchParams?.reason ?? "Ödeme tamamlanamadı.";

  return (
    <div className="mx-auto max-w-md px-6 py-24">
      <div className="glass-strong rounded-2xl border border-rose-400/30 p-8 text-center shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/15 text-rose-300">
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M9 9l6 6M15 9l-6 6" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white">Ödeme tamamlanamadı</h1>
        <p className="mt-2 text-sm text-white/55">{reason}</p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/sepet"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-yellow px-6 py-2.5 text-sm font-semibold text-brand-black"
          >
            Sepete Dön
          </Link>
          <Link
            href="/iletisim"
            className="text-xs text-white/50 hover:text-brand-yellow"
          >
            Yardım için bize ulaş
          </Link>
        </div>
      </div>
    </div>
  );
}
