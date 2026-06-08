import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { UserRow } from "./UserRow";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      createdAt: true,
      _count: {
        select: {
          orders: true,
          appointments: true,
          favorites: true,
        },
      },
    },
    take: 500,
  });

  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === "ADMIN").length;
  const anonymized = users.filter((u) => u.email.endsWith("@deleted.local")).length;

  return (
    <div>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Kullanıcılar</h2>
          <p className="text-sm text-white/55">
            Toplam <strong className="text-white">{totalUsers}</strong> kullanıcı —{" "}
            <strong className="text-brand-yellow">{totalAdmins}</strong> admin
            {anonymized > 0 && (
              <>
                {" "}
                — <span className="text-rose-300">{anonymized}</span> silinmiş
              </>
            )}
          </p>
        </div>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-md">
        <table className="min-w-full divide-y divide-white/5 text-sm">
          <thead className="bg-white/[0.03] text-left text-[11px] uppercase tracking-wider text-white/45">
            <tr>
              <th className="px-4 py-3">Kullanıcı</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">İstatistik</th>
              <th className="px-4 py-3">Kayıt</th>
              <th className="px-4 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <UserRow
                key={u.id}
                user={{
                  id: u.id,
                  email: u.email,
                  name: u.name,
                  role: u.role,
                  phone: u.phone,
                  createdAt: u.createdAt.toISOString(),
                  orderCount: u._count.orders,
                  appointmentCount: u._count.appointments,
                  favoriteCount: u._count.favorites,
                }}
                isSelf={u.id === admin.id}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
