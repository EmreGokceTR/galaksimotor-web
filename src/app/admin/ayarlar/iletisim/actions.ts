"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";

const KEYS = ["contact_address", "contact_phone", "contact_email"] as const;
const LABELS: Record<string, string> = {
  contact_address: "Adres",
  contact_phone: "Telefon",
  contact_email: "E-posta",
};

export async function saveIletisim(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdminContext();
    await Promise.all(
      KEYS.map((key) => {
        const value = (formData.get(key) as string | null) ?? "";
        return prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value, type: "text", label: LABELS[key] ?? key },
        });
      })
    );
    revalidatePath("/");
    revalidatePath("/iletisim");
    revalidatePath("/admin/ayarlar/iletisim");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Kayıt başarısız." };
  }
}
