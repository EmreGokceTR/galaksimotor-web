"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";

const ABOUT_KEYS = [
  "about_stat1_num", "about_stat1_desc",
  "about_stat2_num", "about_stat2_desc",
  "about_stat3_num", "about_stat3_desc",
  "about_story",
  "about_mission",
  "about_vision",
] as const;

const LABELS: Record<string, string> = {
  about_stat1_num: "İstatistik 1 — Sayı",
  about_stat1_desc: "İstatistik 1 — Açıklama",
  about_stat2_num: "İstatistik 2 — Sayı",
  about_stat2_desc: "İstatistik 2 — Açıklama",
  about_stat3_num: "İstatistik 3 — Sayı",
  about_stat3_desc: "İstatistik 3 — Açıklama",
  about_story: "Hikayemiz",
  about_mission: "Misyonumuz",
  about_vision: "Vizyonumuz",
};

export async function saveHakkimizda(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdminContext();
    await Promise.all(
      ABOUT_KEYS.map((key) => {
        const value = (formData.get(key) as string | null) ?? "";
        return prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value, type: "text", label: LABELS[key] ?? key },
        });
      })
    );
    revalidatePath("/hakkimizda");
    revalidatePath("/admin/ayarlar/hakkimizda");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Kayıt başarısız." };
  }
}
