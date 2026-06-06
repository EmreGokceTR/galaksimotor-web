import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { BackupButton, CleanupButton } from "./BackupClient";

export default async function MaintenancePage() {
  await requireAdmin();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const [oldCount, totalLogs, recentLogs, productCount, orderCount, userCount] =
    await Promise.all([
      prisma.activityLog.count({ where: { timestamp: { lt: cutoff } } }),
      prisma.activityLog.count(),
      prisma.activityLog.findMany({
        orderBy: { timestamp: "desc" },
        take: 8,
      }),
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
    ]);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-bold text-white">Yedekleme & Bakım</h2>
        <p className="text-sm text-white/50">
          Veritabanı yedeği indir veya eski audit log kayıtlarını temizle.
        </p>
      </header>

      {/* Yedekleme paneli */}
      <section className="glass-strong rounded-2xl border border-brand-yellow/20 bg-gradient-to-br from-brand-yellow/[0.06] via-white/[0.02] to-transparent p-6 backdrop-blur-md">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-base">💾</span>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">
            Veritabanı Yedeği
          </h3>
        </div>
        <p className="mb-4 text-xs text-white/55">
          Tüm tabloların anlık görüntüsü JSON olarak indirilir. Hassas alanlar
          (şifre, OAuth token, Iyzico token) hariç tutulur.
        </p>
        <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
          <Mini label="Ürün" value={productCount} />
          <Mini label="Sipariş" value={orderCount} />
          <Mini label="Müşteri" value={userCount} />
          <Mini label="Log" value={totalLogs} />
        </div>
        <BackupButton />
      </section>

      {/* Cleanup paneli */}
      <section className="glass-strong rounded-2xl border border-rose-400/20 bg-rose-500/[0.04] p-6 backdrop-blur-md">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-base">🧹</span>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-200">
            ActivityLog Temizliği
          </h3>
        </div>
        <CleanupButton oldCount={oldCount} totalCount={totalLogs} />
      </section>

      {/* Son loglar */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 backdrop-blur-md">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
          Son Audit Log Kayıtları
        </h3>
        {recentLogs.length === 0 ? (
          <p className="rounded-lg border border-white/5 bg-white/[0.02] p-4 text-center text-xs text-white/45">
            Henüz log kaydı yok.
          </p>
        ) : (
          <ul className="divide-y divide-white/5 text-sm">
            {recentLogs.map((log) => (
              <li
                key={log.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-white/5 px-2 py-0.5 text-[11px] text-brand-yellow">
                      {log.action}
                    </code>
                    <span className="text-xs text-white/55">{log.target}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-white/35">
                    {log.adminEmail}
                  </div>
                </div>
                <time className="text-[11px] text-white/40">
                  {log.timestamp.toLocaleString("tr-TR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-white/45">
        {label}
      </div>
      <div className="mt-0.5 text-lg font-bold text-white">{value}</div>
    </div>
  );
}
