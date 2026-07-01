import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { motoSlug } from "@/lib/moto";
import { SearchBox } from "@/components/SearchBox";

export const dynamic = "force-dynamic";

export function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string };
}): Metadata {
  const q = (searchParams.q ?? "").trim();
  return {
    title: q ? `"${q}" için arama sonuçları` : "Arama",
    description: "Galaksi Motor sitesinde ürün, kategori, blog ve motosiklet modeli arayın.",
    // Arama sonuç sayfaları indekslenmez (ince/yinelenen içerik) ama taranabilir
    robots: { index: false, follow: true },
  };
}

const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim();

  let products: { id: string; slug: string; name: string; price: number; image: string | null }[] = [];
  let categories: { slug: string; name: string }[] = [];
  let posts: { slug: string; title: string; excerpt: string | null }[] = [];
  let motos: { brand: string; model: string }[] = [];

  if (q.length >= 2) {
    const where = { contains: q, mode: "insensitive" as const };
    // Çok kelimeli aramalar (ör. "rks balata", "vrs fren balata") için her
    // kelime ayrı ayrı AND'lenir; her kelime kendi içinde ürün alanlarına
    // OR ile bakar. Böylece kelimeler farklı alanlarda/sırada geçse de bulunur.
    const words = q.split(/\s+/).filter(Boolean);
    const productWhere =
      words.length > 1
        ? {
            isActive: true,
            AND: words.map((w) => ({
              OR: [
                { name: { contains: w, mode: "insensitive" as const } },
                { sku: { contains: w, mode: "insensitive" as const } },
                { description: { contains: w, mode: "insensitive" as const } },
                { brand: { contains: w, mode: "insensitive" as const } },
                { oemNo: { contains: w, mode: "insensitive" as const } },
                { compatNo: { contains: w, mode: "insensitive" as const } },
              ],
            })),
          }
        : {
            isActive: true,
            OR: [
              { name: where },
              { sku: where },
              { description: where },
              { brand: where },
              { oemNo: where },
              { compatNo: where },
            ],
          };
    const [prodRows, catRows, blogRows, motoRows] = await Promise.all([
      prisma.product.findMany({
        where: productWhere,
        select: {
          id: true,
          slug: true,
          name: true,
          price: true,
          images: { take: 1, orderBy: { position: "asc" }, select: { url: true } },
        },
        take: 24,
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findMany({
        where: { OR: [{ name: where }, { description: where }] },
        select: { slug: true, name: true },
        take: 12,
      }),
      prisma.blogPost.findMany({
        where: {
          isPublished: true,
          publishedAt: { lte: new Date() },
          OR: [{ title: where }, { excerpt: where }, { content: where }],
        },
        select: { slug: true, title: true, excerpt: true },
        take: 12,
        orderBy: { publishedAt: "desc" },
      }),
      prisma.motorcycle.findMany({
        where: { OR: [{ brand: where }, { model: where }] },
        select: { brand: true, model: true },
        orderBy: [{ brand: "asc" }, { model: "asc" }],
        take: 40,
      }),
    ]);

    products = prodRows.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: Number(p.price),
      image: p.images[0]?.url ?? null,
    }));
    categories = catRows;
    posts = blogRows;
    // Marka+model tekilleştir
    const seen = new Set<string>();
    for (const m of motoRows) {
      const key = `${m.brand}|${m.model}`;
      if (!seen.has(key)) {
        seen.add(key);
        motos.push({ brand: m.brand, model: m.model });
      }
    }
  }

  const total = products.length + categories.length + posts.length + motos.length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white md:text-3xl">
          {q ? <>“{q}” için sonuçlar</> : "Arama"}
        </h1>
        <div className="mt-4 max-w-xl">
          <SearchBox initial={q} autoFocus />
        </div>
        {q.length >= 2 && (
          <p className="mt-3 text-sm text-white/50">{total} sonuç bulundu.</p>
        )}
      </header>

      {q.length < 2 ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center text-sm text-white/55">
          Aramak için en az 2 karakter girin. Örn: <em>Bajaj, fren balatası, değer kaybı…</em>
        </p>
      ) : total === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center">
          <p className="text-sm text-white/60">
            “{q}” için sonuç bulunamadı. Farklı bir kelime deneyin veya{" "}
            <Link href="/iletisim" className="text-brand-yellow underline">bize sorun</Link>.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Ürünler */}
          {products.length > 0 && (
            <Section title={`Ürünler (${products.length})`} href="/urunler">
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
                        <img src={p.image} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-white/20">🏍</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-2 text-sm font-medium text-white group-hover:text-brand-yellow">{p.name}</h3>
                      <div className="mt-2 text-base font-bold text-brand-yellow">{fmt(p.price)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {/* Motosiklet modelleri */}
          {motos.length > 0 && (
            <Section title={`Motosiklet Modelleri (${motos.length})`} href="/motosiklet">
              <div className="flex flex-wrap gap-2">
                {motos.map((m) => (
                  <Link
                    key={`${m.brand}-${m.model}`}
                    href={`/motosiklet/${motoSlug(m.brand)}/${motoSlug(m.model)}`}
                    className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/80 transition hover:border-brand-yellow/40 hover:text-brand-yellow"
                  >
                    {m.brand} {m.model}
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {/* Kategoriler */}
          {categories.length > 0 && (
            <Section title={`Kategoriler (${categories.length})`}>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/kategori/${c.slug}`}
                    className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/80 transition hover:border-brand-yellow/40 hover:text-brand-yellow"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {/* Blog */}
          {posts.length > 0 && (
            <Section title={`Blog Yazıları (${posts.length})`} href="/blog">
              <ul className="space-y-3">
                {posts.map((b) => (
                  <li key={b.slug}>
                    <Link href={`/blog/${b.slug}`} className="block rounded-xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-brand-yellow/40">
                      <h3 className="text-sm font-semibold text-white">{b.title}</h3>
                      {b.excerpt && <p className="mt-1 line-clamp-2 text-xs text-white/50">{b.excerpt}</p>}
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">{title}</h2>
        {href && (
          <Link href={href} className="text-xs text-white/50 hover:text-brand-yellow">
            Tümü →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
