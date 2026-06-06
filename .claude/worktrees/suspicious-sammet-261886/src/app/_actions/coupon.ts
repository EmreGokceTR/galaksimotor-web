"use server";

import { revalidatePath } from "next/cache";
import { CouponType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";
import { logActivity } from "@/lib/activity-log";
import { validateCoupon } from "@/lib/coupon";

const R = ["/sepet", "/admin"];

// ─── Müşteri: kuponu sepette doğrula ─────────────────────────────────────────

export type ApplyCouponResult =
  | {
      ok: true;
      code: string;
      type: CouponType;
      discount: number;
      message: string;
    }
  | { ok: false; error: string };

export async function applyCouponForCart(
  code: string,
  subtotal: number
): Promise<ApplyCouponResult> {
  const v = await validateCoupon(code, subtotal);
  if (!v.ok) return { ok: false, error: v.error };
  const message =
    v.type === CouponType.PERCENT
      ? `%${Number(v.coupon.amount)} indirim uygulandı`
      : `${Number(v.coupon.amount).toLocaleString("tr-TR", {
          style: "currency",
          currency: "TRY",
        })} indirim uygulandı`;
  return {
    ok: true,
    code: v.coupon.code,
    type: v.type,
    discount: v.discount,
    message,
  };
}

// ─── Admin: kupon oluştur ────────────────────────────────────────────────────

export async function createCoupon(input: {
  code: string;
  type: "PERCENT" | "FIXED";
  amount: number;
  minOrderAmount?: number | null;
  expiryDate?: string | null;
  usageLimit?: number | null;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { email } = await assertAdminContext();
  const code = input.code.trim().toUpperCase();
  if (!code) return { ok: false, error: "Kod zorunlu." };
  if (!input.amount || isNaN(input.amount) || input.amount <= 0)
    return { ok: false, error: "Tutar 0'dan büyük olmalı." };
  if (input.type === "PERCENT" && input.amount > 100)
    return { ok: false, error: "Yüzde indirim 100'ü geçemez." };

  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) return { ok: false, error: "Bu kod zaten kullanılıyor." };

  const coupon = await prisma.coupon.create({
    data: {
      code,
      type: input.type,
      amount: input.amount,
      minOrderAmount: input.minOrderAmount ?? null,
      expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
      usageLimit: input.usageLimit ?? null,
      isActive: true,
    },
  });

  await logActivity(email, "coupon_create", `coupon:${coupon.id}`, {
    code,
    type: input.type,
    amount: input.amount,
  });

  for (const path of R) revalidatePath(path);
  return { ok: true, id: coupon.id };
}

// ─── Admin: kupon sil ────────────────────────────────────────────────────────

export async function deleteCoupon(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { email } = await assertAdminContext();
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return { ok: false, error: "Kupon bulunamadı." };
  await prisma.coupon.delete({ where: { id } });
  await logActivity(email, "coupon_delete", `coupon:${id}`, {
    code: coupon.code,
  });
  for (const path of R) revalidatePath(path);
  return { ok: true };
}

// ─── Admin: kuponu pasifleştir/aktive et ─────────────────────────────────────

export async function toggleCouponActive(
  id: string
): Promise<{ ok: true; isActive: boolean } | { ok: false; error: string }> {
  const { email } = await assertAdminContext();
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return { ok: false, error: "Kupon bulunamadı." };
  const updated = await prisma.coupon.update({
    where: { id },
    data: { isActive: !coupon.isActive },
  });
  await logActivity(email, "coupon_toggle", `coupon:${id}`, {
    code: coupon.code,
    active: updated.isActive,
  });
  for (const path of R) revalidatePath(path);
  return { ok: true, isActive: updated.isActive };
}
