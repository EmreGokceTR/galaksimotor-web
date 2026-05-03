"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/admin";

export async function saveFitments(productId: string, motorcycleIds: string[]) {
  await assertAdmin();

  const unique = Array.from(new Set(motorcycleIds));

  await prisma.$transaction([
    prisma.fitment.deleteMany({ where: { productId } }),
    ...(unique.length > 0
      ? [
          prisma.fitment.createMany({
            data: unique.map((motorcycleId) => ({ productId, motorcycleId })),
          }),
        ]
      : []),
  ]);

  revalidatePath(`/admin/urunler/${productId}/fitments`);
  revalidatePath("/urunler");
}