import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * TÜM ayarları tek seferde DB'den çek + Next.js cache'inde tut.
 * Cache TTL: 1 saat. Admin "ayarlar"ı kaydederken `revalidateTag('site-settings')` ile yeniler.
 * Bu fonksiyon "deduplikasyon + persistente cache" sağlar — her render'da DB'ye gitmez.
 */
/**
 * Ayarları DB'den oku. Geçici bağlantı hatalarına (özellikle build sırasında
 * Supabase transaction pooler `connection_limit=1` altında yoğun eşzamanlı
 * statik üretimde görülebilen anlık kopmalar) karşı dayanıklı: 3 kez dener,
 * yine de başarısız olursa BOŞ döner. Tüm tüketiciler `st(bag, key, varsayılan)`
 * kullandığı için boş sonuç sayfayı çökertmez — yalnızca varsayılanlara düşer.
 */
async function loadAllSettings(): Promise<Record<string, string>> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const rows = await prisma.siteSetting.findMany({
        select: { key: true, value: true },
      });
      return Object.fromEntries(rows.map((r) => [r.key, r.value]));
    } catch (e) {
      if (attempt === 3) {
        console.warn(
          "[site-settings] DB'den okunamadı, varsayılanlara düşülüyor:",
          e instanceof Error ? e.message : e
        );
        return {};
      }
      // Kısa artan bekleme — pooler'ın toparlanmasına izin ver
      await new Promise((r) => setTimeout(r, 150 * attempt));
    }
  }
  return {};
}

const fetchAllSettingsCached = unstable_cache(loadAllSettings, ["site-settings-all"], {
  revalidate: 3600,
  tags: ["site-settings"],
});

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
