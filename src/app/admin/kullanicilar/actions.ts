"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";
import { logActivity } from "@/lib/activity-log";

/**
 * Bir kullanıcının role'ünü değiştir (USER ↔ ADMIN).
 * Admin kendi rolünü düşüremez (sistemi kilitlemesin).
 */
export async function changeUserRole(userId: string, role: "USER" | "ADMIN") {
  const admin = await assertAdminContext();

  if (admin.id === userId) {
    throw new Error("Kendi rolünüzü değiştiremezsiniz.");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { email: true, role: true },
  });

  await logActivity(admin.email, "role_change", `user:${userId}`, {
    targetEmail: user.email,
    newRole: role,
  });

  revalidatePath("/admin/kullanicilar");
}

/**
 * Bir kullanıcıyı sil — kişisel veri anonimleştirilir, cascade tablolar
 * (account, session, favori, garaj, randevu, yorum) silinir.
 * Sipariş geçmişi muhafaza edilir (TBK md.146 / TTK md.82).
 */
export async function deleteUser(userId: string) {
  const admin = await assertAdminContext();

  if (admin.id === userId) {
    throw new Error("Kendinizi silemezsiniz.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, role: true },
  });
  if (!user) {
    throw new Error("Kullanıcı bulunamadı.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.account.deleteMany({ where: { userId } });
    await tx.session.deleteMany({ where: { userId } });
    await tx.user.update({
      where: { id: userId },
      data: {
        email: `deleted-${userId.slice(0, 8)}@deleted.local`,
        name: null,
        image: null,
        password: null,
        phone: null,
        role: "USER",
      },
    });
    await tx.favorite.deleteMany({ where: { userId } }).catch(() => {});
    await tx.userMotorcycle.deleteMany({ where: { userId } }).catch(() => {});
  });

  await logActivity(admin.email, "user_delete", `user:${userId}`, {
    targetEmail: user.email,
    targetRole: user.role,
  });

  revalidatePath("/admin/kullanicilar");
}
