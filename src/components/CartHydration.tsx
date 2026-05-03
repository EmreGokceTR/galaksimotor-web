"use client";

import { useEffect } from "react";
import { useCart } from "@/stores/cart";

/** Mount once at root to hydrate the persisted cart on the client. */
export function CartHydration() {
  useEffect(() => {
    useCart.persist.rehydrate();
  }, []);
  return null;
}
