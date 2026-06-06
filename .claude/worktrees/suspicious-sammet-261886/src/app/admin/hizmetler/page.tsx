import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { DeleteServiceButton } from "./DeleteServiceButton";
import { ServiceForm } from "./ServiceForm";

export default async function AdminHizmetlerPage() {
  await requireAdmin();

  const services = await prisma.service.findMany({
    orderBy: { duration: "asc" },
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-white">Hizmetler</h1>
        <p className="mt-1 text-sm text-white/50">
          Randevu formunda görünen servisleri ekle, düzenle veya sil.
        </p>
      </header>

      {/* Mevcut hizmetler */}
      {services.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-white/45">
          Henüz hizmet yok. Aşağıdan ekleyebilirsin.
        </div>
      ) : (
        <ul className="space-y-3">
          {services.map((svc) => (
            <li key={svc.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ring-1 ${
                    svc.isActive
                      ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30"
                      : "bg-white/10 text-white/55 ring-white/15"
                  }`}>
                    {svc.isActive ? "Aktif" : "Pasif"}
                  </span>
                  <span className="text-[11px] text-white/40">{svc.duration} dk</span>
                  {svc.price !== null && (
                    <span className="text-[11px] text-brand-yellow/70">
                      {Number(svc.price).toLocaleString("tr-TR")} ₺
                    </span>
                  )}
                </div>
                <h3 className="mt-1 text-base font-semibold text-white">{svc.name}</h3>
                {svc.description && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-white/45">{svc.description}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/hizmetler/${svc.id}`}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/75 hover:text-brand-yellow"
                >
                  Düzenle
                </Link>
                <DeleteServiceButton id={svc.id} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Yeni hizmet formu */}
      <ServiceForm />
    </div>
  );
}
