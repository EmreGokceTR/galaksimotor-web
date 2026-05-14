"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";

export type FaqItem = { q: string; a: string };

export async function saveSssItems(
  items: FaqItem[]
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdminContext();
    const value = JSON.stringify(items);
    await prisma.siteSetting.upsert({
      where: { key: "sss_items" },
      update: { value },
      create: { key: "sss_items", value, type: "json", label: "SSS Maddeleri" },
    });
    revalidatePath("/sss");
    revalidatePath("/admin/ayarlar/sss");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Kayıt başarısız." };
  }
}
