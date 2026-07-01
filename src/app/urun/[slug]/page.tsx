import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductPurchasePanel } from "@/components/ProductPurchasePanel";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareButton } from "@/components/ShareButton";
import { PriceAlertButton } from "@/components/PriceAlertButton";
import { ReviewSection } from "@/components/ReviewSection";
import { AdminEditButton } from "@/components/AdminEditButton";
import { SITE } from "@/config/site";

type Props = { params: { slug: string } };

// Tüm aktif ürünleri build zamanında statik HTML olarak üretir — sayfa açılışında
// veritabanına gidilmez, edge'den anında servis edilir. Yeni eklenen ürünler
// ilk ziyarette dinamik render edilip ISR ile önbelleğe alınır (dynamicParams=true).
export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return products.map((p) => ({ slug: p.slug }));
}

export const revalidate = 300;
export const dynamicParams = true;

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
      category: { select: { name: true } },
    },
  });
  if (!p) return { title: "Ürün bulunamadı" };
  const title = `${p.name} - ${SITE.name}`;
  // Arama motoru snippet'i sayfada görünen (kısa) açıklamadan bağımsız — marka,
  // kategori, fiyat ve yerel anahtar kelimelerle zenginleştirilmiş, insanlar
  // Google'da ararken doğrudan bu sonucu görsün diye.
  const fmtPrice = Number(p.price).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });
  const description = `${p.name}${p.brand ? ` — ${p.brand} marka` : ""}, ${p.category.name.toLocaleLowerCase("tr")} kategorisinde ${fmtPrice} fiyatına ${SITE.name}'da satışta. Küçükçekmece / İstanbul'dan aynı gün kargo, güvenli ödeme ile hemen satın alın.`;
  const keywords = [p.name, p.brand, p.category.name, "motosiklet yedek parça", "Küçükçekmece motosiklet", SITE.name]
    .filter(Boolean)
    .join(", ");
  const image = p.images[0]?.url;
  return {
    title,
    description,
    keywords,
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
      // Yorumlar rating aggregation için — ayrı sorgu yerine tek round-trip'te
      reviews: { select: { rating: true } },
    },
  });
  if (!product) notFound();

  const reviews = product.reviews;
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
    mpn: product.oemNo ?? product.sku,
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
            {(product.oemNo || product.compatNo) && (
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-white/40">
                {product.oemNo && <span>OEM No: <span className="text-white/60">{product.oemNo}</span></span>}
                {product.compatNo && <span>Muadil No: <span className="text-white/60">{product.compatNo}</span></span>}
              </div>
            )}
          </div>

          <div className="text-3xl font-bold text-brand-yellow">
            {Number(product.price).toLocaleString("tr-TR", {
              style: "currency",
              currency: "TRY",
            })}
          </div>
          {product.stock > 0 ? (
            <div className="rounded bg-green-500/20 px-3 py-1 inline-block text-sm text-green-400">
              Stokta
            </div>
          ) : (
            <div className="rounded bg-red-500/20 px-3 py-1 inline-block text-sm text-red-400">
              Stokta Yok
            </div>
          )}

          {product.description && (
            <p className="text-white/80 leading-relaxed">{product.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <FavoriteButton productId={product.id} variant="pill" />
            <ShareButton
              title={product.name}
              text={`${product.name} — ${SITE.name}`}
              url={`${SITE.url}/urun/${product.slug}`}
            />
            <PriceAlertButton productId={product.id} />
          </div>

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
        </div>
      </div>

      <ReviewSection productId={product.id} />
    </div>
    </>
  );
}
