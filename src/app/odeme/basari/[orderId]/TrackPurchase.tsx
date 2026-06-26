"use client";

import { useEffect, useRef } from "react";
import { trackEvent, type GtagItem } from "@/lib/gtag";

/**
 * GA4 "purchase" olayını (bir kez) gönderir. Aynı sipariş için tarayıcıda
 * tekrar gönderilmesin diye sessionStorage ile guard'lanır.
 */
export function TrackPurchase({
  orderNumber,
  value,
  shipping,
  items,
}: {
  orderNumber: string;
  value: number;
  shipping: number;
  items: GtagItem[];
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const key = `ga_purchase_${orderNumber}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* sessionStorage yoksa yine de gönder */
    }
    trackEvent("purchase", {
      transaction_id: orderNumber,
      currency: "TRY",
      value,
      shipping,
      items,
    });
  }, [orderNumber, value, shipping, items]);

  return null;
}
