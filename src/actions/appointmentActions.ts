"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTemplatedAdminMail } from "@/lib/mail";
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

  const dateLabel = date.toLocaleString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const motoLabel = [motoBrand, motoModel].filter(Boolean).join(" ") || "—";
  const customerName = session.user.name ?? session.user.email ?? "Müşteri";

  const fallbackBody = `
    <div style="font-family:sans-serif;max-width:520px;color:#1a1a1a">
      <h2 style="margin:0 0 16px">Yeni Randevu Talebi</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.6">
        <tr>
          <td style="padding:6px 12px 6px 0;color:#555;white-space:nowrap">Müşteri</td>
          <td style="padding:6px 0"><strong>{{customerName}}</strong></td>
        </tr>
        <tr>
          <td style="padding:6px 12px 6px 0;color:#555;white-space:nowrap">Servis</td>
          <td style="padding:6px 0"><strong>{{serviceName}}</strong> ({{duration}} dk)</td>
        </tr>
        <tr>
          <td style="padding:6px 12px 6px 0;color:#555;white-space:nowrap">Tarih / Saat</td>
          <td style="padding:6px 0"><strong>{{dateLabel}}</strong></td>
        </tr>
        <tr>
          <td style="padding:6px 12px 6px 0;color:#555;white-space:nowrap">Motor</td>
          <td style="padding:6px 0">{{motoLabel}}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px 6px 0;color:#555;white-space:nowrap">Not</td>
          <td style="padding:6px 0">{{note}}</td>
        </tr>
      </table>
      <p style="margin-top:24px">
        <a href="{{adminUrl}}"
           style="display:inline-block;background:#FFD700;color:#000;padding:10px 22px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px">
          Admin Panelinde Gör →
        </a>
      </p>
    </div>
  `;

  sendTemplatedAdminMail(
    "appt",
    {
      subject: "Yeni Randevu: {{serviceName}} — {{dateLabel}}",
      body: fallbackBody,
    },
    {
      customerName,
      serviceName: service.name,
      duration: service.duration,
      dateLabel,
      motoLabel,
      note: note || "—",
      adminUrl: `${siteUrl}/admin/randevular`,
    }
  ).catch(console.error);

  return { ok: true, id: appointment.id };
}
