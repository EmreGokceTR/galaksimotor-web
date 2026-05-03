"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/admin";

export async function createProduct(formData: FormData) {
  await assertAdmin();

  const slug = String(formData.get("slug") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const brand = String(formData.get("brand") ?? "").trim() || null;
  const categoryId = String(formData.get("categoryId") ?? "");
  const price = Number(formData.get("price") ?? 0);
  const stock = parseInt(String(formData.get("stock") ?? "0"), 10);
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();

  if (!slug || !name || !sku || !categoryId || !price) {
    throw new Error("Slug, isim, SKU, kategori ve fiyat zorunlu.");
  }

  const product = await prisma.product.create({
    data: {
      slug,
      name,
      sku,
      description,
      brand,
      categoryId,
      price,
      stock,
      ...(imageUrl
        ? {
            images: {
              create: { url: imageUrl, alt: name, position: 0 },
            },
          }
        : {}),
    },
  });

  revalidatePath("/admin/urunler");
  revalidatePath("/urunler");
  redirect(`/admin/urunler`);
  return product.id; // unreachable, satisfies TS
}
