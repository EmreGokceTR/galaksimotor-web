import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AccountOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = session.user.id;

  const [orderCount, favoriteCount, appointmentCount] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.favorite.count({ where: { userId } }),
    prisma.appointment.count({ where: { userId } }),
  ]);

  return (
    <div className="space-y-4">
      <p className="text-white/80">
        Merhaba <span className="font-semibold text-brand-yellow">{session.user.name ?? session.user.email}</span>, hoş geldin.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Sipariş" value={orderCount} />
        <Stat label="Favori" value={favoriteCount} />
        <Stat label="Randevu" value={appointmentCount} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-white/10 bg-brand-black/40 p-4">
      <div className="text-3xl font-bold text-brand-yellow">{value}</div>
      <div className="text-sm text-white/60">{label}</div>
    </div>
  );
}
