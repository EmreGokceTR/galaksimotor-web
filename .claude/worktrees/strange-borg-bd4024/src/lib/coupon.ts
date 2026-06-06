import { CouponType, type Coupon } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CouponValidation =
  | {
      ok: true;
      coupon: Coupon;
      discount: number;
      type: CouponType;
    }
  | { ok: false; error: string };

/** Verilen kupon kodunu sepet ara toplamına göre doğrular ve indirim tutarı hesaplar. */
export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<CouponValidation> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return { ok: false, error: "Kupon kodu boş." };

  const coupon = await prisma.coupon.findUnique({
    where: { code: trimmed },
  });

  if (!coupon) return { ok: false, error: "Geçersiz kupon kodu." };
  if (!coupon.isActive)
    return { ok: false, error: "Bu kupon aktif değil." };
  if (coupon.expiryDate && coupon.expiryDate.getTime() < Date.now())
    return { ok: false, error: "Bu kuponun süresi dolmuş." };
  if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit)
    return { ok: false, error: "Bu kupon kullanım limitine ulaşmış." };

  const minOrder = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0;
  if (subtotal < minOrder) {
    return {
      ok: false,
      error: `Bu kupon için minimum sepet tutarı ${minOrder.toLocaleString(
        "tr-TR",
        { style: "currency", currency: "TRY" }
      )}.`,
    };
  }

  const amt = Number(coupon.amount);
  let discount =
    coupon.type === CouponType.PERCENT
      ? Math.round((subtotal * amt) / 100 * 100) / 100
      : amt;

  // İndirim ara toplamı geçemez
  discount = Math.min(discount, subtotal);

  return { ok: true, coupon, discount, type: coupon.type };
}
