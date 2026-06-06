"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";
import { pathKey } from "@/lib/page-meta";

export async function saveSeoPage(
  path: string,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdminContext();
    const k = pathKey(path);
    const title = (formData.get("title") as string | null)?.trim() ?? "";
    const desc  = (formData.get("desc")  as string | null)?.trim() ?? "";

    await Promise.all([
      prisma.siteSetting.upsert({
        where: { key: `meta_title_${k}` },
        update: { value: title },
        create: { key: `meta_title_${k}`, value: title, type: "text", label: `SEO Başlık: ${path}` },
      }),
      prisma.siteSetting.upsert({
        where: { key: `meta_desc_${k}` },
        update: { value: desc },
        create: { key: `meta_desc_${k}`, value: desc, type: "text", label: `SEO Açıklama: ${path}` },
      }),
    ]);

    revalidatePath(path);
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Kayıt başarısız." };
  }
}
