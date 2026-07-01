"use client";

import { useState } from "react";

type Props = {
  title: string;
  text?: string;
  url: string;
  className?: string;
};

export function ShareButton({ title, text, url, className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // kullanıcı paylaşımı iptal etti — sessizce geç
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`, "_blank");
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Paylaş"
      className={`inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/75 transition hover:border-brand-yellow/40 hover:text-brand-yellow ${className}`}
    >
      {copied ? (
        <>
          <CheckIcon />
          Link kopyalandı
        </>
      ) : (
        <>
          <ShareIcon />
          Paylaş
        </>
      )}
    </button>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5 15.4 17.5M15.4 6.5 8.6 10.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-emerald-300" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 12 5 5 11-13" />
    </svg>
  );
}
