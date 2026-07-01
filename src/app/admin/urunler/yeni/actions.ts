"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/admin";

export async function createProduct(formData: FormData) {
  await assertAdmin();

  const slug = String(formData.get("slug") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const brand = String(formData.get("brand") ?? "").trim() || null;
  const oemNo = String(formData.get("oemNo") ?? "").trim() || null;
  const compatNo = String(formData.get("compatNo") ?? "").trim() || null;
  const categoryId = String(formData.get("categoryId") ?? "");
  const price = Number(formData.get("price") ?? 0);
  const stock = parseInt(String(formData.get("stock") ?? "0"), 10);
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();

  if (!slug || !name || !categoryId || !price) {
    throw new Error("Slug, isim, kategori ve fiyat zorunlu.");
  }

  // Ürün kodu artık müşteriye gösterilmiyor — sadece iç kayıt bütünlüğü
  // (benzersizlik) için slug'dan otomatik üretilir, admin bir şey girmez.
  const sku = `GM-${slug.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 24)}`;

  const product = await prisma.product.create({
    data: {
      slug,
      name,
      sku,
      description,
      brand,
      oemNo,
      compatNo,
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
