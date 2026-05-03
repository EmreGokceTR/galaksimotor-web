"use client";

import { useEffect } from "react";
import { useCart } from "@/stores/cart";

export function ClearCartOnMount() {
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    // Tiny defer so React commit doesn't fight with persist hydration
    const t = setTimeout(() => clear(), 50);
    return () => clearTimeout(t);
  }, [clear]);
  return null;
}
