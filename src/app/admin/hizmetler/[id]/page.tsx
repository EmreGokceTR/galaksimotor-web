import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { ServiceForm } from "../ServiceForm";

export default async function EditServicePage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const svc = await prisma.service.findUnique({ where: { id: params.id } });
  if (!svc) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Hizmeti Düzenle</h1>
        <Link href="/admin/hizmetler"
          className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/70 hover:text-brand-yellow">
          ← Geri
        </Link>
      </header>
      <ServiceForm service={{
        id: svc.id,
        name: svc.name,
        slug: svc.slug,
        description: svc.description,
        duration: svc.duration,
        price: svc.price !== null ? Number(svc.price) : null,
        isActive: svc.isActive,
      }} />
    </div>
  );
}
