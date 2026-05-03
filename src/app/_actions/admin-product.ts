"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/admin";

type Patch = {
  productId: string;
  name?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
};

export async function inlineUpdateProduct(p: Patch) {
  await assertAdmin();

  const product = await prisma.product.findUnique({
    where: { id: p.productId },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });
  if (!product) throw new Error("Ürün bulunamadı.");

  const data: { name?: string; price?: number; stock?: number } = {};
  if (typeof p.name === "string" && p.name.trim()) data.name = p.name.trim();
  if (typeof p.price === "number" && !isNaN(p.price)) data.price = p.price;
  if (typeof p.stock === "number" && !isNaN(p.stock))
    data.stock = Math.max(0, Math.floor(p.stock));

  if (Object.keys(data).length > 0) {
    await prisma.product.update({ where: { id: p.productId }, data });
  }

  // Görsel: ilk görseli güncelle, yoksa oluştur
  if (typeof p.imageUrl === "string") {
    const url = p.imageUrl.trim();
    if (url) {
      const first = product.images[0];
      if (first) {
        await prisma.productImage.update({
          where: { id: first.id },
          data: { url },
        });
      } else {
        await prisma.productImage.create({
          data: {
            productId: p.productId,
            url,
            alt: data.name ?? product.name,
            position: 0,
          },
        });
      }
    }
  }

  // Yeni veri
  const updated = await prisma.product.findUnique({
    where: { id: p.productId },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
  });

  // İlgili tüm sayfaları tazele
  revalidatePath("/");
  revalidatePath("/urunler");
  revalidatePath(`/urun/${product.slug}`);
  revalidatePath(`/kategori/${updated?.category.slug}`);
  revalidatePath("/admin/urunler");

  return {
    id: updated!.id,
    name: updated!.name,
    price: Number(updated!.price),
    stock: updated!.stock,
    image: updated!.images[0]?.url ?? null,
  };
}
