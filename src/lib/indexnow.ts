/**
 * IndexNow protokolü — Bing, Yandex, Seznam, Naver gibi arama motorlarına
 * URL güncellemelerini anında bildirir. Google IndexNow desteklemez ama
 * Bing'in payı düşük değil + Yandex Rusya/CIS için önemli.
 *
 * Çalışma:
 *  1) public/{key}.txt dosyası key'i içerir (Bing/Yandex bu URL'i kontrol eder)
 *  2) URL bildirimi için tek POST: api.indexnow.org
 *  3) Tüm motorlar tek istekle haberdar olur (IndexNow consortium)
 *
 * Kullanım:
 *  await pingIndexNow(["https://galaksimotor.com/urun/yeni-urun-slug"])
 *
 * EditableWrapper save sonrası veya admin'in ürün eklemesi sonrası çağrılabilir.
 * Hata kritik değil — sessizce loglanır, ana akışı bozmaz.
 */

const INDEXNOW_KEY = "e16d2297d4cca7f2b5dff9e06ac76a18";
const SITE_HOST = "galaksimotor.com";
const KEY_LOCATION = `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`;

export async function pingIndexNow(urls: string[]): Promise<void> {
  if (!urls.length) return;

  // Tek URL → GET, çoklu URL → POST (IndexNow spec)
  if (urls.length === 1) {
    const params = new URLSearchParams({
      url: urls[0],
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
    });
    try {
      await fetch(`https://api.indexnow.org/indexnow?${params}`, {
        method: "GET",
        // 5 saniye timeout — arama motoru yanıt vermezse ana akış beklemesin
        signal: AbortSignal.timeout(5000),
      });
    } catch (e) {
      console.warn("[IndexNow] tek URL bildirimi başarısız:", e);
    }
    return;
  }

  // Çoklu URL — toplu bildirim
  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: SITE_HOST,
        key: INDEXNOW_KEY,
        keyLocation: KEY_LOCATION,
        urlList: urls,
      }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (e) {
    console.warn("[IndexNow] toplu bildirim başarısız:", e);
  }
}
