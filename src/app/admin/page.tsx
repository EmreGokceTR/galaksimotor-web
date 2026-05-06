import dynamic from "next/dynamic";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DangerZone } from "./DangerZone";
import { getLowStockThreshold } from "@/lib/stock";
import { EditableWrapper } from "@/components/EditableWrapper";

// Recharts SSR ağır; client-only dynamic import
const RevenueChart = dynamic(
  () => import("./DashboardCharts").then((m) => m.RevenueChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const TopProductsChart = dynamic(
  () => import("./DashboardCharts").then((m) => m.TopProductsChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const AppointmentsHeatmap = dynamic(
  () => import("./DashboardCharts").then((m) => m.AppointmentsHeatmap),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

const fmtCompact = (n: number) =>
  n >= 1000000
    ? `${(n / 1000000).toFixed(1)}M ₺`
    : n >= 1000
    ? `${(n / 1000).toFixed(1)}K ₺`
    : `${n} ₺`;

const TR_DAYS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

function dayShort(d: Date): string {
  return `${d.getDate()} ${
    ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"][
      d.getMonth()
    ]
  }`;
}

export default async function AdminDashboard() {
  const lowStockThreshold = await getLowStockThreshold();
  const now = new Date();
  const start30 = new Date(now);
  start30.setDate(start30.getDate() - 29);
  start30.setHours(0, 0, 0, 0);

  const future14 = new Date(now);
  future14.setDate(future14.getDate() + 13);
  future14.setHours(23, 59, 59, 999);

  const [
    pendingOrders,
    totalOrders,
    pendingAppointments,
    totalProducts,
    activeProducts,
    revenue,
    revenue30,
    customerCount,
    activeCoupons,
    lowStock,
    recentOrders,
    ordersLast30,
    topItemsRaw,
    upcomingAppointments,
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
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { not: "CANCELLED" },
        createdAt: { gte: start30 },
      },
    }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.coupon.count({ where: { isActive: true } }),
    prisma.product.findMany({
      where: { isActive: true, stock: { lte: lowStockThreshold } },
      orderBy: { stock: "asc" },
      take: 8,
      select: { id: true, name: true, slug: true, stock: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.order.findMany({
      where: {
        status: { not: "CANCELLED" },
        createdAt: { gte: start30 },
      },
      select: { createdAt: true, total: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productId", "name"],
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
      where: { order: { status: { not: "CANCELLED" } } },
    }),
    prisma.appointment.findMany({
      where: {
        scheduledAt: { gte: now, lte: future14 },
        status: { not: "CANCELLED" },
      },
      select: { scheduledAt: true },
    }),
  ]);

  // 30 günlük günlük ciro serisi
  const revenueSeries: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(start30);
    d.setDate(d.getDate() + i);
    revenueSeries.push({ date: dayShort(d), revenue: 0, orders: 0 });
  }
  for (const o of ordersLast30) {
    const idx = Math.floor(
      (o.createdAt.getTime() - start30.getTime()) / 86400000
    );
    if (idx >= 0 && idx < 30) {
      revenueSeries[idx].revenue += Number(o.total);
      revenueSeries[idx].orders += 1;
    }
  }

  // Top 5 ürünler
  const topProducts = topItemsRaw.map((t) => ({
    name: t.name,
    sold: t._sum.quantity ?? 0,
    revenue: Number(t._sum.price ?? 0) * (t._sum.quantity ?? 1),
  }));

  // 14 günlük randevu yoğunluğu
  const apptSeries: { date: string; count: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    apptSeries.push({
      date: `${TR_DAYS[d.getDay()]} ${d.getDate()}`,
      count: 0,
    });
  }
  for (const a of upcomingAppointments) {
    const idx = Math.floor(
      (a.scheduledAt.getTime() - new Date(now.toDateString()).getTime()) /
        86400000
    );
    if (idx >= 0 && idx < 14) apptSeries[idx].count += 1;
  }

  return (
    <div className="space-y-6">
      {/* Hızlı stat kartları */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Toplam Ciro"
          value={fmtCompact(Number(revenue._sum.total ?? 0))}
          sub="İptal hariç"
          accent
        />
        <Stat
          label="Son 30 Gün"
          value={fmtCompact(Number(revenue30._sum.total ?? 0))}
          sub={`${ordersLast30.length} sipariş`}
          accent
        />
        <Stat
          label="Bekleyen Sipariş"
          value={pendingOrders}
          sub={`Toplam ${totalOrders}`}
          href="/admin/siparisler"
        />
        <Stat
          label="Müşteri"
          value={customerCount}
          sub={`${activeCoupons} aktif kupon`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Bekleyen Randevu"
          value={pendingAppointments}
          sub="Onayını bekliyor"
          href="/admin/randevular"
        />
        <Stat
          label="Aktif Ürün"
          value={activeProducts}
          sub={`Toplam ${totalProducts}`}
          href="/admin/urunler"
        />
        <Stat
          label="Stok Uyarısı"
          value={lowStock.length}
          sub={`Eşik: ${lowStockThreshold}`}
          accent={lowStock.length > 0}
        />
        <Stat
          label="Yedek / Bakım"
          value="🛠"
          sub="Veri yedekle / log temizle"
          href="/admin/yedek"
        />
      </div>

      {/* Ana grafik: 30 günlük ciro */}
      <Panel title="Son 30 Gün — Ciro" subtitle="Günlük toplam">
        <RevenueChart data={revenueSeries} />
      </Panel>

      {/* İkinci sıra: top ürünler + randevu yoğunluğu */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="En Çok Satan Ürünler" link="/admin/urunler">
          {topProducts.length === 0 ? (
            <Empty>Henüz satış verisi yok.</Empty>
          ) : (
            <TopProductsChart data={topProducts} />
          )}
        </Panel>

        <Panel title="Randevu Yoğunluğu" link="/admin/randevular" subtitle="Önümüzdeki 14 gün">
          <AppointmentsHeatmap data={apptSeries} />
        </Panel>
      </div>

      {/* Alt: son siparişler + stok uyarısı */}
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
          <div className="mb-3">
            <EditableWrapper
              table="siteSetting"
              id="low_stock_threshold"
              field="value"
              value={String(lowStockThreshold)}
              label="Kritik Stok Eşiği"
              fieldType="number"
              revalidatePaths={["/admin"]}
              as="div"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/60"
            >
              <span>
                Eşik:{" "}
                <span className="font-semibold text-white">
                  {lowStockThreshold}
                </span>{" "}
                ve altı
              </span>
            </EditableWrapper>
          </div>
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

      <DangerZone />
    </div>
  );
}

// ─── Yardımcı bileşenler ─────────────────────────────────────────────────────

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
  subtitle,
}: {
  title: string;
  link?: string;
  children: React.ReactNode;
  accent?: "rose";
  subtitle?: string;
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
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-[11px] text-white/45">{subtitle}</p>
          )}
        </div>
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

function ChartSkeleton() {
  return (
    <div className="flex h-[260px] w-full items-center justify-center rounded-xl border border-white/5 bg-white/[0.02]">
      <div className="h-1 w-32 animate-pulse rounded-full bg-brand-yellow/30" />
    </div>
  );
}
