"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/admin";

export async function clearTestData(confirmText: string) {
  await assertAdmin();

  if (confirmText !== "SIL") {
    return { ok: false as const, error: "Onay metni hatalı." };
  }

  // FK zincirine göre sırayla sil — kategoriler ve ayarlar dokunulmaz.
  await prisma.$transaction([
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.product.deleteMany(), // cascade: image, variant, fitment, favorite, review
    prisma.userMotorcycle.deleteMany(),
    prisma.motorcycle.deleteMany(),
    prisma.blogPost.deleteMany(),
    prisma.motorcycleListing.deleteMany(),
  ]);

  revalidatePath("/admin");
  revalidatePath("/admin/urunler");
  revalidatePath("/admin/motosikletler");
  revalidatePath("/admin/blog");
  revalidatePath("/urunler");
  revalidatePath("/motosikletler");
  revalidatePath("/blog");

  return { ok: true as const };
}