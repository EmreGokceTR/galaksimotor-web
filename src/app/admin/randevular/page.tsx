import { prisma } from "@/lib/prisma";
import { AppointmentsClient, type AppointmentRow } from "./AppointmentsClient";

export default async function AdminAppointmentsPage() {
  const appointments = await prisma.appointment.findMany({
    orderBy: { scheduledAt: "asc" },
    take: 200,
    include: {
      service: true,
      user: { select: { name: true, email: true, phone: true } },
    },
  });

  // Date tipini serialize et
  const serialized: AppointmentRow[] = appointments.map((a) => ({
    id: a.id,
    scheduledAt: a.scheduledAt.toISOString(),
    status: a.status,
    service: { name: a.service.name, duration: a.service.duration },
    user: {
      name: a.user.name ?? null,
      email: a.user.email,
      phone: a.user.phone ?? null,
    },
    note: a.note ?? null,
    motoBrand: a.motoBrand ?? null,
    motoModel: a.motoModel ?? null,
    motoYear: a.motoYear ?? null,
  }));

  return (
    <div>
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Randevular</h2>
          <p className="text-sm text-white/50">
            Toplam {appointments.length} randevu
          </p>
        </div>
      </header>
      <AppointmentsClient appointments={serialized} />
    </div>
  );
}
