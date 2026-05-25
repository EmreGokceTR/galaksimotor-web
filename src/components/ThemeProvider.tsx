"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";

type ThemeCtx = {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
};

const Ctx = createContext<ThemeCtx | null>(null);

const STORAGE_KEY = "gm-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const root = document.documentElement;
    const initial: Theme = root.classList.contains("light") ? "light" : "dark";
    setThemeState(initial);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {}
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return <Ctx.Provider value={{ theme, toggle, setTheme }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme ThemeProvider içinde kullanılmalı");
  return ctx;
}

// Flicker'ı önleyen inline script — <head>'in başında çalışır.
// NOT: Aydınlık mod geçici olarak askıya alındı. Site her durumda DARK çalışıyor.
// Eski "light" tercihi olan kullanıcılar için de zorla dark uygulanıyor.
export const themeNoFlashScript = `
(function(){try{
  var r=document.documentElement;
  r.classList.remove('light','dark');
  r.classList.add('dark');
  try{localStorage.removeItem('${STORAGE_KEY}');}catch(_){}
}catch(e){document.documentElement.classList.add('dark');}})();
`;
