"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";
import { logActivity } from "@/lib/activity-log";
import { ALL_TEXT_KEYS } from "./fields";

export async function saveSiteTexts(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { email } = await assertAdminContext();

    await Promise.all(
      ALL_TEXT_KEYS.map((key) => {
        const value = String(formData.get(key) ?? "");
        return prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value, type: "text" },
        });
      })
    );

    await logActivity(email, "update", "settings:site-texts", {
      count: ALL_TEXT_KEYS.length,
    });

    // Ayar cache'ini ve layout'a bağlı tüm sayfaları tazele
    revalidateTag("site-settings");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Kayıt başarısız." };
  }
}
