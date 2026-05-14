import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductPurchasePanel } from "@/components/ProductPurchasePanel";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ReviewSection } from "@/components/ReviewSection";
import { AdminEditButton } from "@/components/AdminEditButton";
import { SITE } from "@/config/site";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true, images: { take: 1, orderBy: { position: "asc" } } },
  });
  if (!p) return { title: "Ürün bulunamadı" };
  const title = `${p.name} - ${SITE.name}`;
  const description = p.description ?? `${p.name} — ${SITE.name}'da satın al.`;
  const image = p.images[0]?.url;
  return {
    title,
    description,
    alternates: { canonical: `${SITE.url}/urun/${params.slug}` },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: `${SITE.url}/urun/${params.slug}`,
      siteName: SITE.name,
      title,
      description,
      images: image ? [{ url: image, alt: p.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
      category: true,
      fitments: { include: { motorcycle: true } },
    },
  });
  if (!product) notFound();

  // Varyantları gruplandır (Renk, Beden vs.)
  const variantGroups = product.variants.reduce<Record<string, typeof product.variants>>(
    (acc, v) => {
      acc[v.name] = acc[v.name] ?? [];
      acc[v.name].push(v);
      return acc;
    },
    {}
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <nav className="mb-4 text-sm text-white/50">
        <Link href="/" className="hover:text-brand-yellow">
          Anasayfa
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/kategori/${product.category.slug}`}
          className="hover:text-brand-yellow"
        >
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery
          images={product.images.map((i) => ({ url: i.url, alt: i.alt ?? product.name }))}
        />

        <div className="space-y-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm uppercase text-white/50">{product.brand}</span>
              <AdminEditButton
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: Number(product.price),
                  stock: product.stock,
                  image: product.images[0]?.url ?? null,
                }}
              />
            </div>
            <h1 className="text-3xl font-bold text-white">{product.name}</h1>
            <span className="text-xs text-white/40">SKU: {product.sku}</span>
          </div>

          <div className="text-3xl font-bold text-brand-yellow">
            {Number(product.price).toLocaleString("tr-TR", {
              style: "currency",
              currency: "TRY",
            })}
          </div>

          {product.stock > 0 ? (
            <div className="rounded bg-green-500/20 px-3 py-1 inline-block text-sm text-green-400">
              Stokta ({product.stock} adet)
            </div>
          ) : (
            <div className="rounded bg-red-500/20 px-3 py-1 inline-block text-sm text-red-400">
              Tükendi
            </div>
          )}

          {product.description && (
            <p className="text-white/80 leading-relaxed">{product.description}</p>
          )}

          <FavoriteButton productId={product.id} variant="pill" />

          <ProductPurchasePanel
            productId={product.id}
            slug={product.slug}
            name={product.name}
            sku={product.sku}
            price={Number(product.price)}
            image={product.images[0]?.url ?? null}
            stock={product.stock}
            variantGroups={Object.entries(variantGroups).map(([name, items]) => ({
              name,
              options: items.map((i) => ({ id: i.id, value: i.value, sku: i.sku })),
            }))}
          />

          {product.fitments.length > 0 && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <h3 className="mb-2 text-sm font-semibold text-brand-yellow">
                Uyumlu Motosikletler
              </h3>
              <ul className="space-y-1 text-sm text-white/70">
                {product.fitments.map((f) => (
                  <li key={f.id}>
                    • {f.motorcycle.brand} {f.motorcycle.model} ({f.motorcycle.year})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <ReviewSection productId={product.id} />
    </div>
  );
}
