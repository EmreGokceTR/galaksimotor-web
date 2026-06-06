import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          images: { take: 1, orderBy: { position: "asc" } },
          category: true,
        },
      },
    },
    orderBy: { id: "desc" },
  });

  if (favorites.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center backdrop-blur-md">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-rose-300">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-white">Henüz favori ürünün yok</h3>
        <p className="mt-1 text-sm text-white/55">
          Beğendiğin ürünlerdeki kalp simgesine tıklayarak buraya ekleyebilirsin.
        </p>
        <Link
          href="/urunler"
          className="mt-5 inline-block rounded-full bg-brand-yellow px-5 py-2 text-sm font-semibold text-brand-black"
        >
          Ürünleri Keşfet
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map((f, i) => (
        <ProductCard
          key={f.id}
          index={i}
          product={{
            id: f.product.id,
            slug: f.product.slug,
            name: f.product.name,
            sku: f.product.sku,
            price: Number(f.product.price),
            stock: f.product.stock,
            brand: f.product.brand,
            image: f.product.images[0]?.url ?? null,
            category: {
              name: f.product.category.name,
              slug: f.product.category.slug,
            },
          }}
        />
      ))}
    </div>
  );
}
