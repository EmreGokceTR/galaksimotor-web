import Link from "next/link";
import type { MotoProduct } from "@/lib/moto";

const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

export function MotoProductGrid({ products }: { products: MotoProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center">
        <p className="text-sm text-white/60">
          Bu modele uygun ürünler yakında listelenecek. İhtiyacın olan parçayı
          hemen temin edelim — bize ulaş.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/urunler"
            className="rounded-full bg-brand-yellow px-5 py-2.5 text-sm font-semibold text-brand-black hover:bg-brand-yellow/80"
          >
            Tüm Ürünler
          </Link>
          <Link
            href="/iletisim"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-white/80 hover:border-brand-yellow/40 hover:text-brand-yellow"
          >
            Parça Sor / İletişim
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/urun/${p.slug}`}
          className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] transition hover:border-brand-yellow/40"
        >
          <div className="relative aspect-square w-full overflow-hidden bg-black/30">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image}
                alt={p.name}
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white/20">🏍</div>
            )}
          </div>
          <div className="p-4">
            <h3 className="line-clamp-2 text-sm font-medium text-white group-hover:text-brand-yellow">
              {p.name}
            </h3>
            <div className="mt-2 text-base font-bold text-brand-yellow">
              {fmt(p.price)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
