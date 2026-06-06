"use client";

import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "İstek gönderilemedi.");
        setSubmitting(false);
        return;
      }
      setMessage(data.message);
    } catch {
      setError("Beklenmeyen bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-6 py-16">
      <div className="w-full space-y-6 rounded-2xl border border-white/10 bg-white/[0.025] p-8 backdrop-blur-md">
        <header className="text-center">
          <span className="inline-block rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-brand-yellow">
            Şifremi Unuttum
          </span>
          <h1 className="mt-3 text-2xl font-bold text-white">
            Sıfırlama bağlantısı al
          </h1>
          <p className="mt-1 text-sm text-white/55">
            E-postana 60 dakika geçerli bir bağlantı göndereceğiz.
          </p>
        </header>

        {message ? (
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/55">
                E-posta
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand-yellow"
              />
            </label>

            {error && (
              <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-brand-yellow py-3 text-sm font-semibold text-brand-black shadow-[0_18px_40px_-12px_rgba(255,215,0,0.7)] transition hover:shadow-[0_24px_50px_-10px_rgba(255,215,0,0.9)] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none"
            >
              {submitting ? "Gönderiliyor..." : "Bağlantı Gönder"}
            </button>

            <p className="text-center text-xs text-white/45">
              <Link href="/giris" className="hover:text-brand-yellow">
                ← Giriş sayfasına dön
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
