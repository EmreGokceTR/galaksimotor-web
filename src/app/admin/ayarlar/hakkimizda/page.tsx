import { requireAdmin } from "@/lib/admin";
import { getSettings, st } from "@/lib/site-settings";
import { HakkimizdaEditor } from "./HakkimizdaEditor";

export default async function HakkimizdaSettingsPage() {
  await requireAdmin();

  const bag = await getSettings([
    "about_stat1_num", "about_stat1_desc",
    "about_stat2_num", "about_stat2_desc",
    "about_stat3_num", "about_stat3_desc",
    "about_story",
    "about_mission",
    "about_vision",
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Hakkımızda İçeriği</h1>
        <p className="mt-1 text-sm text-white/50">
          Hakkımızda sayfasındaki metinleri buradan düzenleyebilirsiniz.
          Değişiklikler anında siteye yansır.
        </p>
      </header>

      <HakkimizdaEditor
        stat1_num={st(bag, "about_stat1_num", "10+")}
        stat1_desc={st(bag, "about_stat1_desc", "Yıllık tecrübe")}
        stat2_num={st(bag, "about_stat2_num", "500+")}
        stat2_desc={st(bag, "about_stat2_desc", "Stoktaki ürün")}
        stat3_num={st(bag, "about_stat3_num", "1.500+")}
        stat3_desc={st(bag, "about_stat3_desc", "Memnun müşteri")}
        story={st(bag, "about_story",
          `${process.env.NEXT_PUBLIC_SITE_NAME ?? "Galaksi Motor"}, Küçükçekmece İnönü Mahallesi'nde küçük bir tamirhane olarak başladı. Kuruluşumuzdan bugüne, motosiklet sürücülerinin güvenle yola çıkması için tek bir prensibimiz var: doğru parça, dürüst hizmet.\n\nBugün hem fiziksel mağazamızdan hem de online platformumuzdan yedek parça, aksesuar ve servis hizmeti sunuyoruz.`
        )}
        mission={st(bag, "about_mission",
          "Her motosiklet sürücüsünün, motoruna güvenle binebilmesi için kaliteli parça ve uzman serviste uygun fiyat sunmak."
        )}
        vision={st(bag, "about_vision",
          "Türkiye'nin motosiklet camiasında akla ilk gelen dijital ve fiziksel destek noktası olmak."
        )}
      />
    </div>
  );
}
