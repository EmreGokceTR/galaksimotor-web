import type { Metadata } from "next";
import Link from "next/link";
import { getMotoBrands } from "@/lib/moto";
import { SITE } from "@/config/site";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Motosiklet Markaları — Modele Göre Yedek Parça | Galaksi Motor",
  description:
    "Bajaj, Honda, Kymco, RKS ve daha fazlası — motosiklet markanıza ve modelinize uygun yedek parça, aksesuar ve servis. Küçükçekmece / İstanbul Galaksi Motor.",
  alternates: { canonical: `${SITE.url}/motosiklet` },
};

export default async function MotoIndexPage() {
  const brands = await getMotoBrands();

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <header className="mb-10 text-center">
        <span className="text-xs font-medium uppercase tracking-[0.25em] text-brand-yellow/80">
          · Modele Göre Yedek Parça
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
          Motosikletine Uygun <span className="text-gradient-gold">Parçayı Bul</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/60">
          Markanı seç, modeline tam uyumlu yedek parça ve aksesuarları gör.
          Aradığın modeli bulamazsan bize ulaş — Küçükçekmece / İstanbul'daki
          Galaksi Motor olarak temin ve servis sağlıyoruz.
        </p>
      </header>

      {brands.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center text-sm text-white/55">
          Marka listesi yakında.{" "}
          <Link href="/urunler" className="text-brand-yellow underline">
            Tüm ürünlere göz at
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-6">
          {brands.map((b) => (
            <section
              key={b.brandSlug}
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"
            >
              <h2 className="mb-3 text-lg font-bold text-white">
                <Link href={`/motosiklet/${b.brandSlug}`} className="hover:text-brand-yellow">
                  {b.brand}
                </Link>
              </h2>
              <div className="flex flex-wrap gap-2">
                {b.models.map((m) => (
                  <Link
                    key={m.slug}
                    href={`/motosiklet/${b.brandSlug}/${m.slug}`}
                    className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/80 transition hover:border-brand-yellow/40 hover:text-brand-yellow"
                  >
                    {b.brand} {m.name}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
