"use server";

import { revalidatePath } from "next/cache";
import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";
import { logActivity } from "@/lib/activity-log";
import { sendAppointmentStatusMail } from "@/lib/notifications";

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
