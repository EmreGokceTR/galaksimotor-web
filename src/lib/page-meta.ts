import type { Metadata } from "next";
import { getSettings, st } from "@/lib/site-settings";
import { SITE } from "@/config/site";

/**
 * Path → siteSetting key dönüşümü.
 *   "/"           → "home"
 *   "/urunler"    → "urunler"
 *   "/admin/blog" → "admin_blog"
 *   "/blog/[slug]" → "blog_slug"
 */
export function pathKey(path: string): string {
  if (!path || path === "/") return "home";
  return path
    .replace(/^\/+|\/+$/g, "")
    .replace(/\[([^\]]+)\]/g, "$1")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .toLowerCase();
}

export type PageMetaFallback = {
  title: string;
  description: string;
};

/** siteSetting'dan dinamik title/desc; yoksa fallback. */
export async function getPageMeta(
  path: string,
  fallback: PageMetaFallback
): Promise<PageMetaFallback> {
  const k = pathKey(path);
  const titleKey = `meta_title_${k}`;
  const descKey = `meta_desc_${k}`;
  const bag = await getSettings([titleKey, descKey]);
  return {
    title: st(bag, titleKey, fallback.title),
    description: st(bag, descKey, fallback.description),
  };
}

/** Sayfa-özel Metadata oluşturur (generateMetadata içinden çağırılabilir). */
export async function buildPageMetadata(
  path: string,
  fallback: PageMetaFallback
): Promise<Metadata> {
  const meta = await getPageMeta(path, fallback);
  const canonicalUrl = `${SITE.url}${path === "/" ? "" : path}`;
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: canonicalUrl,
      siteName: SITE.name,
      title: meta.title,
      description: meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}
