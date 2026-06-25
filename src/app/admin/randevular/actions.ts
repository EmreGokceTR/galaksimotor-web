"use server";

import { revalidatePath } from "next/cache";
import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";
import { logActivity } from "@/lib/activity-log";
import { sendAppointmentStatusMail } from "@/lib/notifications";
import { sendEmail } from "@/lib/mail";
import { appointmentConfirmationTemplate } from "@/lib/email-templates";

/** Fake (walk-in) e-posta mı? Bu adreslere gerçek mail gönderilmez. */
function isRealEmail(email: string | null | undefined): email is string {
  return !!email && !email.endsWith("@galaksimotor.local");
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<void> {
  const { email } = await assertAdminContext();

  const before = await prisma.appointment.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!before) throw new Error("Randevu bulunamadı.");
  if (before.status === status) return;

  const appt = await prisma.appointment.update({
    where: { id },
    data: { status },
    include: { service: true, user: true },
  });

  await logActivity(email, "appointment_status", `appointment:${id}`, {
    from: before.status,
    to: status,
    service: appt.service.name,
  });

  sendAppointmentStatusMail(appt).catch(console.error);

  revalidatePath("/admin/randevular");
  revalidatePath("/admin");
  revalidatePath("/hesabim/randevular");
}

// ─── Admin: randevu sil ──────────────────────────────────────────────────────

export async function deleteAppointment(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { email } = await assertAdminContext();
  const appt = await prisma.appointment.findUnique({
    where: { id },
    select: { id: true, service: { select: { name: true } }, scheduledAt: true },
  });
  if (!appt) return { ok: false, error: "Randevu bulunamadı." };

  await prisma.appointment.delete({ where: { id } });
  await logActivity(email, "appointment_delete", `appointment:${id}`, {
    service: appt.service?.name,
    scheduledAt: appt.scheduledAt.toISOString(),
  });

  revalidatePath("/admin/randevular");
  revalidatePath("/admin");
  revalidatePath("/hesabim/randevular");
  return { ok: true };
}

// ─── Admin: manuel randevu ekleme (telefonla/şahsen gelen müşteri) ───────────

export type AdminCreateAppointmentInput = {
  serviceId: string;
  scheduledAt: string; // ISO
  /** Mevcut bir kullanıcıya bağla (varsa). */
  existingUserId?: string | null;
  /** Yoksa misafir: ad + telefon ile hafif kullanıcı kaydı oluşturulur. */
  guestName?: string;
  guestPhone?: string;
  motoBrand?: string;
  motoModel?: string;
  note?: string;
};

export async function adminCreateAppointment(
  input: AdminCreateAppointmentInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { email: adminEmail } = await assertAdminContext();

  const date = new Date(input.scheduledAt);
  if (isNaN(date.getTime())) return { ok: false, error: "Geçersiz tarih/saat." };

  const service = await prisma.service.findUnique({
    where: { id: input.serviceId },
  });
  if (!service) return { ok: false, error: "Hizmet bulunamadı." };

  // Aynı slot dolu mu? (şemada @@unique([scheduledAt, serviceId]))
  const conflict = await prisma.appointment.findFirst({
    where: { serviceId: service.id, scheduledAt: date },
    select: { id: true },
  });
  if (conflict) {
    return { ok: false, error: "Bu hizmet için seçilen saat dolu." };
  }

  // Kullanıcıyı belirle: mevcut kullanıcı ya da misafir kaydı
  let userId = input.existingUserId?.trim() || null;
  if (!userId) {
    const guestName = input.guestName?.trim();
    if (!guestName) {
      return { ok: false, error: "Müşteri seç veya misafir adı gir." };
    }
    const guest = await prisma.user.create({
      data: {
        name: guestName,
        phone: input.guestPhone?.trim() || null,
        // Benzersiz, gerçek olmayan e-posta — bu adrese mail gönderilmez
        email: `walkin-${Date.now().toString(36)}-${Math.random()
          .toString(36)
          .slice(2, 7)}@galaksimotor.local`,
        role: "USER",
      },
      select: { id: true },
    });
    userId = guest.id;
  } else {
    const exists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!exists) return { ok: false, error: "Seçilen müşteri bulunamadı." };
  }

  const appt = await prisma.appointment.create({
    data: {
      userId,
      serviceId: service.id,
      scheduledAt: date,
      status: "CONFIRMED", // admin ekledi → onaylı
      motoBrand: input.motoBrand?.trim() || null,
      motoModel: input.motoModel?.trim() || null,
      note: input.note?.trim() || null,
    },
    include: { service: true, user: true },
  });

  await logActivity(adminEmail, "appointment_create_admin", `appointment:${appt.id}`, {
    service: service.name,
    scheduledAt: date.toISOString(),
    guest: !input.existingUserId,
  });

  // Mevcut (gerçek e-postalı) müşteriye onay maili gönder
  if (isRealEmail(appt.user.email)) {
    const tpl = appointmentConfirmationTemplate({
      customerName: appt.user.name ?? "Değerli müşterimiz",
      serviceName: service.name,
      duration: service.duration,
      scheduledAt: date,
      motoLabel: [appt.motoBrand, appt.motoModel].filter(Boolean).join(" ") || undefined,
      note: appt.note ?? undefined,
    });
    void sendEmail({
      to: appt.user.email,
      subject: tpl.subject,
      html: tpl.html,
      category: "appointment_confirmation",
      actor: adminEmail,
    });
  }

  revalidatePath("/admin/randevular");
  revalidatePath("/admin");
  revalidatePath("/hesabim/randevular");
  return { ok: true, id: appt.id };
}

// ─── Admin: randevu yeniden planlama (tarih/saat değiştir) ───────────────────

export async function rescheduleAppointment(
  id: string,
  newScheduledAt: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { email: adminEmail } = await assertAdminContext();

  const date = new Date(newScheduledAt);
  if (isNaN(date.getTime())) return { ok: false, error: "Geçersiz tarih/saat." };

  const before = await prisma.appointment.findUnique({
    where: { id },
    select: { scheduledAt: true, serviceId: true },
  });
  if (!before) return { ok: false, error: "Randevu bulunamadı." };

  // Yeni slot başka randevu tarafından dolu mu? (kendisi hariç)
  const conflict = await prisma.appointment.findFirst({
    where: {
      serviceId: before.serviceId,
      scheduledAt: date,
      NOT: { id },
    },
    select: { id: true },
  });
  if (conflict) {
    return { ok: false, error: "Yeni seçilen saat dolu." };
  }

  const appt = await prisma.appointment.update({
    where: { id },
    data: { scheduledAt: date },
    include: { service: true, user: true },
  });

  await logActivity(adminEmail, "appointment_reschedule", `appointment:${id}`, {
    from: before.scheduledAt.toISOString(),
    to: date.toISOString(),
    service: appt.service.name,
  });

  // Gerçek e-postalı müşteriye güncellenmiş randevu bildirimi
  if (isRealEmail(appt.user.email)) {
    const tpl = appointmentConfirmationTemplate({
      customerName: appt.user.name ?? "Değerli müşterimiz",
      serviceName: appt.service.name,
      duration: appt.service.duration,
      scheduledAt: date,
      note: "Randevunuzun tarihi güncellendi.",
    });
    void sendEmail({
      to: appt.user.email,
      subject: `Randevunuz güncellendi — ${appt.service.name}`,
      html: tpl.html,
      category: "appointment_reschedule",
      actor: adminEmail,
    });
  }

  revalidatePath("/admin/randevular");
  revalidatePath("/admin");
  revalidatePath("/hesabim/randevular");
  return { ok: true };
}
