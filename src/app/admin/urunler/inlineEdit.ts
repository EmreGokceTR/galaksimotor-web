"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/admin";

export async function inlineUpdateProduct(
  id: string,
  data: {
    name: string;
    price: number;
    stock: number;
    imageUrl: string | null;
    slug: string;
    sku?: string;
    brand?: string | null;
    description?: string | null;
  }
) {
  await assertAdmin();

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        name: data.name,
        price: data.price,
        stock: data.stock,
        ...(data.sku !== undefined && { sku: data.sku }),
        ...(data.brand !== undefined && { brand: data.brand }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });

    if (data.imageUrl) {
      const first = await tx.productImage.findFirst({
        where: { productId: id },
        orderBy: { position: "asc" },
      });
      if (first) {
        await tx.productImage.update({
          where: { id: first.id },
          data: { url: data.imageUrl },
        });
      } else {
        await tx.productImage.create({
          data: { productId: id, url: data.imageUrl, position: 0 },
        });
      }
    }
  });

  revalidatePath(`/urun/${data.slug}`);
  revalidatePath("/urunler");
  revalidatePath("/");
  revalidatePath("/admin/urunler");
}
