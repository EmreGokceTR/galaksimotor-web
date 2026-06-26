// GA4 olay gönderimi — güvenli sarmalayıcı.
// gtag yüklü değilse (çerez onayı yoksa / GA kapalıysa) sessizce hiçbir şey yapmaz.

export type GtagItem = {
  item_id: string;
  item_name: string;
  price?: number;
  quantity?: number;
  item_brand?: string;
  item_category?: string;
};

export function trackEvent(
  name: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag !== "function") return;
  w.gtag("event", name, params ?? {});
}
