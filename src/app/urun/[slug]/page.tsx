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
import { motoSlug } from "@/lib/moto";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: {
      name: true,
      description: true,
      price: true,
      stock: true,
      brand: true,
      images: { take: 1, orderBy: { position: "asc" } },
    },
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
      // Facebook/WhatsApp/Twitter: "ürün" tipi link önizleme — fiyat ve durum gösterir
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
    other: {
      // Product-specific Open Graph (og:product:* — Facebook Catalog için)
      "product:price:amount": Number(p.price).toFixed(2),
      "product:price:currency": "TRY",
      "product:availability": p.stock > 0 ? "instock" : "oos",
      "product:condition": "new",
      ...(p.brand ? { "product:brand": p.brand } : {}),
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

  // Yorumları çek (rating aggregation için)
  const reviews = await prisma.review.findMany({
    where: { productId: product.id },
    select: { rating: true },
  });
  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
      : null;

  // Varyantları gruplandır (Renk, Beden vs.)
  const variantGroups = product.variants.reduce<Record<string, typeof product.variants>>(
    (acc, v) => {
      acc[v.name] = acc[v.name] ?? [];
      acc[v.name].push(v);
      return acc;
    },
    {}
  );

  // ─── JSON-LD #1: Product (Google "rich result" için) ───
  // Şu ek alanlarla Google ürün rich snippet gösterir (yıldız + fiyat):
  //  - aggregateRating: yorumlardan hesaplanır (Review tablosu)
  //  - priceValidUntil: 1 yıl ileri tarih (sürekli geçerli izlenimi)
  //  - itemCondition: NewCondition (yedek parça yeni)
  //  - shippingDetails: 49.90 TL TR içi 1-3 iş günü
  //  - hasMerchantReturnPolicy: 14 gün cayma hakkı (TKHK)
  const oneYearLater = new Date();
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE.url}/urun/${product.slug}#product`,
    name: product.name,
    description:
      product.description ?? `${product.name} — ${SITE.name} kalitesinde.`,
    sku: product.sku,
    mpn: product.sku,
    image: product.images.length > 0
      ? product.images.map((img) => img.url)
      : [`${SITE.url}/logos/galaksi-motor-logo.jpg`],
    url: `${SITE.url}/urun/${product.slug}`,
    category: product.category.name,
    ...(product.brand
      ? { brand: { "@type": "Brand", name: product.brand } }
      : {}),
    offers: {
      "@type": "Offer",
      "@id": `${SITE.url}/urun/${product.slug}#offer`,
      url: `${SITE.url}/urun/${product.slug}`,
      priceCurrency: "TRY",
      price: Number(product.price).toFixed(2),
      priceValidUntil: oneYearLater.toISOString().slice(0, 10),
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: SITE.name,
        url: SITE.url,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "49.90",
          currency: "TRY",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "TR",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "TR",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
    ...(avgRating != null && reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  // ─── JSON-LD #2: BreadcrumbList (Google sıralı bilgi) ───
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Anasayfa",
        item: SITE.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Ürünler",
        item: `${SITE.url}/urunler`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.category.name,
        item: `${SITE.url}/kategori/${product.category.slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: `${SITE.url}/urun/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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
                  sku: product.sku,
                  brand: product.brand,
                  description: product.description,
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
                    •{" "}
                    <Link
                      href={`/motosiklet/${motoSlug(f.motorcycle.brand)}/${motoSlug(f.motorcycle.model)}`}
                      className="hover:text-brand-yellow hover:underline"
                    >
                      {f.motorcycle.brand} {f.motorcycle.model}
                    </Link>{" "}
                    ({f.motorcycle.year})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <ReviewSection productId={product.id} />
    </div>
    </>
  );
}
