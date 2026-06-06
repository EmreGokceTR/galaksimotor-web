import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/config/site";

type Body = {
  serviceId: string;
  /** ISO date string */
  scheduledAt: string;
  motoBrand?: string;
  motoModel?: string;
  motoYear?: number;
  note?: string;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Önce giriş yapmalısın." },
      { status: 401 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  if (!body.serviceId || !body.scheduledAt) {
    return NextResponse.json(
      { error: "Servis ve tarih zorunlu." },
      { status: 400 }
    );
  }

  const date = new Date(body.scheduledAt);
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: "Geçersiz tarih." }, { status: 400 });
  }
  if (date.getTime() < Date.now()) {
    return NextResponse.json(
      { error: "Geçmiş bir tarih için randevu alınamaz." },
      { status: 400 }
    );
  }

  // Çalışma saati kontrolü
  const hour = date.getHours();
  if (
    hour < SITE.hours.appointmentStart ||
    hour >= SITE.hours.appointmentEnd
  ) {
    return NextResponse.json(
      { error: "Seçilen saat çalışma saatleri dışında." },
      { status: 400 }
    );
  }

  const service = await prisma.service.findUnique({
    where: { id: body.serviceId },
  });
  if (!service || !service.isActive) {
    return NextResponse.json({ error: "Servis bulunamadı." }, { status: 400 });
  }

  // Aynı slot dolu mu?
  const conflict = await prisma.appointment.findFirst({
    where: { serviceId: service.id, scheduledAt: date },
  });
  if (conflict) {
    return NextResponse.json(
      { error: "Bu saat dolu, lütfen başka bir slot seç." },
      { status: 409 }
    );
  }

  const appointment = await prisma.appointment.create({
    data: {
      userId: session.user.id,
      serviceId: service.id,
      scheduledAt: date,
      motoBrand: body.motoBrand?.trim() || null,
      motoModel: body.motoModel?.trim() || null,
      motoYear: body.motoYear || null,
      note: body.note?.trim() || null,
    },
    select: { id: true },
  });

  return NextResponse.json(appointment, { status: 201 });
}

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
