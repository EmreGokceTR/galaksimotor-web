"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdmin, assertAdminContext } from "@/lib/admin";
import { logActivity } from "@/lib/activity-log";

/**
 * Ürünü kalıcı sil. Sipariş geçmişinde geçiyorsa silinemez (kayıt bütünlüğü) —
 * bu durumda "pasife al" önerilir. Görsel/varyant/uyumluluk/favori/yorum
 * cascade ile birlikte silinir.
 */
export async function deleteProduct(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { email } = await assertAdminContext();

  const product = await prisma.product.findUnique({
    where: { id },
    select: { name: true, _count: { select: { orderItems: true } } },
  });
  if (!product) return { ok: false, error: "Ürün bulunamadı." };

  if (product._count.orderItems > 0) {
    return {
      ok: false,
      error:
        "Bu ürün siparişlerde geçtiği için silinemez. Bunun yerine pasife alın (satıştan kaldırır, geçmişi korur).",
    };
  }

  try {
    await prisma.product.delete({ where: { id } });
    await logActivity(email, "product_delete", `product:${id}`, { name: product.name });
    revalidatePath("/admin/urunler");
    revalidatePath("/admin");
    revalidatePath("/urunler");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Silinemedi." };
  }
}

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
