import { prisma } from "@/lib/prisma";

/** Marka/model adını URL slug'ına çevir (Türkçe karakter dahil). */
export function motoSlug(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type MotoProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
};

/** Tüm markalar + altındaki modeller (katalogdan, slug'lı). */
export async function getMotoBrands() {
  const motos = await prisma.motorcycle.findMany({
    orderBy: [{ brand: "asc" }, { model: "asc" }, { year: "desc" }],
    select: { brand: true, model: true },
  });
  const map = new Map<string, { brand: string; brandSlug: string; models: Map<string, string> }>();
  for (const m of motos) {
    const bs = motoSlug(m.brand);
    if (!map.has(bs)) map.set(bs, { brand: m.brand, brandSlug: bs, models: new Map() });
    const entry = map.get(bs)!;
    const ms = motoSlug(m.model);
    if (!entry.models.has(ms)) entry.models.set(ms, m.model);
  }
  return Array.from(map.values()).map((b) => ({
    brand: b.brand,
    brandSlug: b.brandSlug,
    models: Array.from(b.models.entries()).map(([slug, name]) => ({ slug, name })),
  }));
}

/** Belirli markaya (slug) ait gerçek marka adı + modeller. */
export async function resolveBrand(brandSlug: string) {
  const brands = await getMotoBrands();
  return brands.find((b) => b.brandSlug === brandSlug) ?? null;
}

/** Marka+model slug'larından motosiklet kayıtlarını (tüm yıllar) bul. */
export async function resolveModel(brandSlug: string, modelSlug: string) {
  const motos = await prisma.motorcycle.findMany({
    select: { id: true, brand: true, model: true, year: true },
  });
  const matches = motos.filter(
    (m) => motoSlug(m.brand) === brandSlug && motoSlug(m.model) === modelSlug
  );
  if (matches.length === 0) return null;
  return {
    brand: matches[0].brand,
    model: matches[0].model,
    years: matches.map((m) => m.year).sort((a, b) => b - a),
    motorcycleIds: matches.map((m) => m.id),
  };
}

/** Verilen motosiklet id'lerine uyumlu AKTİF ürünler (tekilleştirilmiş). */
export async function compatibleProducts(motorcycleIds: string[]): Promise<MotoProduct[]> {
  if (motorcycleIds.length === 0) return [];
  const fitments = await prisma.fitment.findMany({
    where: { motorcycleId: { in: motorcycleIds }, product: { isActive: true } },
    select: {
      product: {
        select: {
          id: true,
          slug: true,
          name: true,
          price: true,
          images: { take: 1, orderBy: { position: "asc" }, select: { url: true } },
        },
      },
    },
  });
  const seen = new Map<string, MotoProduct>();
  for (const f of fitments) {
    const p = f.product;
    if (!seen.has(p.id)) {
      seen.set(p.id, {
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: Number(p.price),
        image: p.images[0]?.url ?? null,
      });
    }
  }
  return Array.from(seen.values());
}

/** Bir markanın tüm modellerine uyumlu aktif ürünler. */
export async function compatibleProductsByBrand(brand: string): Promise<MotoProduct[]> {
  const motos = await prisma.motorcycle.findMany({
    where: { brand },
    select: { id: true },
  });
  return compatibleProducts(motos.map((m) => m.id));
}
