import type { Metadata } from "next";
import { InfoPageHero, InfoCard } from "@/components/InfoPageHero";
import { SITE } from "@/config/site";
import { buildPageMetadata } from "@/lib/page-meta";
import { getSettings, st } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/hakkimizda", {
    title: "Hakkımızda",
    description: `${SITE.name} - Küçükçekmece İnönü Mahallesi'nde 10+ yıllık tecrübeyle motosiklet yedek parça, aksesuar ve servis.`,
  });
}

export default async function HakkimizdaPage() {
  const bag = await getSettings([
    "about_stat1_num", "about_stat1_desc",
    "about_stat2_num", "about_stat2_desc",
    "about_stat3_num", "about_stat3_desc",
    "about_story",
    "about_mission",
    "about_vision",
  ]);

  const stat1Num  = st(bag, "about_stat1_num",  "10+");
  const stat1Desc = st(bag, "about_stat1_desc", "Yıllık tecrübe");
  const stat2Num  = st(bag, "about_stat2_num",  "500+");
  const stat2Desc = st(bag, "about_stat2_desc", "Stoktaki ürün");
  const stat3Num  = st(bag, "about_stat3_num",  "1.500+");
  const stat3Desc = st(bag, "about_stat3_desc", "Memnun müşteri");

  const storyRaw = st(bag, "about_story",
    `${SITE.name}, Küçükçekmece İnönü Mahallesi'nde küçük bir tamirhane olarak başladı. Kuruluşumuzdan bugüne, motosiklet sürücülerinin güvenle yola çıkması için tek bir prensibimiz var: doğru parça, dürüst hizmet.\n\nBugün hem fiziksel mağazamızdan hem de online platformumuzdan yedek parça, aksesuar ve servis hizmeti sunuyoruz.`
  );
  // "\n\n" → iki paragraf
  const storyParagraphs = storyRaw.split(/\n\n+/);

  const mission = st(bag, "about_mission",
    "Her motosiklet sürücüsünün, motoruna güvenle binebilmesi için kaliteli parça ve uzman serviste uygun fiyat sunmak."
  );
  const vision = st(bag, "about_vision",
    "Türkiye'nin motosiklet camiasında akla ilk gelen dijital ve fiziksel destek noktası olmak."
  );

  return (
    <>
      <InfoPageHero
        eyebrow="Hakkımızda"
        title={<>Motosikletin <span className="text-gradient-gold">galaksisi</span></>}
        description="Küçükçekmece'de 10+ yıldır motosiklet tutkunlarına hizmet veriyoruz. Orijinal parça, uzman servis, dürüst fiyat — tek çatı altında."
      />

      <div className="mx-auto max-w-5xl space-y-6 px-6 py-14">
        <div className="grid gap-4 md:grid-cols-3">
          <Stat title={stat1Num} desc={stat1Desc} />
          <Stat title={stat2Num} desc={stat2Desc} />
          <Stat title={stat3Num} desc={stat3Desc} />
        </div>

        <InfoCard title="Hikayemiz">
          {storyParagraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </InfoCard>

        <div className="grid gap-5 md:grid-cols-2">
          <InfoCard title="Misyonumuz"><p>{mission}</p></InfoCard>
          <InfoCard title="Vizyonumuz"><p>{vision}</p></InfoCard>
        </div>

        <InfoCard title="Değerlerimiz">
          <ul className="ml-5 list-disc space-y-1.5 text-white/70">
            <li><strong className="text-white">Dürüstlük:</strong> İhtiyaç olmayan işi yazmıyor, gereken parçayı önermekten geri durmuyoruz.</li>
            <li><strong className="text-white">Uzmanlık:</strong> Her usta en az 5 yıllık tecrübeye sahip — sertifikalı eğitimlerle güncel kalıyor.</li>
            <li><strong className="text-white">Şeffaflık:</strong> Fiyat, teslimat süresi, iade koşulları açık ve net.</li>
            <li><strong className="text-white">Hız:</strong> Aynı gün kargo, hızlı servis, anlık WhatsApp desteği.</li>
          </ul>
        </InfoCard>
      </div>
    </>
  );
}

function Stat({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-brand-yellow/8 via-white/[0.02] to-transparent p-6 text-center backdrop-blur-md">
      <div className="text-3xl font-bold text-gradient-gold">{title}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-white/55">{desc}</div>
    </div>
  );
}
