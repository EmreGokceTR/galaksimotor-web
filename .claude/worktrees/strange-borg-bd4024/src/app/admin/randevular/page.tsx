import { prisma } from "@/lib/prisma";
import { AppointmentStatusSelect } from "./AppointmentStatusSelect";

export default async function AdminAppointmentsPage() {
  const appointments = await prisma.appointment.findMany({
    orderBy: { scheduledAt: "asc" },
    take: 100,
    include: {
      service: true,
      user: { select: { name: true, email: true, phone: true } },
    },
  });

  return (
    <div>
      <header className="mb-5">
        <h2 className="text-xl font-bold text-white">Randevular</h2>
        <p className="text-sm text-white/50">
          {appointments.length} randevu
        </p>
      </header>

      {appointments.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-white/45">
          Henüz randevu yok.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/[0.02] text-left text-[11px] uppercase tracking-wider text-white/45">
                <tr>
                  <th className="px-4 py-3">Tarih / Saat</th>
                  <th className="px-4 py-3">Servis</th>
                  <th className="px-4 py-3">Müşteri</th>
                  <th className="px-4 py-3">Motor</th>
                  <th className="px-4 py-3">Not</th>
                  <th className="px-4 py-3">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 align-top">
                      <div className="font-semibold text-white">
                        {a.scheduledAt.toLocaleDateString("tr-TR")}
                      </div>
                      <div className="text-[11px] text-brand-yellow">
                        {a.scheduledAt.toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-white">
                      {a.service.name}
                      <div className="text-[11px] text-white/45">
                        {a.service.duration} dk
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="text-white">
                        {a.user.name ?? a.user.email}
                      </div>
                      <div className="text-[11px] text-white/45">
                        {a.user.phone ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-white/75">
                      {a.motoBrand || a.motoModel
                        ? `${a.motoBrand ?? ""} ${a.motoModel ?? ""}`.trim()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="line-clamp-2 max-w-[260px] text-xs text-white/60">
                        {a.note ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <AppointmentStatusSelect id={a.id} status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
