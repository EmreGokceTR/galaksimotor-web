import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import type { Prisma } from "@prisma/client";
import { UserRow } from "./UserRow";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kullanıcılar · Admin" };

const PAGE_SIZE = 50;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; role?: string; page?: string };
}) {
  const admin = await requireAdmin();

  const q = (searchParams.q ?? "").trim();
  const roleFilter =
    searchParams.role === "ADMIN" || searchParams.role === "USER"
      ? searchParams.role
      : undefined;
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const where: Prisma.UserWhereInput = {
    ...(roleFilter ? { role: roleFilter } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [users, total, adminCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true,
        _count: { select: { orders: true, appointments: true, favorites: true } },
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
    prisma.user.count({ where: { role: "ADMIN" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageUrl(p: number) {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (roleFilter) sp.set("role", roleFilter);
    sp.set("page", String(p));
    return `/admin/kullanicilar?${sp}`;
  }

  const tabs: { label: string; role?: string }[] = [
    { label: "Tümü" },
    { label: "Müşteriler", role: "USER" },
    { label: "Yöneticiler", role: "ADMIN" },
  ];

  return (
    <div>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Kullanıcılar</h2>
          <p className="text-sm text-white/55">
            {q || roleFilter ? (
              <>
                <strong className="text-white">{total}</strong> sonuç
              </>
            ) : (
              <>
                Toplam <strong className="text-white">{total}</strong> kullanıcı —{" "}
                <strong className="text-brand-yellow">{adminCount}</strong> admin
              </>
            )}
          </p>
        </div>
        <a
          href={`/admin/kullanicilar/export${q || roleFilter ? `?${new URLSearchParams({ ...(q ? { q } : {}), ...(roleFilter ? { role: roleFilter } : {}) })}` : ""}`}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/75 hover:text-brand-yellow"
        >
          ⬇ CSV indir
        </a>
      </header>

      {/* Arama + rol sekmeleri */}
      <div className="mb-5 space-y-3">
        <form method="GET" className="flex flex-wrap gap-2">
          {roleFilter && <input type="hidden" name="role" value={roleFilter} />}
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="İsim, e-posta veya telefon ara…"
            className="min-w-[240px] flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40 placeholder:text-white/25"
          />
          <button
            type="submit"
            className="rounded-xl bg-brand-yellow px-5 py-2 text-sm font-semibold text-black hover:bg-brand-yellow/80"
          >
            Ara
          </button>
          {(q || roleFilter) && (
            <Link
              href="/admin/kullanicilar"
              className="rounded-xl border border-white/15 px-5 py-2 text-sm text-white/70 hover:text-white"
            >
              Temizle
            </Link>
          )}
        </form>
        <div className="flex gap-1.5">
          {tabs.map((t) => {
            const active = (t.role ?? undefined) === roleFilter;
            const sp = new URLSearchParams();
            if (q) sp.set("q", q);
            if (t.role) sp.set("role", t.role);
            return (
              <Link
                key={t.label}
                href={`/admin/kullanicilar${sp.toString() ? `?${sp}` : ""}`}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  active
                    ? "bg-brand-yellow/15 text-brand-yellow ring-1 ring-brand-yellow/30"
                    : "border border-white/10 text-white/60 hover:text-white"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>

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
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-white/45">
                  Kullanıcı bulunamadı.
                </td>
              </tr>
            ) : (
              users.map((u) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3">
          {page > 1 && (
            <Link
              href={pageUrl(page - 1)}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-brand-yellow"
            >
              ← Önceki
            </Link>
          )}
          <span className="text-sm text-white/40">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={pageUrl(page + 1)}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-brand-yellow"
            >
              Sonraki →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
