import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/config/site";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/mail";
import {
  appointmentConfirmationTemplate,
  appointmentAdminAlertTemplate,
} from "@/lib/email-templates";

type Body = {
  serviceId: string;
  /** ISO date string */
  scheduledAt: string;
  motoBrand?: string;
  motoModel?: string;
  motoYear?: number;
  note?: string;
};

// Input limitleri (DB schema ile uyumlu, spam koruması)
const MAX_BRAND = 50;
const MAX_MODEL = 80;
const MAX_NOTE = 500;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Önce giriş yapmalısın." },
      { status: 401 }
    );
  }

  // Rate limit: kullanıcı başına 5 dakikada en fazla 10 randevu denemesi
  // (bot/spam koruması; yasal kullanıcı bu kadar randevu almaz)
  const rl = rateLimit(`appointment:${session.user.id}`, {
    limit: 10,
    windowMs: 5 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Çok fazla deneme. ${rl.retryAfterSec} saniye sonra tekrar deneyin.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
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

  // Input uzunluk kontrolleri (spam/DB taşma koruması)
  if (
    (body.motoBrand && body.motoBrand.length > MAX_BRAND) ||
    (body.motoModel && body.motoModel.length > MAX_MODEL) ||
    (body.note && body.note.length > MAX_NOTE)
  ) {
    return NextResponse.json(
      {
        error: `Metin alanları çok uzun (marka ≤${MAX_BRAND}, model ≤${MAX_MODEL}, not ≤${MAX_NOTE}).`,
      },
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

  // Pazar günleri kapalıyız — randevu alınamaz
  // (getDay: 0=Pazar, 6=Cumartesi)
  if (date.getDay() === 0) {
    return NextResponse.json(
      { error: "Pazar günleri kapalıyız. Lütfen başka bir gün seçin." },
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

  // ── E-posta bildirimleri (müşteri + admin) ──
  // Mail gönderim hatası randevu oluşumunu bloklamaz; arka planda çalışır.
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true },
    });
    const customerName = user?.name ?? "Değerli müşterimiz";
    const motoLabel = [body.motoBrand, body.motoModel, body.motoYear]
      .filter(Boolean)
      .join(" ");

    // 1) Müşteriye randevu onayı
    if (user?.email) {
      const tpl = appointmentConfirmationTemplate({
        customerName,
        serviceName: service.name,
        duration: service.duration,
        scheduledAt: date,
        motoLabel: motoLabel || undefined,
        note: body.note,
      });
      void sendEmail({
        to: user.email,
        subject: tpl.subject,
        html: tpl.html,
        category: "appointment_confirmation",
        actor: user.email,
      });
    }

    // 2) Admin'e bildirim
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const tpl = appointmentAdminAlertTemplate({
        customerName,
        customerEmail: user?.email ?? "—",
        serviceName: service.name,
        duration: service.duration,
        scheduledAt: date,
        motoLabel: motoLabel || undefined,
        note: body.note,
        adminUrl: `${SITE.url}/admin/randevular`,
      });
      void sendEmail({
        to: adminEmail,
        subject: tpl.subject,
        html: tpl.html,
        category: "admin_new_appointment",
        actor: "system",
      });
    }
  } catch (e) {
    console.error("[Mail] randevu e-postası hatası:", e);
  }

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
