import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Müşteri Detayı · Admin" };

const fmtTRY = (n: number) =>
  n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

const ORDER_STATUS: Record<string, { label: string; tone: string }> = {
  PENDING: { label: "Beklemede", tone: "bg-amber-500/15 text-amber-300" },
  PREPARING: { label: "Hazırlanıyor", tone: "bg-sky-500/15 text-sky-300" },
  SHIPPED: { label: "Kargoda", tone: "bg-indigo-500/15 text-indigo-300" },
  DELIVERED: { label: "Teslim", tone: "bg-emerald-500/15 text-emerald-300" },
  CANCELLED: { label: "İptal", tone: "bg-rose-500/15 text-rose-300" },
};
const APPT_STATUS: Record<string, { label: string; tone: string }> = {
  PENDING: { label: "Beklemede", tone: "bg-amber-500/15 text-amber-300" },
  CONFIRMED: { label: "Onaylı", tone: "bg-emerald-500/15 text-emerald-300" },
  COMPLETED: { label: "Tamamlandı", tone: "bg-sky-500/15 text-sky-300" },
  CANCELLED: { label: "İptal", tone: "bg-rose-500/15 text-rose-300" },
};

export default async function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 50 },
      appointments: {
        orderBy: { scheduledAt: "desc" },
        take: 50,
        include: { service: { select: { name: true } } },
      },
      motorcycles: { include: { motorcycle: true } },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { product: { select: { name: true, slug: true } } },
      },
      _count: { select: { favorites: true } },
    },
  });

  if (!user) notFound();

  const totalSpent = user.orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((s, o) => s + Number(o.total), 0);
  const phoneDigits = user.phone?.replace(/\D/g, "").replace(/^0/, "90");

  return (
    <div className="space-y-6">
      <Link
        href="/admin/kullanicilar"
        className="text-xs text-white/50 hover:text-brand-yellow"
      >
        ← Kullanıcılar
      </Link>

      {/* Kimlik kartı */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">
                {user.name ?? "(isimsiz)"}
              </h1>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  user.role === "ADMIN"
                    ? "bg-brand-yellow/20 text-brand-yellow ring-1 ring-brand-yellow/40"
                    : "bg-white/10 text-white/70"
                }`}
              >
                {user.role}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/60">
              <a href={`mailto:${user.email}`} className="hover:text-brand-yellow">
                ✉ {user.email}
              </a>
              {user.phone && (
                <>
                  <a
                    href={`tel:${user.phone.replace(/\s/g, "")}`}
                    className="hover:text-brand-yellow"
                  >
                    ☎ {user.phone}
                  </a>
                  <a
                    href={`https://wa.me/${phoneDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400/80 hover:text-emerald-300"
                  >
                    WhatsApp →
                  </a>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-white/40">
              Üyelik: {user.createdAt.toLocaleDateString("tr-TR")} ·{" "}
              {user.emailVerified ? "E-posta doğrulanmış" : "E-posta doğrulanmamış"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
            <MiniStat label="Sipariş" value={user.orders.length} />
            <MiniStat label="Toplam Harcama" value={fmtTRY(totalSpent)} accent />
            <MiniStat label="Randevu" value={user.appointments.length} />
            <MiniStat label="Favori" value={user._count.favorites} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Siparişler */}
        <Section title={`Siparişler (${user.orders.length})`}>
          {user.orders.length === 0 ? (
            <Empty>Sipariş yok.</Empty>
          ) : (
            <ul className="divide-y divide-white/5">
              {user.orders.map((o) => {
                const st = ORDER_STATUS[o.status] ?? {
                  label: o.status,
                  tone: "bg-white/10 text-white/60",
                };
                return (
                  <li key={o.id} className="flex items-center justify-between gap-2 py-2.5">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/siparisler/${o.id}`}
                        className="font-mono text-sm text-white hover:text-brand-yellow"
                      >
                        #{o.orderNumber}
                      </Link>
                      <div className="text-[11px] text-white/40">
                        {o.createdAt.toLocaleDateString("tr-TR")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${st.tone}`}>
                        {st.label}
                      </span>
                      <span className="text-sm font-semibold text-gradient-gold">
                        {fmtTRY(Number(o.total))}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        {/* Randevular */}
        <Section title={`Randevular (${user.appointments.length})`}>
          {user.appointments.length === 0 ? (
            <Empty>Randevu yok.</Empty>
          ) : (
            <ul className="divide-y divide-white/5">
              {user.appointments.map((a) => {
                const st = APPT_STATUS[a.status] ?? {
                  label: a.status,
                  tone: "bg-white/10 text-white/60",
                };
                return (
                  <li key={a.id} className="flex items-center justify-between gap-2 py-2.5">
                    <div className="min-w-0">
                      <div className="truncate text-sm text-white">
                        {a.service?.name ?? "Hizmet"}
                      </div>
                      <div className="text-[11px] text-white/40">
                        {a.scheduledAt.toLocaleString("tr-TR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {(a.motoBrand || a.motoModel) && (
                          <> · {[a.motoBrand, a.motoModel].filter(Boolean).join(" ")}</>
                        )}
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${st.tone}`}>
                      {st.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        {/* Garaj */}
        <Section title={`Garaj (${user.motorcycles.length})`}>
          {user.motorcycles.length === 0 ? (
            <Empty>Kayıtlı motosiklet yok.</Empty>
          ) : (
            <ul className="divide-y divide-white/5">
              {user.motorcycles.map((m) => (
                <li key={m.id} className="py-2.5 text-sm text-white/80">
                  {m.motorcycle.brand} {m.motorcycle.model} ({m.motorcycle.year})
                  {m.nickname && (
                    <span className="text-white/40"> · “{m.nickname}”</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Yorumlar */}
        <Section title={`Yorumlar (${user.reviews.length})`}>
          {user.reviews.length === 0 ? (
            <Empty>Yorum yok.</Empty>
          ) : (
            <ul className="divide-y divide-white/5">
              {user.reviews.map((r) => (
                <li key={r.id} className="py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={r.product?.slug ? `/urun/${r.product.slug}` : "#"}
                      className="truncate text-sm text-white hover:text-brand-yellow"
                    >
                      {r.product?.name ?? "Ürün"}
                    </Link>
                    <span className="text-xs text-amber-300">{"★".repeat(r.rating)}</span>
                  </div>
                  {r.comment && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-white/50">
                      {r.comment}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-white/40">
        {label}
      </div>
      <div className={`text-base font-bold ${accent ? "text-gradient-gold" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-white">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-center text-xs text-white/45">
      {children}
    </p>
  );
}
