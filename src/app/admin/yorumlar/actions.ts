"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";
import { logActivity } from "@/lib/activity-log";

export async function deleteReview(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { email } = await assertAdminContext();
  const review = await prisma.review.findUnique({
    where: { id },
    select: { id: true, productId: true, product: { select: { slug: true } } },
  });
  if (!review) return { ok: false, error: "Yorum bulunamadı." };

  await prisma.review.delete({ where: { id } });
  await logActivity(email, "review_delete", `review:${id}`, {
    productId: review.productId,
  });

  revalidatePath("/admin/yorumlar");
  if (review.product?.slug) revalidatePath(`/urun/${review.product.slug}`);
  return { ok: true };
}
