import { requireAdmin } from "@/lib/admin";
import { getSettings, st } from "@/lib/site-settings";
import { pathKey } from "@/lib/page-meta";
import { SITE } from "@/config/site";
import { SeoPageRow } from "./SeoPageRow";

const PAGES = [
  {
    path: "/",
    label: "Ana Sayfa",
    defaultTitle: `${SITE.name} - Yedek Parça, Aksesuar ve Servis`,
    defaultDesc: SITE.description,
  },
  {
    path: "/urunler",
    label: "Ürünler Listesi",
    defaultTitle: "Ürünler - Galaksi Motor",
    defaultDesc: "Motosiklet yedek parça, aksesuar ve bakım ürünleri. Orijinal ürünler, hızlı kargo.",
  },
  {
    path: "/motosikletler",
    label: "Motosikletler",
    defaultTitle: "Motosikletler - Galaksi Motor",
    defaultDesc: "Sıfır ve ikinci el motosiklet ilanları. Güvenli alım-satım.",
  },
  {
    path: "/randevu",
    label: "Servis Randevusu",
    defaultTitle: "Servis Randevusu - Galaksi Motor",
    defaultDesc: "Motosikletiniz için online servis randevusu alın — bakım, onarım, kontrol.",
  },
  {
    path: "/blog",
    label: "Blog & Rehber",
    defaultTitle: "Blog & Rehber - Galaksi Motor",
    defaultDesc: "Motosiklet bakım ipuçları, ürün rehberleri ve sürüş tavsiyeleri.",
  },
  {
    path: "/hakkimizda",
    label: "Hakkımızda",
    defaultTitle: "Hakkımızda - Galaksi Motor",
    defaultDesc: "Galaksi Motor hakkında bilgi edinin. 10+ yıllık tecrübe, uzman ekip.",
  },
  {
    path: "/iletisim",
    label: "İletişim",
    defaultTitle: "İletişim - Galaksi Motor",
    defaultDesc: "Galaksi Motor iletişim bilgileri. Küçükçekmece, İstanbul.",
  },
  {
    path: "/sss",
    label: "Sıkça Sorulan Sorular",
    defaultTitle: "SSS - Galaksi Motor",
    defaultDesc: "Sıkça sorulan sorular ve cevapları.",
  },
  {
    path: "/kvkk",
    label: "KVKK",
    defaultTitle: "KVKK Aydınlatma Metni - Galaksi Motor",
    defaultDesc: "Kişisel verilerin korunması kanunu (KVKK) aydınlatma metni.",
  },
  {
    path: "/gizlilik-politikasi",
    label: "Gizlilik Politikası",
    defaultTitle: "Gizlilik Politikası - Galaksi Motor",
    defaultDesc: "Galaksi Motor gizlilik politikası ve veri koruma bilgileri.",
  },
  {
    path: "/mesafeli-satis-sozlesmesi",
    label: "Mesafeli Satış Sözleşmesi",
    defaultTitle: "Mesafeli Satış Sözleşmesi - Galaksi Motor",
    defaultDesc: "Galaksi Motor mesafeli satış sözleşmesi.",
  },
  {
    path: "/iptal-iade-kosullari",
    label: "İptal & İade Koşulları",
    defaultTitle: "İptal ve İade Koşulları - Galaksi Motor",
    defaultDesc: "Galaksi Motor ürün iade ve iptal politikası.",
  },
  {
    path: "/kargo",
    label: "Kargo Bilgileri",
    defaultTitle: "Kargo Bilgileri - Galaksi Motor",
    defaultDesc: "Kargo süreleri, ücretleri ve teslimat bilgileri.",
  },
];

export default async function SeoSettingsPage() {
  await requireAdmin();

  const keys = PAGES.flatMap((p) => {
    const k = pathKey(p.path);
    return [`meta_title_${k}`, `meta_desc_${k}`];
  });

  const bag = await getSettings(keys);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">SEO Meta Bilgileri</h1>
        <p className="mt-1 text-sm text-white/50">
          Her sayfanın arama motoru başlığını ve açıklamasını buradan düzenleyebilirsin.
          Boş bırakılan alanlar varsayılan değerleri kullanır.
        </p>
      </header>

      <ul className="space-y-3">
        {PAGES.map((p) => {
          const k = pathKey(p.path);
          return (
            <SeoPageRow
              key={p.path}
              path={p.path}
              label={p.label}
              currentTitle={st(bag, `meta_title_${k}`, "")}
              currentDesc={st(bag, `meta_desc_${k}`, "")}
              defaultTitle={p.defaultTitle}
              defaultDesc={p.defaultDesc}
            />
          );
        })}
      </ul>
    </div>
  );
}
