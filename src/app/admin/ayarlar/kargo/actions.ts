"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";
import { logActivity } from "@/lib/activity-log";

const NUMERIC_KEYS = [
  "shipping_fee",
  "free_shipping_limit",
  "estimated_delivery_days",
] as const;

const LABELS: Record<string, string> = {
  shipping_fee: "Kargo Ücreti",
  free_shipping_limit: "Ücretsiz Kargo Eşiği",
  estimated_delivery_days: "Tahmini Teslim (gün)",
};

export async function saveShippingSettings(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { email } = await assertAdminContext();

    // Doğrulama: tüm değerler negatif olmayan sayı olmalı
    const values: Record<string, string> = {};
    for (const key of NUMERIC_KEYS) {
      const raw = ((formData.get(key) as string | null) ?? "").trim();
      const n = Number(raw);
      if (raw === "" || isNaN(n) || n < 0) {
        return { ok: false, error: `${LABELS[key]} için geçerli bir sayı girin.` };
      }
      // Teslim süresi tam sayı olmalı
      values[key] = key === "estimated_delivery_days" ? String(Math.round(n)) : String(n);
    }

    await Promise.all(
      NUMERIC_KEYS.map((key) =>
        prisma.siteSetting.upsert({
          where: { key },
          update: { value: values[key] },
          create: { key, value: values[key], type: "number", label: LABELS[key] },
        })
      )
    );

    await logActivity(email, "update", "settings:shipping", values);

    revalidateTag("site-settings");
    revalidatePath("/sepet");
    revalidatePath("/odeme");
    revalidatePath("/urunler");
    revalidatePath("/kargo");
    revalidatePath("/admin/ayarlar/kargo");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Kayıt başarısız." };
  }
}
