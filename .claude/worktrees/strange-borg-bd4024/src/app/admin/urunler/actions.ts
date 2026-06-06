"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/admin";

export async function updateProduct(
  id: string,
  data: { price?: number; stock?: number; isActive?: boolean }
) {
  await assertAdmin();
  await prisma.product.update({
    where: { id },
    data: {
      ...(typeof data.price === "number" ? { price: data.price } : {}),
      ...(typeof data.stock === "number" ? { stock: data.stock } : {}),
      ...(typeof data.isActive === "boolean" ? { isActive: data.isActive } : {}),
    },
  });
  revalidatePath("/admin/urunler");
  revalidatePath("/admin");
  revalidatePath("/urunler");
}
