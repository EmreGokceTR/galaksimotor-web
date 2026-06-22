"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";
import { logActivity } from "@/lib/activity-log";

const LABELS: Record<string, string> = {
  hours_start: "Açılış Saati",
  hours_end: "Kapanış Saati",
  hours_slot_minutes: "Randevu Aralığı",
  hours_open_saturday: "Cumartesi Açık",
  hours_open_sunday: "Pazar Açık",
  hours_weekdays_text: "Hafta İçi Metni",
  hours_saturday_text: "Cumartesi Metni",
  hours_sunday_text: "Pazar Metni",
};

export async function saveWorkingHours(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { email } = await assertAdminContext();

    const start = Number(formData.get("hours_start"));
    const end = Number(formData.get("hours_end"));
    const slot = Number(formData.get("hours_slot_minutes"));

    if (isNaN(start) || start < 0 || start > 23)
      return { ok: false, error: "Açılış saati 0-23 arası olmalı." };
    if (isNaN(end) || end < 1 || end > 24)
      return { ok: false, error: "Kapanış saati 1-24 arası olmalı." };
    if (end <= start)
      return { ok: false, error: "Kapanış saati açılıştan sonra olmalı." };
    if (isNaN(slot) || slot < 5 || slot > 240)
      return { ok: false, error: "Randevu aralığı 5-240 dakika arası olmalı." };

    const values: Record<string, string> = {
      hours_start: String(Math.round(start)),
      hours_end: String(Math.round(end)),
      hours_slot_minutes: String(Math.round(slot)),
      hours_open_saturday: formData.getAll("hours_open_saturday").includes("1")
        ? "true"
        : "false",
      hours_open_sunday: formData.getAll("hours_open_sunday").includes("1")
        ? "true"
        : "false",
      hours_weekdays_text: ((formData.get("hours_weekdays_text") as string) ?? "").trim(),
      hours_saturday_text: ((formData.get("hours_saturday_text") as string) ?? "").trim(),
      hours_sunday_text: ((formData.get("hours_sunday_text") as string) ?? "").trim(),
    };

    await Promise.all(
      Object.entries(values).map(([key, value]) =>
        prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: {
            key,
            value,
            type: key.startsWith("hours_open_") ? "boolean" : "text",
            label: LABELS[key] ?? key,
          },
        })
      )
    );

    await logActivity(email, "update", "settings:working-hours", values);

    revalidateTag("site-settings");
    revalidatePath("/randevu");
    revalidatePath("/iletisim");
    revalidatePath("/admin/ayarlar/calisma-saatleri");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Kayıt başarısız." };
  }
}
