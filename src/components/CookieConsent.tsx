"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CONSENT_KEY = "gm_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
  }, []);

  const respond = (value: "granted" | "denied") => {
    localStorage.setItem(CONSENT_KEY, value);
    window.dispatchEvent(new Event("gm-consent-update"));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Çerez bildirimi"
      className="fixed bottom-4 left-4 right-4 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-300 md:left-auto md:right-6 md:max-w-sm"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-brand-black/80 p-5 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        {/* sarı parıltı */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-brand-yellow/10 blur-3xl"
        />

        <p className="relative text-sm leading-relaxed text-white/80">
          Galaksi Motor, daha iyi bir deneyim sunmak için çerezler kullanır.{" "}
          <Link
            href="/gizlilik-politikasi"
            className="font-medium text-brand-yellow underline-offset-2 hover:underline"
          >
            Gizlilik Politikası
          </Link>
        </p>

        <div className="relative mt-4 flex gap-2.5">
          <button
            onClick={() => respond("granted")}
            className="flex-1 rounded-xl bg-brand-yellow px-4 py-2 text-sm font-semibold text-brand-black transition hover:brightness-105 active:scale-95"
          >
            Kabul Et
          </button>
          <button
            onClick={() => respond("denied")}
            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition hover:border-white/30 hover:text-white active:scale-95"
          >
            Reddet
          </button>
        </div>
      </div>
    </div>
  );
}
