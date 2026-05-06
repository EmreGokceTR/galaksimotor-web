"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
  /** Stable composite key: productId or productId:variantId */
  key: string;
  productId: string;
  variantId: string | null;
  slug: string;
  name: string;
  /** Variant label e.g. "Renk: Siyah" — for UI hint */
  variantLabel: string | null;
  sku: string;
  price: number;
  image: string | null;
  quantity: number;
  /** Server-known stock at the time of add (UI cap; server re-validates on order) */
  stockCap: number;
};

type AddPayload = Omit<CartItem, "key" | "quantity"> & { quantity?: number };

export type AppliedCoupon = {
  code: string;
  type: "PERCENT" | "FIXED";
  discount: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  hasHydrated: boolean;
  appliedCoupon: AppliedCoupon | null;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (item: AddPayload) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, qty: number) => void;
  inc: (key: string) => void;
  dec: (key: string) => void;
  clear: () => void;
  applyCoupon: (c: AppliedCoupon) => void;
  removeCoupon: () => void;
  /** total quantity of items (for badge) */
  count: () => number;
  subtotal: () => number;
};

const lineKey = (productId: string, variantId: string | null) =>
  variantId ? `${productId}:${variantId}` : productId;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      hasHydrated: false,
      appliedCoupon: null,

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),

      add: (payload) => {
        const key = lineKey(payload.productId, payload.variantId);
        const qtyToAdd = Math.max(1, payload.quantity ?? 1);
        const items = [...get().items];
        const existing = items.find((i) => i.key === key);

        if (existing) {
          const next = Math.min(existing.stockCap, existing.quantity + qtyToAdd);
          existing.quantity = next;
        } else {
          items.push({
            key,
            productId: payload.productId,
            variantId: payload.variantId,
            slug: payload.slug,
            name: payload.name,
            variantLabel: payload.variantLabel,
            sku: payload.sku,
            price: payload.price,
            image: payload.image,
            quantity: Math.min(payload.stockCap, qtyToAdd),
            stockCap: payload.stockCap,
          });
        }
        set({ items, isOpen: true });
      },

      remove: (key) =>
        set((s) => ({ items: s.items.filter((i) => i.key !== key) })),

      setQuantity: (key, qty) =>
        set((s) => ({
          items: s.items
            .map((i) =>
              i.key === key
                ? { ...i, quantity: Math.max(1, Math.min(i.stockCap, qty)) }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),

      inc: (key) => {
        const it = get().items.find((i) => i.key === key);
        if (!it) return;
        get().setQuantity(key, it.quantity + 1);
      },

      dec: (key) => {
        const it = get().items.find((i) => i.key === key);
        if (!it) return;
        if (it.quantity <= 1) get().remove(key);
        else get().setQuantity(key, it.quantity - 1);
      },

      clear: () => set({ items: [], appliedCoupon: null }),

      applyCoupon: (c) => set({ appliedCoupon: c }),
      removeCoupon: () => set({ appliedCoupon: null }),

      count: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
    }),
    {
      name: "galaksi-cart",
      // SSR-safe storage: fall back to a no-op store on the server
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => undefined,
              removeItem: () => undefined,
            }
      ),
      partialize: (s) => ({
        items: s.items,
        appliedCoupon: s.appliedCoupon,
      }),
      skipHydration: true,
      onRehydrateStorage: () => () => {
        // Hydration only happens on client; mark ready after rehydrate
        useCart.setState({ hasHydrated: true });
      },
    }
  )
);
