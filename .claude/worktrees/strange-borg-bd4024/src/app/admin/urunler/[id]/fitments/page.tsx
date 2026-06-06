import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FitmentClient } from "./FitmentClient";

export const metadata = { title: "Uyumluluk - Admin" };

export default async function FitmentPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, sku: true, slug: true },
  });
  if (!product) notFound();

  const [motorcycles, fitments] = await Promise.all([
    prisma.motorcycle.findMany({
      orderBy: [{ brand: "asc" }, { model: "asc" }, { year: "desc" }],
    }),
    prisma.fitment.findMany({
      where: { productId: product.id },
      select: { motorcycleId: true },
    }),
  ]);

  const selected = new Set(fitments.map((f) => f.motorcycleId));

  return (
    <div>
      <Link href="/admin/urunler" className="text-xs text-white/45 hover:text-brand-yellow">
        ← Ürünler
      </Link>

      <header className="mt-3 mb-6">
        <h2 className="text-xl font-bold text-white">Uyumluluk Yönetimi</h2>
        <p className="mt-1 text-sm text-white/55">
          <span className="text-white">{product.name}</span> · SKU {product.sku}
        </p>
        <p className="mt-1 text-xs text-white/40">
          Bu ürünün uyumlu olduğu motosikletleri işaretleyip kaydet.
        </p>
      </header>

      {motorcycles.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-white/45">
          Henüz veritabanında motosiklet yok. Önce <Link href="/admin/motosikletler" className="text-brand-yellow underline">motosiklet ekle</Link>.
        </div>
      ) : (
        <FitmentClient
          productId={product.id}
          motorcycles={motorcycles.map((m) => ({
            id: m.id,
            brand: m.brand,
            model: m.model,
            year: m.year,
          }))}
          initialSelected={Array.from(selected)}
        />
      )}
    </div>
  );
}