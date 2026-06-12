"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";
import { logActivity } from "@/lib/activity-log";
import { pingIndexNow } from "@/lib/indexnow";
import { SITE } from "@/config/site";

const DELEGATE_MAP = {
  product: () => prisma.product,
  blogPost: () => prisma.blogPost,
  motorcycleListing: () => prisma.motorcycleListing,
  service: () => prisma.service,
  appointment: () => prisma.appointment,
} as const;

type SupportedTable = keyof typeof DELEGATE_MAP | "siteSetting";

export async function updateField(
  table: string,
  id: string,
  field: string,
  value: string | number | boolean | null,
  paths: string[] = [],
  settingType = "text"
): Promise<void> {
  const { email } = await assertAdminContext();

  if (table === "siteSetting") {
    await prisma.siteSetting.upsert({
      where: { key: id },
      update: { value: String(value ?? ""), type: settingType },
      create: { key: id, value: String(value ?? ""), type: settingType },
    });
  } else {
    const delegate =
      DELEGATE_MAP[table as Exclude<SupportedTable, "siteSetting">];
    if (!delegate) throw new Error(`Desteklenmeyen tablo: "${table}"`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (delegate() as any).update({
      where: { id },
      data: { [field]: value },
    });
  }

  const preview =
    typeof value === "string" && value.length > 120
      ? value.slice(0, 120) + "…"
      : value;

  await logActivity(email, "update", `${table}:${id}:${field}`, {
    value: preview,
  });

  // siteSetting cache tag'ini de yenile — layout/page'lerin getSettings cache'i temizlenir
  if (table === "siteSetting") {
    revalidateTag("site-settings");
  }

  for (const path of paths) revalidatePath(path);

  // IndexNow — değişen sayfaları Bing/Yandex/Seznam'a bildir.
  // Sadece kamuya açık sayfalar için (admin/, /api/, /hesabim hariç).
  if (paths.length > 0) {
    const publicUrls = paths
      .filter((p) => !p.startsWith("/admin") && !p.startsWith("/api") && !p.startsWith("/hesabim"))
      .map((p) => `${SITE.url}${p}`);
    if (publicUrls.length > 0) {
      // Await etmiyoruz — admin'in kayıt akışını blocklamasın
      void pingIndexNow(publicUrls);
    }
  }
}
