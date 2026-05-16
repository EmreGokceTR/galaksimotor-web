"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";

export async function inlineUpdateService(
  id: string,
  data: {
    name: string;
    description: string | null;
    duration: number;
    price: number | null;
  }
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdminContext();
    await prisma.service.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: data.price,
      },
    });
    revalidatePath("/randevu");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Kayıt başarısız." };
  }
}
