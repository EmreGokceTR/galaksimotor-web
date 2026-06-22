import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "İşlem Geçmişi · Admin" };

const PAGE_SIZE = 50;

// Aksiyon koduna göre okunabilir Türkçe etiket + renk
function actionLabel(action: string): { label: string; tone: string } {
  const map: Record<string, { label: string; tone: string }> = {
    create: { label: "Oluşturma", tone: "emerald" },
    update: { label: "Güncelleme", tone: "sky" },
    delete: { label: "Silme", tone: "rose" },
    sale: { label: "Satış", tone: "emerald" },
    order_create: { label: "Sipariş", tone: "emerald" },
    coupon_create: { label: "Kupon +", tone: "emerald" },
    coupon_delete: { label: "Kupon −", tone: "rose" },
    coupon_toggle: { label: "Kupon ◐", tone: "sky" },
    category_create: { label: "Kategori +", tone: "emerald" },
    category_update: { label: "Kategori ✎", tone: "sky" },
    category_delete: { label: "Kategori −", tone: "rose" },
    review_delete: { label: "Yorum −", tone: "rose" },
    email_sent: { label: "E-posta ✓", tone: "emerald" },
    email_failed: { label: "E-posta ✕", tone: "rose" },
    email_stub: { label: "E-posta (stub)", tone: "white" },
  };
  return map[action] ?? { label: action, tone: "white" };
}

const TONE: Record<string, string> = {
  emerald: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  sky: "bg-sky-500/15 text-sky-300 ring-sky-400/30",
  rose: "bg-rose-500/15 text-rose-300 ring-rose-400/30",
  white: "bg-white/10 text-white/60 ring-white/15",
};

export default async function ActivityLogPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  await requireAdmin();

  const q = (searchParams.q ?? "").trim();
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const where: Prisma.ActivityLogWhereInput = q
    ? {
        OR: [
          { adminEmail: { contains: q, mode: "insensitive" } },
          { action: { contains: q, mode: "insensitive" } },
          { target: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.activityLog.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">İşlem Geçmişi</h1>
        <p className="mt-1 text-sm text-white/50">
          Panelde yapılan tüm yönetim işlemleri (oluşturma, güncelleme, silme,
          satış, e-posta gönderimi) burada kayıt altına alınır.
        </p>
      </header>

      {/* Arama */}
      <form method="GET" className="flex flex-wrap gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="E-posta, işlem türü veya hedefe göre ara…"
          className="min-w-[240px] flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40 placeholder:text-white/25"
        />
        <button
          type="submit"
          className="rounded-xl bg-brand-yellow px-5 py-2 text-sm font-semibold text-black hover:bg-brand-yellow/80"
        >
          Ara
        </button>
        {q && (
          <Link
            href="/admin/islem-gecmisi"
            className="rounded-xl border border-white/15 px-5 py-2 text-sm text-white/70 hover:text-white"
          >
            Temizle
          </Link>
        )}
      </form>

      <div className="text-xs text-white/40">
        Toplam {total} kayıt · Sayfa {page}/{totalPages}
      </div>

      {logs.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-white/45">
          Kayıt bulunamadı.
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
          {logs.map((log) => {
            const { label, tone } = actionLabel(log.action);
            let meta = "";
            if (log.metadata) {
              try {
                meta = JSON.stringify(JSON.parse(log.metadata));
              } catch {
                meta = log.metadata;
              }
            }
            return (
              <li
                key={log.id}
                className="flex flex-wrap items-center gap-3 border-b border-white/5 px-4 py-3 last:border-0"
              >
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase ring-1 ${
                    TONE[tone] ?? TONE.white
                  }`}
                >
                  {label}
                </span>
                <span className="min-w-0 flex-1 text-sm text-white/80">
                  <span className="text-white/55">{log.adminEmail}</span>{" "}
                  <span className="font-mono text-[11px] text-white/45">
                    {log.target}
                  </span>
                  {meta && meta !== "{}" && (
                    <span className="mt-0.5 block truncate font-mono text-[10px] text-white/30">
                      {meta}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-[11px] text-white/40">
                  {log.timestamp.toLocaleString("tr-TR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/islem-gecmisi?${new URLSearchParams({
                ...(q ? { q } : {}),
                page: String(page - 1),
              })}`}
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
              href={`/admin/islem-gecmisi?${new URLSearchParams({
                ...(q ? { q } : {}),
                page: String(page + 1),
              })}`}
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
