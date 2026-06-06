import { prisma } from "@/lib/prisma";

/**
 * Admin işlemlerini ActivityLog tablosuna yazar.
 * Hata durumunda sessizce log düşürür (ana akışı bloklamaz).
 */
export async function logActivity(
  adminEmail: string,
  action: string,
  target: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        adminEmail,
        action,
        target,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (e) {
    console.error("[ActivityLog] kayıt hatası:", e);
  }
}
