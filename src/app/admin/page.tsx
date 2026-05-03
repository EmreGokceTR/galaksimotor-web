import Link from "next/link";
import { prisma } from "@/lib/prisma";

const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

export default async function AdminDashboard() {
  const [
    pendingOrders,
    totalOrders,
    pendingAppointments,
    totalProducts,
    activeProducts,
    revenue,
    lowStock,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count(),
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.product.findMany({
      where: { isActive: true, stock: { lte: 5 } },
      orderBy: { stock: "asc" },
      take: 5,
      select: { id: true, name: true, slug: true, stock: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Bekleyen Sipariş"
          value={pendingOrders}
          sub={`Toplam ${totalOrders}`}
          accent
          href="/admin/siparisler"
        />
        <Stat
          label="Bekleyen Randevu"
          value={pendingAppointments}
          sub="Onayını bekliyor"
          accent
          href="/admin/randevular"
        />
        <Stat
          label="Toplam Ciro"
          value={fmt(Number(revenue._sum.total ?? 0))}
          sub="İptal hariç"
        />
        <Stat
          label="Aktif Ürün"
          value={activeProducts}
          sub={`Toplam ${totalProducts}`}
          href="/admin/urunler"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Son Siparişler" link="/admin/siparisler">
          {recentOrders.length === 0 ? (
            <Empty>Henüz sipariş yok.</Empty>
          ) : (
            <ul className="divide-y divide-white/5">
              {recentOrders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-white">
                      #{o.orderNumber}
                    </div>
                    <div className="truncate text-xs text-white/50">
                      {o.user.name ?? o.user.email}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gradient-gold">
                      {fmt(Number(o.total))}
                    </div>
                    <div className="text-[11px] text-white/40">
                      {o.createdAt.toLocaleDateString("tr-TR")}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Stok Uyarısı" link="/admin/urunler" accent="rose">
          {lowStock.length === 0 ? (
            <Empty>Tüm ürünlerde stok yeterli 👍</Empty>
          ) : (
            <ul className="divide-y divide-white/5">
              {lowStock.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <Link
                    href={`/urun/${p.slug}`}
                    className="line-clamp-1 text-sm font-medium text-white hover:text-brand-yellow"
                  >
                    {p.name}
                  </Link>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      p.stock === 0
                        ? "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30"
                        : "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30"
                    }`}
                  >
                    {p.stock} adet
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
  href,
}: {
  label: string;
  value: number | string;
  sub?: string;
  accent?: boolean;
  href?: string;
}) {
  const card = (
    <div
      className={`rounded-2xl border p-5 backdrop-blur-md transition ${
        accent
          ? "border-brand-yellow/30 bg-gradient-to-br from-brand-yellow/10 via-white/[0.02] to-transparent hover:border-brand-yellow/50"
          : "border-white/10 bg-white/[0.025] hover:border-white/25"
      }`}
    >
      <div className="text-[11px] uppercase tracking-wider text-white/45">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-white/50">{sub}</div>}
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

function Panel({
  title,
  link,
  children,
  accent,
}: {
  title: string;
  link?: string;
  children: React.ReactNode;
  accent?: "rose";
}) {
  return (
    <div
      className={`rounded-2xl border p-5 backdrop-blur-md ${
        accent === "rose"
          ? "border-rose-400/20 bg-rose-500/[0.04]"
          : "border-white/10 bg-white/[0.025]"
      }`}
    >
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
          {title}
        </h3>
        {link && (
          <Link
            href={link}
            className="text-xs text-white/50 hover:text-brand-yellow"
          >
            Tümü →
          </Link>
        )}
      </header>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-white/5 bg-white/[0.02] p-4 text-center text-xs text-white/45">
      {children}
    </p>
  );
}
