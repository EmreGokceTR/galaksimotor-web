"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";
import { logActivity } from "@/lib/activity-log";

/**
 * 30 günden eski (varsayılan) ActivityLog kayıtlarını siler.
 * Geri dönüş: kaç kayıt silindi.
 */
export async function cleanupOldActivityLogs(
  olderThanDays = 30
): Promise<{ ok: true; deleted: number } | { ok: false; error: string }> {
  let admin: { email: string };
  try {
    admin = await assertAdminContext();
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Yetkisiz.",
    };
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Math.max(1, olderThanDays));

  const res = await prisma.activityLog.deleteMany({
    where: { timestamp: { lt: cutoff } },
  });

  await logActivity(admin.email, "log_cleanup", "activityLog", {
    olderThanDays,
    deleted: res.count,
  });

  revalidatePath("/admin/yedek");
  return { ok: true, deleted: res.count };
}

/** Kaç eski log var? (silmeden gör) */
export async function countOldActivityLogs(
  olderThanDays = 30
): Promise<{ ok: true; count: number; total: number } | { ok: false; error: string }> {
  try {
    await assertAdminContext();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Yetkisiz." };
  }
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Math.max(1, olderThanDays));
  const [count, total] = await Promise.all([
    prisma.activityLog.count({ where: { timestamp: { lt: cutoff } } }),
    prisma.activityLog.count(),
  ]);
  return { ok: true, count, total };
}
