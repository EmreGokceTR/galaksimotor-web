"use client";

import { create } from "zustand";

type State = {
  ids: Set<string>;
  loaded: boolean;
  load: () => Promise<void>;
  toggle: (productId: string) => Promise<{ favorited: boolean } | { error: string }>;
};

export const useFavorites = create<State>((set, get) => ({
  ids: new Set(),
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    try {
      const res = await fetch("/api/favorites");
      if (!res.ok) {
        set({ loaded: true });
        return;
      }
      const data: { ids: string[] } = await res.json();
      set({ ids: new Set(data.ids), loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  toggle: async (productId) => {
    // optimistic
    const prev = new Set(get().ids);
    const next = new Set(prev);
    const wasFavorited = next.has(productId);
    if (wasFavorited) next.delete(productId);
    else next.add(productId);
    set({ ids: next });

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) {
        set({ ids: prev });
        const data = await res.json().catch(() => ({}));
        return { error: data.error ?? "İşlem başarısız." };
      }
      const data: { favorited: boolean } = await res.json();
      return data;
    } catch {
      set({ ids: prev });
      return { error: "Bağlantı hatası." };
    }
  },
}));
