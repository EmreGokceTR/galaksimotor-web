"use server";

import { revalidatePath } from "next/cache";
import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/admin";

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
) {
  await assertAdmin();
  await prisma.appointment.update({ where: { id }, data: { status } });
  revalidatePath("/admin/randevular");
  revalidatePath("/admin");
}
