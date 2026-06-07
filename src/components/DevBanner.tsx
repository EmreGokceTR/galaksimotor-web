export function DevBanner() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="relative z-[40] w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-zinc-900"
      style={{ color: "#1a1a1a" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-3 py-1.5 text-center text-[11px] font-semibold leading-snug sm:px-4 sm:text-sm">
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 9v4M12 17h.01" />
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        </svg>
        <span>
          Sitemiz şu anda <span className="underline underline-offset-2">geliştirme aşamasındadır</span>. Bazı bölümlerde eksiklik veya hata olabilir. Anlayışınız için teşekkür ederiz.
        </span>
      </div>
    </div>
  );
}
