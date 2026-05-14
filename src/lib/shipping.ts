import { getSettings } from "@/lib/site-settings";
import { SITE } from "@/config/site";

export type ShippingConfig = {
  /** Sabit kargo ücreti (TRY). */
  fee: number;
  /** Bu tutar üstündeki sepetler için kargo ücretsiz. */
  freeLimit: number;
  /** Ortalama teslim süresi (gün). */
  estimatedDays: number;
};

/** siteSetting → number, parse hatalarında fallback. */
function num(bag: Record<string, string>, key: string, fallback: number): number {
  const raw = bag[key];
  if (!raw) return fallback;
  const n = Number(raw);
  return isNaN(n) ? fallback : n;
}

/** Kargo ayarlarını siteSetting'den çek (yoksa SITE.shipping fallback). */
export async function getShippingConfig(): Promise<ShippingConfig> {
  const bag = await getSettings([
    "shipping_fee",
    "free_shipping_limit",
    "estimated_delivery_days",
  ]);
  return {
    fee: num(bag, "shipping_fee", SITE.shipping.fee),
    freeLimit: num(bag, "free_shipping_limit", SITE.shipping.freeOver),
    estimatedDays: num(bag, "estimated_delivery_days", 3),
  };
}

/** Sepet ara toplamına göre kargo ücretini hesapla. */
export function computeShippingFromConfig(
  subtotal: number,
  cfg: ShippingConfig
): { fee: number; free: boolean; remainingForFree: number } {
  if (subtotal >= cfg.freeLimit) {
    return { fee: 0, free: true, remainingForFree: 0 };
  }
  return {
    fee: cfg.fee,
    free: false,
    remainingForFree: Math.max(0, cfg.freeLimit - subtotal),
  };
}

