"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, FROM_ADDRESS } from "@/lib/mail";
import {
  appointmentConfirmationTemplate,
  appointmentAdminAlertTemplate,
} from "@/lib/email-templates";
import { logActivity } from "@/lib/activity-log";
import { SITE } from "@/config/site";

type Input = {
  serviceId: string;
  scheduledAt: string; // ISO string
  motoBrand?: string;
  motoModel?: string;
  note?: string;
};

type Result = { ok: true; id: string } | { ok: false; error: string };

export async function createAppointment(input: Input): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "Önce giriş yapmalısın." };
  }

  const { serviceId, scheduledAt: isoStr, motoBrand, motoModel, note } = input;

  if (!serviceId || !isoStr) {
    return { ok: false, error: "Servis ve tarih zorunlu." };
  }

  const date = new Date(isoStr);
  if (isNaN(date.getTime())) {
    return { ok: false, error: "Geçersiz tarih." };
  }
  if (date.getTime() < Date.now()) {
    return { ok: false, error: "Geçmiş bir tarih için randevu alınamaz." };
  }

  const hour = date.getHours();
  if (hour < SITE.hours.appointmentStart || hour >= SITE.hours.appointmentEnd) {
    return { ok: false, error: "Seçilen saat çalışma saatleri dışında." };
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.isActive) {
    return { ok: false, error: "Servis bulunamadı." };
  }

  const conflict = await prisma.appointment.findFirst({
    where: { serviceId: service.id, scheduledAt: date },
  });
  if (conflict) {
    return { ok: false, error: "Bu saat dolu, lütfen başka bir slot seç." };
  }

  const appointment = await prisma.appointment.create({
    data: {
      userId: session.user.id,
      serviceId: service.id,
      scheduledAt: date,
      motoBrand: motoBrand?.trim() || null,
      motoModel: motoModel?.trim() || null,
      note: note?.trim() || null,
    },
  });

  revalidatePath("/hesabim/randevular");
  revalidatePath("/admin/randevular");
  revalidatePath("/admin");

  // ── Bildirim e-postaları ──────────────────────────────────────────────────
  const customerName = session.user.name ?? session.user.email ?? "Müşteri";
  const customerEmail = session.user.email ?? "";
  const motoLabel = [motoBrand, motoModel].filter(Boolean).join(" ") || undefined;
  const adminEmail = process.env.ADMIN_EMAIL ?? FROM_ADDRESS;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ??
    SITE.url;

  // Müşteriye markalı teyit
  if (customerEmail) {
    const tpl = appointmentConfirmationTemplate({
      customerName,
      serviceName: service.name,
      duration: service.duration,
      scheduledAt: date,
      motoLabel,
      note: note?.trim() || undefined,
    });
    sendEmail({
      to: customerEmail,
      subject: tpl.subject,
      html: tpl.html,
      category: "appointment_customer",
      actor: customerEmail,
    }).catch(console.error);
  }

  // Admin'e operasyonel uyarı (kullanıcının telefonunu DB'den çek)
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { phone: true },
  });
  const adminTpl = appointmentAdminAlertTemplate({
    customerName,
    customerEmail: customerEmail || "—",
    customerPhone: dbUser?.phone ?? undefined,
    serviceName: service.name,
    duration: service.duration,
    scheduledAt: date,
    motoLabel,
    note: note?.trim() || undefined,
    adminUrl: `${siteUrl}/admin/randevular`,
  });
  sendEmail({
    to: adminEmail,
    subject: adminTpl.subject,
    html: adminTpl.html,
    replyTo: customerEmail || undefined,
    category: "appointment_admin",
    actor: customerEmail || "anon",
  }).catch(console.error);

  await logActivity(
    customerEmail || "anon",
    "appointment_create",
    `appointment:${appointment.id}`,
    {
      service: service.name,
      scheduledAt: date.toISOString(),
    }
  );

  return { ok: true, id: appointment.id };
}
