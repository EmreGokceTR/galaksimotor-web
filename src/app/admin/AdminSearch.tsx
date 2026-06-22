"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type Hit = { label: string; sub?: string; href: string };
type Group = { title: string; icon: string; items: Hit[] };

export function AdminSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Düz liste — klavye navigasyonu için
  const flat: Hit[] = groups.flatMap((g) => g.items);

  // Ctrl/Cmd+K ile aç
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
    else {
      setQ("");
      setGroups([]);
      setActive(0);
    }
  }, [open]);

  // Debounced arama
  useEffect(() => {
    if (q.trim().length < 2) {
      setGroups([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/admin/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setGroups(data.groups ?? []);
        setActive(0);
      } catch {
        setGroups([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && flat[active]) {
      e.preventDefault();
      go(flat[active].href);
    }
  }

  let idx = -1;

  return (
    <>
      {/* Tetikleyici buton */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/60 transition hover:border-brand-yellow/40 hover:text-brand-yellow"
      >
        <span>🔍</span>
        <span className="hidden sm:inline">Ara…</span>
        <kbd className="hidden rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/50 sm:inline">
          Ctrl K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 p-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-[#0f0f0f] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-4">
              <span className="text-white/40">🔍</span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Ürün, sipariş, müşteri, hasar dosyası ara…"
                className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-white/30"
              />
              {loading && <span className="text-xs text-white/40">…</span>}
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-2">
              {q.trim().length < 2 ? (
                <p className="px-3 py-6 text-center text-xs text-white/35">
                  Aramak için en az 2 karakter yazın.
                </p>
              ) : flat.length === 0 && !loading ? (
                <p className="px-3 py-6 text-center text-xs text-white/35">
                  Sonuç bulunamadı.
                </p>
              ) : (
                groups.map((g) => (
                  <div key={g.title} className="mb-2">
                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/35">
                      {g.icon} {g.title}
                    </div>
                    {g.items.map((it) => {
                      idx++;
                      const isActive = idx === active;
                      return (
                        <button
                          key={`${g.title}-${it.href}-${it.label}`}
                          type="button"
                          onClick={() => go(it.href)}
                          className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition ${
                            isActive ? "bg-brand-yellow/15" : "hover:bg-white/5"
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm text-white">
                              {it.label}
                            </span>
                            {it.sub && (
                              <span className="block truncate text-[11px] text-white/40">
                                {it.sub}
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 text-white/25">→</span>
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
