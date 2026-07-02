import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { MotorcycleManager } from "./MotorcycleManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Motosiklet Kataloğu · Admin" };

export default async function MotorCatalogPage() {
  await requireAdmin();

  const motorcycles = await prisma.motorcycle.findMany({
    orderBy: [{ brand: "asc" }, { model: "asc" }, { year: "desc" }],
    include: { _count: { select: { fitments: true, userOwnerships: true } } },
    take: 500,
  });

  const data = motorcycles.map((m) => ({
    id: m.id,
    brand: m.brand,
    model: m.model,
    year: m.year,
    fitmentCount: m._count.fitments,
    ownershipCount: m._count.userOwnerships,
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Motosiklet Kataloğu</h1>
        <p className="mt-1 text-sm text-white/50">
          Ürün uyumluluğu (fitment) ve müşteri garajı için temel motosiklet
          listesi. Buraya eklediğin marka/model/yıl, ürün düzenleme ekranındaki
          &quot;Uyumluluk&quot; bölümünde seçilebilir hale gelir.
        </p>
      </header>

      <MotorcycleManager motorcycles={data} />
    </div>
  );
}
