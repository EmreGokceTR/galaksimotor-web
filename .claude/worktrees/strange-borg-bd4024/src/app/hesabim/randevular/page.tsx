import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";

const STATUS: Record<AppointmentStatus, { label: string; cls: string }> = {
  PENDING: {
    label: "Beklemede",
    cls: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  },
  CONFIRMED: {
    label: "Onaylandı",
    cls: "border-blue-400/30 bg-blue-500/10 text-blue-200",
  },
  COMPLETED: {
    label: "Tamamlandı",
    cls: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  },
  CANCELLED: {
    label: "İptal",
    cls: "border-rose-400/30 bg-rose-500/10 text-rose-200",
  },
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
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-white/55 backdrop-blur-md">
        Henüz randevun yok.{" "}
        <Link
          href="/randevu"
          className="ml-1 text-brand-yellow hover:underline"
        >
          Servis randevusu al →
        </Link>
      </div>
    );
  }

  const now = Date.now();

  return (
    <div className="space-y-3">
      {appointments.map((a) => {
        const s = STATUS[a.status];
        const isFuture = a.scheduledAt.getTime() > now;
        return (
          <div
            key={a.id}
            className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 backdrop-blur-md transition ${
              isFuture && a.status === "CONFIRMED"
                ? "border-emerald-400/20 bg-emerald-500/[0.04]"
                : "border-white/10 bg-white/[0.025] hover:border-white/20"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-brand-yellow/30 bg-brand-yellow/10 p-3 text-center">
                <div className="text-[10px] uppercase tracking-wider text-brand-yellow/70">
                  {a.scheduledAt.toLocaleDateString("tr-TR", {
                    month: "short",
                  })}
                </div>
                <div className="text-xl font-bold text-brand-yellow">
                  {a.scheduledAt.toLocaleDateString("tr-TR", {
                    day: "2-digit",
                  })}
                </div>
                <div className="text-[10px] text-brand-yellow/70">
                  {a.scheduledAt.toLocaleTimeString("tr-TR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <div>
                <div className="text-base font-semibold text-white">
                  {a.service.name}
                </div>
                <div className="text-xs text-white/50">
                  {a.service.duration} dk{" "}
                  {a.motoBrand && a.motoModel
                    ? `· ${a.motoBrand} ${a.motoModel}`
                    : ""}
                </div>
                {a.note && (
                  <div className="mt-1 line-clamp-1 max-w-md text-[11px] text-white/40">
                    {a.note}
                  </div>
                )}
              </div>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${s.cls}`}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
