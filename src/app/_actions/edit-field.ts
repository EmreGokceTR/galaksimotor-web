"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/admin";

// Desteklenen tablolar: genişletmek için buraya ekle.
const DELEGATE_MAP = {
  product: () => prisma.product,
  blogPost: () => prisma.blogPost,
  motorcycleListing: () => prisma.motorcycleListing,
  service: () => prisma.service,
  appointment: () => prisma.appointment,
} as const;

type SupportedTable = keyof typeof DELEGATE_MAP | "siteSetting";

/**
 * Herhangi bir tablonun herhangi bir alanını güncelleyen evrensel server action.
 *
 * @param table   - Prisma model adı (camelCase). "siteSetting" için upsert yapılır.
 * @param id      - Kaydın id'si. "siteSetting" için bu aynı zamanda key'dir.
 * @param field   - Güncellenecek alan adı. "siteSetting" için kullanılmaz (value her zaman güncellenir).
 * @param value   - Yeni değer.
 * @param paths   - revalidatePath ile yenilenecek URL'ler.
 */
export async function updateField(
  table: string,
  id: string,
  field: string,
  value: string | number | boolean | null,
  paths: string[] = []
): Promise<void> {
  await assertAdmin();

  if (table === "siteSetting") {
    await prisma.siteSetting.upsert({
      where: { key: id },
      update: { value: String(value ?? "") },
      create: { key: id, value: String(value ?? ""), type: "text" },
    });
  } else {
    const delegate = DELEGATE_MAP[table as Exclude<SupportedTable, "siteSetting">];
    if (!delegate) throw new Error(`Desteklenmeyen tablo: "${table}"`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (delegate() as any).update({
      where: { id },
      data: { [field]: value },
    });
  }

  for (const path of paths) revalidatePath(path);
}
