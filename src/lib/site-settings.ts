import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * TÜM ayarları tek seferde DB'den çek + Next.js cache'inde tut.
 * Cache TTL: 1 saat. Admin "ayarlar"ı kaydederken `revalidateTag('site-settings')` ile yeniler.
 * Bu fonksiyon "deduplikasyon + persistente cache" sağlar — her render'da DB'ye gitmez.
 */
const fetchAllSettingsCached = unstable_cache(
  async (): Promise<Record<string, string>> => {
    const rows = await prisma.siteSetting.findMany({
      select: { key: true, value: true },
    });
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  },
  ["site-settings-all"],
  { revalidate: 3600, tags: ["site-settings"] }
);

/** Verilen key'leri tek sorguda çek (artık cache'li, DB'ye gitmez). */
export async function getSettings(
  keys: string[]
): Promise<Record<string, string>> {
  const all = await fetchAllSettingsCached();
  const result: Record<string, string> = {};
  for (const k of keys) {
    if (all[k] !== undefined) result[k] = all[k];
  }
  return result;
}

/** Bag'den key oku; yoksa fallback döner. */
export function st(
  bag: Record<string, string>,
  key: string,
  fallback: string
): string {
  return bag[key] ?? fallback;
}
