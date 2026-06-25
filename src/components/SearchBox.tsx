"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBox({
  initial = "",
  autoFocus = false,
  compact = false,
  onNavigate,
}: {
  initial?: string;
  autoFocus?: boolean;
  /** Dar (navbar) görünüm */
  compact?: boolean;
  /** Yönlendirmeden hemen önce çağrılır (ör. mobil menüyü kapat) */
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault(); // tarayıcının native gönderimini durdur — kontrol bizde
    const temiz = q.trim();
    if (!temiz) return;
    onNavigate?.();
    router.push(`/arama?q=${encodeURIComponent(temiz)}`);
  }

  return (
    <form onSubmit={handleSearch} role="search" className="relative w-full">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <circle cx="7" cy="7" r="5" />
          <path d="M11 11l3 3" />
        </svg>
      </span>
      <input
        type="search"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        enterKeyHint="search"
        aria-label="Sitede ara"
        placeholder="Ürün, marka, model, yazı ara…"
        className={`w-full rounded-full border border-white/15 bg-white/[0.06] pl-9 pr-20 text-white placeholder:text-white/35 outline-none focus:border-brand-yellow/50 ${
          compact ? "py-1.5 text-sm" : "py-2.5 text-sm"
        }`}
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-brand-yellow px-4 py-1 text-xs font-semibold text-brand-black transition hover:bg-brand-yellow/80"
      >
        Ara
      </button>
    </form>
  );
}
