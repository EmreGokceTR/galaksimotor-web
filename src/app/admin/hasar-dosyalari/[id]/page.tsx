import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { CLAIM_TYPE } from "../constants";
import { ClaimManager } from "./ClaimManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dosya Detayı · Admin" };

const fmtTRY = (n: number) =>
  n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

export default async function ClaimDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();

  const c = await prisma.damageClaim.findUnique({ where: { id: params.id } });
  if (!c) notFound();

  const vehicle = [c.vehicleBrand, c.vehicleModel, c.vehicleYear]
    .filter(Boolean)
    .join(" ");
  const phoneDigits = c.phone.replace(/\D/g, "").replace(/^0/, "90");

  return (
    <div className="space-y-6">
      <Link
        href="/admin/hasar-dosyalari"
        className="text-xs text-white/50 hover:text-brand-yellow"
      >
        ← Hasar Dosyaları
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold text-white">{c.claimNumber}</h1>
          <p className="mt-1 text-sm text-white/55">
            {CLAIM_TYPE[c.type] ?? c.type} ·{" "}
            {c.createdAt.toLocaleDateString("tr-TR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`tel:${c.phone.replace(/\s/g, "")}`}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:text-brand-yellow"
          >
            ☎ Ara
          </a>
          <a
            href={`https://wa.me/${phoneDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            WhatsApp
          </a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Başvuru bilgileri */}
        <div className="space-y-4">
          <Section title="Başvuran">
            <Row label="Ad Soyad" value={c.fullName} />
            <Row label="Telefon" value={c.phone} />
            {c.email && <Row label="E-posta" value={c.email} />}
            {c.tcNo && <Row label="T.C. No" value={c.tcNo} />}
          </Section>

          <Section title="Araç">
            <Row label="Araç" value={vehicle || "—"} />
            {c.plate && <Row label="Plaka" value={c.plate} />}
          </Section>

          <Section title="Kaza Bilgisi">
            <Row
              label="Kaza Tarihi"
              value={c.accidentDate ? c.accidentDate.toLocaleDateString("tr-TR") : "—"}
            />
            <Row label="Kusur Durumu" value={c.faultStatus || "—"} />
            {c.description && (
              <div className="pt-2">
                <div className="text-[11px] uppercase tracking-wider text-white/40">
                  Açıklama
                </div>
                <p className="mt-1 whitespace-pre-line text-sm text-white/75">
                  {c.description}
                </p>
              </div>
            )}
          </Section>
        </div>

        {/* Yönetim paneli */}
        <ClaimManager
          claim={{
            id: c.id,
            type: c.type,
            status: c.status,
            adminNote: c.adminNote ?? "",
            faultStatus: c.faultStatus ?? "",
            estimatedValue: c.estimatedValue === null ? "" : String(Number(c.estimatedValue)),
          }}
        />
      </div>

      {c.estimatedValue !== null && (
        <p className="text-sm text-white/50">
          Tahmini değer kaybı:{" "}
          <span className="font-semibold text-gradient-gold">
            {fmtTRY(Number(c.estimatedValue))}
          </span>
        </p>
      )}
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
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-white/45">{label}</span>
      <span className="text-right text-white/85">{value}</span>
    </div>
  );
}
