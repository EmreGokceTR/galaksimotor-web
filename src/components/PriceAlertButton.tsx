"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Props = {
  productId: string;
  className?: string;
};

export function PriceAlertButton({ productId, className = "" }: Props) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.email) setEmail((prev) => prev || session.user!.email!);
  }, [session?.user?.email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/price-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bir şeyler ters gitti.");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Bir şeyler ters gitti.");
    }
  }

  if (status === "done") {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 ${className}`}
      >
        <BellIcon />
        Fiyat düşünce sana haber vereceğiz!
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/75 transition hover:border-brand-yellow/40 hover:text-brand-yellow ${className}`}
      >
        <BellIcon />
        İndirime Girince Haber Ver
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1.5 pl-4 pr-1.5 ${className}`}
    >
      <BellIcon />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-posta adresin"
        className="min-w-[160px] flex-1 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-brand-yellow px-3 py-1.5 text-xs font-semibold text-brand-black transition hover:brightness-110 disabled:opacity-50"
      >
        {status === "loading" ? "..." : "Kaydet"}
      </button>
      {error && (
        <span className="w-full text-xs text-rose-400">{error}</span>
      )}
    </form>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
