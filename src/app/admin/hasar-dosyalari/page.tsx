import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import type { ClaimStatus, Prisma } from "@prisma/client";
import { CLAIM_STATUS, CLAIM_TYPE } from "./constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hasar Dosyaları · Admin" };

const STATUS_ORDER: ClaimStatus[] = [
  "NEW",
  "CONTACTED",
  "IN_PROGRESS",
  "COMPLETED",
  "REJECTED",
];

export default async function AdminClaimsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  await requireAdmin();

  const statusFilter = STATUS_ORDER.includes(searchParams.status as ClaimStatus)
    ? (searchParams.status as ClaimStatus)
    : undefined;

  const where: Prisma.DamageClaimWhereInput = statusFilter
    ? { status: statusFilter }
    : {};

  const [claims, total, newCount] = await Promise.all([
    prisma.damageClaim.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
    prisma.damageClaim.count({ where }),
    prisma.damageClaim.count({ where: { status: "NEW" } }),
  ]);

  const tabs: { label: string; status?: ClaimStatus }[] = [
    { label: "Tümü" },
    { label: "Yeni", status: "NEW" },
    { label: "İletişim", status: "CONTACTED" },
    { label: "Süreçte", status: "IN_PROGRESS" },
    { label: "Sonuçlandı", status: "COMPLETED" },
    { label: "İptal", status: "REJECTED" },
  ];

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-white">Hasar & Değer Kaybı Dosyaları</h1>
        <p className="mt-1 text-sm text-white/50">
          Trafik kazası başvuruları. {newCount > 0 && (
            <span className="text-amber-300">{newCount} yeni başvuru bekliyor.</span>
          )}
        </p>
      </header>

      {/* Durum sekmeleri */}
      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => {
          const active = (t.status ?? undefined) === statusFilter;
          return (
            <Link
              key={t.label}
              href={t.status ? `/admin/hasar-dosyalari?status=${t.status}` : "/admin/hasar-dosyalari"}
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

      {claims.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-white/45">
          Bu filtreye uygun dosya yok.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/[0.02] text-left text-[11px] uppercase tracking-wider text-white/45">
                <tr>
                  <th className="px-4 py-3">Dosya No</th>
                  <th className="px-4 py-3">Tür</th>
                  <th className="px-4 py-3">Başvuran</th>
                  <th className="px-4 py-3">Araç</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {claims.map((c) => {
                  const st = CLAIM_STATUS[c.status];
                  const vehicle = [c.vehicleBrand, c.vehicleModel, c.vehicleYear]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 align-top">
                        <Link
                          href={`/admin/hasar-dosyalari/${c.id}`}
                          className="font-mono text-xs font-semibold text-white hover:text-brand-yellow"
                        >
                          {c.claimNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-white/70">
                        {CLAIM_TYPE[c.type] ?? c.type}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="text-white">{c.fullName}</div>
                        <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="text-[11px] text-white/45 hover:text-brand-yellow">
                          {c.phone}
                        </a>
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-white/70">
                        {vehicle || "—"}
                        {c.plate && <div className="text-white/40">{c.plate}</div>}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-white/50">
                        {c.createdAt.toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase ring-1 ${st?.tone ?? ""}`}>
                          {st?.label ?? c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p className="text-xs text-white/40">Toplam {total} dosya gösteriliyor.</p>
    </div>
  );
}
