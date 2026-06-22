import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { ReviewRow } from "./ReviewRow";

export const dynamic = "force-dynamic";
export const metadata = { title: "Yorumlar · Admin" };

export default async function AdminReviewsPage() {
  await requireAdmin();

  const [reviews, avg] = await Promise.all([
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, slug: true } },
      },
    }),
    prisma.review.aggregate({ _avg: { rating: true }, _count: true }),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Ürün Yorumları</h1>
          <p className="mt-1 text-sm text-white/50">
            Müşteri yorumlarını incele ve uygunsuz olanları sil.
          </p>
        </div>
        {avg._count > 0 && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm">
            <span className="text-white/50">Ortalama:</span>{" "}
            <span className="font-semibold text-brand-yellow">
              {(avg._avg.rating ?? 0).toFixed(1)} ★
            </span>{" "}
            <span className="text-white/40">({avg._count} yorum)</span>
          </div>
        )}
      </header>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-white/45">
          Henüz yorum yok.
        </div>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-amber-300">
                      {"★".repeat(r.rating)}
                      <span className="text-white/20">
                        {"★".repeat(Math.max(0, 5 - r.rating))}
                      </span>
                    </span>
                    <Link
                      href={r.product?.slug ? `/urun/${r.product.slug}` : "#"}
                      className="text-sm font-semibold text-white hover:text-brand-yellow"
                    >
                      {r.product?.name ?? "Ürün silinmiş"}
                    </Link>
                  </div>
                  <div className="mt-0.5 text-[11px] text-white/40">
                    {r.user?.name ?? r.user?.email ?? "Kullanıcı"} ·{" "}
                    {r.createdAt.toLocaleDateString("tr-TR")}
                  </div>
                  {r.comment && (
                    <p className="mt-2 whitespace-pre-line text-sm text-white/75">
                      {r.comment}
                    </p>
                  )}
                </div>
                <ReviewRow id={r.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
