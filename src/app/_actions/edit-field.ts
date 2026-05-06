"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/admin";

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
  await assertAdmin();

  if (table === "siteSetting") {
    await prisma.siteSetting.upsert({
      where: { key: id },
      update: { value: String(value ?? "") },
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

  for (const path of paths) revalidatePath(path);
}
