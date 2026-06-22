import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { AppointmentsClient, type AppointmentRow } from "./AppointmentsClient";

export const dynamic = "force-dynamic";

export default async function AdminAppointmentsPage() {
  await requireAdmin();

  const [appointments, services, users] = await Promise.all([
    prisma.appointment.findMany({
      orderBy: { scheduledAt: "asc" },
      take: 500,
      include: {
        service: true,
        user: { select: { name: true, email: true, phone: true } },
      },
    }),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, duration: true },
    }),
    prisma.user.findMany({
      where: { role: "USER", email: { not: { endsWith: "@deleted.local" } } },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: { id: true, name: true, email: true, phone: true },
    }),
  ]);

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

  const userOptions = users
    .filter((u) => !u.email.endsWith("@galaksimotor.local")) // walk-in kayıtları gizle
    .map((u) => ({
      id: u.id,
      label: `${u.name ?? "(isimsiz)"} · ${u.phone ?? u.email}`,
    }));

  return (
    <div>
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Randevular</h2>
          <p className="text-sm text-white/50">Toplam {appointments.length} randevu</p>
        </div>
      </header>
      <AppointmentsClient
        appointments={serialized}
        services={services}
        users={userOptions}
      />
    </div>
  );
}
