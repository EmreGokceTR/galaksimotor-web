"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/admin";
import { motoSlug } from "@/lib/moto";

export async function saveFitments(productId: string, motorcycleIds: string[]) {
  await assertAdmin();

  const unique = Array.from(new Set(motorcycleIds));

  // Değişiklikten etkilenen tüm motosikletleri (eski + yeni) topla — /motosiklet
  // marka/model sayfaları bu fitment'lere göre uyumlu ürün listeliyor.
  const before = await prisma.fitment.findMany({
    where: { productId },
    select: { motorcycle: { select: { brand: true, model: true } } },
  });
  const after = await prisma.motorcycle.findMany({
    where: { id: { in: unique } },
    select: { brand: true, model: true },
  });

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

  const affected = new Map<string, { brand: string; model: string }>();
  for (const m of [...before.map((f) => f.motorcycle), ...after]) {
    affected.set(`${m.brand}|${m.model}`, m);
  }
  for (const m of affected.values()) {
    revalidatePath(`/motosiklet/${motoSlug(m.brand)}`);
    revalidatePath(`/motosiklet/${motoSlug(m.brand)}/${motoSlug(m.model)}`);
  }
}