"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? theme === "dark" : true;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Aydınlık moda geç" : "Karanlık moda geç"}
      title={isDark ? "Aydınlık mod" : "Karanlık mod"}
      onClick={toggle}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors ${
        isDark
          ? "border-white/15 bg-white/10"
          : "border-black/15 bg-black/10"
      } ${className}`}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md transition-transform ${
          isDark ? "translate-x-1" : "translate-x-6"
        }`}
      >
        {isDark ? (
          /* Ay ikonu */
          <svg viewBox="0 0 24 24" className="h-3 w-3 text-zinc-700" fill="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
          </svg>
        ) : (
          /* Güneş ikonu */
          <svg viewBox="0 0 24 24" className="h-3 w-3 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="12" cy="12" r="4" fill="currentColor" />
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
          </svg>
        )}
      </span>
    </button>
  );
}
