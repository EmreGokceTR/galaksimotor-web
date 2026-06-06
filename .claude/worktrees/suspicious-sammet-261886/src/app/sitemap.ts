import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, blog, motorcycles] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    }),
    prisma.blogPost.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.motorcycleListing.findMany({
      where: { isActive: true },
      select: { id: true, updatedAt: true },
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { path: "", priority: 1.0, freq: "daily" as const },
    { path: "/urunler", priority: 0.9, freq: "daily" as const },
    { path: "/motosikletler", priority: 0.9, freq: "daily" as const },
    { path: "/randevu", priority: 0.8, freq: "weekly" as const },
    { path: "/blog", priority: 0.8, freq: "weekly" as const },
    { path: "/hakkimizda", priority: 0.6, freq: "monthly" as const },
    { path: "/iletisim", priority: 0.7, freq: "monthly" as const },
    { path: "/sss", priority: 0.6, freq: "monthly" as const },
    { path: "/kargo", priority: 0.4, freq: "monthly" as const },
    { path: "/iade", priority: 0.4, freq: "monthly" as const },
    { path: "/gizlilik", priority: 0.3, freq: "yearly" as const },
    { path: "/gizlilik-politikasi", priority: 0.3, freq: "yearly" as const },
    { path: "/kvkk", priority: 0.3, freq: "yearly" as const },
    { path: "/mesafeli-satis-sozlesmesi", priority: 0.3, freq: "yearly" as const },
    { path: "/iptal-iade-kosullari", priority: 0.3, freq: "yearly" as const },
  ].map(({ path, priority, freq }) => ({
    url: `${SITE.url}${path}`,
    lastModified: new Date(),
    changeFrequency: freq,
    priority,
  }));

  return [
    ...staticPages,
    ...products.map((p) => ({
      url: `${SITE.url}/urun/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...categories.map((c) => ({
      url: `${SITE.url}/kategori/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...blog.map((b) => ({
      url: `${SITE.url}/blog/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...motorcycles.map((m) => ({
      url: `${SITE.url}/motosikletler/${m.id}`,
      lastModified: m.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
