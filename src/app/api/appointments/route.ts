import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// NOT: Randevu OLUŞTURMA, `src/actions/appointmentActions.ts` içindeki
// `createAppointment` server action'ı ile yapılır (rate limit, Pazar/çalışma
// saati ve uzunluk kontrolleri orada). Bu route yalnızca takvimde dolu slotları
// döndüren GET içindir — tekrarlı (ve daha önce kullanılmayan) bir POST handler
// kasıtlı olarak kaldırıldı, böylece tek bir kaynak/doğruluk noktası kalır.

/** Belirli bir servis ve gün için dolu slotları döner. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const serviceId = url.searchParams.get("serviceId");
  const dateStr = url.searchParams.get("date"); // YYYY-MM-DD
  if (!serviceId || !dateStr) {
    return NextResponse.json({ taken: [] });
  }

  const start = new Date(`${dateStr}T00:00:00`);
  const end = new Date(`${dateStr}T23:59:59`);
  const taken = await prisma.appointment.findMany({
    where: {
      serviceId,
      scheduledAt: { gte: start, lte: end },
      status: { not: "CANCELLED" },
    },
    select: { scheduledAt: true },
  });

  return NextResponse.json({
    taken: taken.map((a) => a.scheduledAt.toISOString()),
  });
}
