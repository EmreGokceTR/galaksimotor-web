import { InfoPageHero, InfoCard } from "@/components/InfoPageHero";
import { SITE } from "@/config/site";

export const metadata = {
  title: "Hakkımızda",
  description: `${SITE.name} - Küçükçekmece İnönü Mahallesi'nde 10+ yıllık tecrübeyle motosiklet yedek parça, aksesuar ve servis.`,
};

export default function HakkimizdaPage() {
  return (
    <>
      <InfoPageHero
        eyebrow="Hakkımızda"
        title={
          <>
            Motosikletin <span className="text-gradient-gold">galaksisi</span>
          </>
        }
        description="Küçükçekmece'de 10+ yıldır motosiklet tutkunlarına hizmet veriyoruz. Orijinal parça, uzman servis, dürüst fiyat — tek çatı altında."
      />

      <div className="mx-auto max-w-5xl space-y-6 px-6 py-14">
        <div className="grid gap-4 md:grid-cols-3">
          <Stat title="10+" desc="Yıllık tecrübe" />
          <Stat title="500+" desc="Stoktaki ürün" />
          <Stat title="1.500+" desc="Memnun müşteri" />
        </div>

        <InfoCard title="Hikayemiz">
          <p>
            {SITE.name}, Küçükçekmece İnönü Mahallesi&apos;nde küçük bir
            tamirhane olarak başladı. Kuruluşumuzdan bugüne, motosiklet
            sürücülerinin güvenle yola çıkması için tek bir prensibimiz var:{" "}
            <strong>doğru parça, dürüst hizmet</strong>.
          </p>
          <p>
            Bugün hem fiziksel mağazamızdan hem de online platformumuzdan
            yedek parça, aksesuar ve servis hizmeti sunuyoruz. CVT kayışları,
            varyatör parçaları, fren balataları, motor yağı, kask ve koruma
            ekipmanlarına kadar geniş ürün yelpazesiyle motorunun ihtiyacı
            olan her şey burada.
          </p>
        </InfoCard>

        <div className="grid gap-5 md:grid-cols-2">
          <InfoCard title="Misyonumuz">
            <p>
              Her motosiklet sürücüsünün, motoruna güvenle binebilmesi için
              kaliteli parça ve uzman serviste <strong>uygun fiyat</strong>{" "}
              sunmak.
            </p>
          </InfoCard>
          <InfoCard title="Vizyonumuz">
            <p>
              Türkiye&apos;nin motosiklet camiasında <strong>akla ilk
              gelen</strong> dijital ve fiziksel destek noktası olmak.
            </p>
          </InfoCard>
        </div>

        <InfoCard title="Değerlerimiz">
          <ul className="ml-5 list-disc space-y-1.5 text-white/70">
            <li>
              <strong className="text-white">Dürüstlük:</strong> İhtiyaç
              olmayan işi yazmıyor, gereken parçayı önermekten geri durmuyoruz.
            </li>
            <li>
              <strong className="text-white">Uzmanlık:</strong> Her usta en az
              5 yıllık tecrübeye sahip — sertifikalı eğitimlerle güncel
              kalıyor.
            </li>
            <li>
              <strong className="text-white">Şeffaflık:</strong> Fiyat,
              teslimat süresi, iade koşulları açık ve net.
            </li>
            <li>
              <strong className="text-white">Hız:</strong> Aynı gün kargo,
              hızlı servis, anlık WhatsApp desteği.
            </li>
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
      <div className="mt-1 text-xs uppercase tracking-wider text-white/55">
        {desc}
      </div>
    </div>
  );
}
