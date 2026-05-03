import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";

const appointmentStatusLabel: Record<AppointmentStatus, string> = {
  PENDING: "Beklemede",
  CONFIRMED: "Onaylandı",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal",
};

const appointmentStatusColor: Record<AppointmentStatus, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400",
  CONFIRMED: "bg-blue-500/20 text-blue-400",
  COMPLETED: "bg-green-500/20 text-green-400",
  CANCELLED: "bg-red-500/20 text-red-400",
};

export default async function MyAppointmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const appointments = await prisma.appointment.findMany({
    where: { userId: session.user.id },
    orderBy: { scheduledAt: "desc" },
    include: { service: true },
  });

  if (appointments.length === 0) {
    return <p className="text-white/60">Henüz randevunuz yok.</p>;
  }

  return (
    <div className="space-y-3">
      {appointments.map((a) => (
        <div
          key={a.id}
          className="flex items-center justify-between rounded border border-white/10 p-4"
        >
          <div>
            <div className="font-semibold text-brand-yellow">{a.service.name}</div>
            <div className="text-sm text-white/60">
              {a.scheduledAt.toLocaleString("tr-TR")}
            </div>
          </div>
          <span className={`rounded px-2 py-1 text-xs ${appointmentStatusColor[a.status]}`}>
            {appointmentStatusLabel[a.status]}
          </span>
        </div>
      ))}
    </div>
  );
}
