"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";
import { logActivity } from "@/lib/activity-log";
import { SOCIAL_KEYS, SOCIAL_META } from "@/lib/social";

export async function saveSocialLinks(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { email } = await assertAdminContext();

    const values: Record<string, string> = {};
    for (const key of SOCIAL_KEYS) {
      const raw = ((formData.get(key) as string | null) ?? "").trim();
      // Boş bırakılabilir; doluysa http(s) ile başlamalı
      if (raw && !/^https?:\/\//i.test(raw)) {
        return {
          ok: false,
          error: `${SOCIAL_META[key].label} bağlantısı http:// veya https:// ile başlamalı.`,
        };
      }
      values[key] = raw;
    }

    await Promise.all(
      SOCIAL_KEYS.map((key) =>
        prisma.siteSetting.upsert({
          where: { key },
          update: { value: values[key] },
          create: { key, value: values[key], type: "url", label: SOCIAL_META[key].label },
        })
      )
    );

    await logActivity(email, "update", "settings:social", values);

    revalidateTag("site-settings");
    revalidatePath("/");
    revalidatePath("/admin/ayarlar/sosyal-medya");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Kayıt başarısız." };
  }
}
