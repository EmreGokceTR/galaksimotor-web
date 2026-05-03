import { InfoPageHero, InfoCard } from "@/components/InfoPageHero";

export const metadata = { title: "İade Koşulları - Galaksi Motor" };

export default function IadePage() {
  return (
    <>
      <InfoPageHero
        eyebrow="İade & Değişim"
        title={
          <>
            Yanlış olduysa <span className="text-gradient-gold">çözeriz</span>
          </>
        }
        description="14 gün içinde, kullanılmamış ürünler için koşulsuz iade hakkın bulunur."
      />

      <div className="mx-auto max-w-5xl space-y-6 px-6 py-14">
        <InfoCard title="Cayma Hakkı (14 Gün)">
          <p>
            Mesafeli Sözleşmeler Yönetmeliği uyarınca, ürünü teslim aldığın
            tarihten itibaren <strong>14 gün</strong> içinde herhangi bir gerekçe
            göstermeden cayma hakkını kullanabilirsin.
          </p>
        </InfoCard>

        <InfoCard title="İade Edilebilir Ürünler">
          <ul className="ml-5 list-disc space-y-1 text-white/70">
            <li>Kullanılmamış, orijinal ambalajı bozulmamış ürünler</li>
            <li>Faturası ve etiketi sağlam olan ürünler</li>
            <li>
              Montaj yapılmamış ve aracına takılmamış mekanik parçalar
            </li>
          </ul>
        </InfoCard>

        <InfoCard title="İade Edilemez Ürünler">
          <ul className="ml-5 list-disc space-y-1 text-white/70">
            <li>Kişiye özel üretilmiş veya boyanmış ürünler</li>
            <li>
              Hijyen kuralları gereği iade alınmayan ürünler (kask iç süngeri,
              eldiven vb.)
            </li>
            <li>Sıvı ürünler (yağ, hidrolik) açıldıktan sonra</li>
          </ul>
        </InfoCard>

        <InfoCard title="İade Süreci">
          <ol className="ml-5 list-decimal space-y-2 text-white/70">
            <li>
              <strong>Talep oluştur:</strong> WhatsApp veya e-posta ile sipariş
              numaranı bildir.
            </li>
            <li>
              <strong>Kargoya ver:</strong> Ürünü orijinal ambalajıyla
              anlaşmalı kargomuza ücretsiz teslim et.
            </li>
            <li>
              <strong>İncelemesi yapılır:</strong> Ürün bize ulaştıktan sonra 3
              iş günü içinde kontrol edilir.
            </li>
            <li>
              <strong>Geri ödeme:</strong> Onaylanan iadelerde ödeme,
              kullandığın yöntemle 5-10 iş günü içinde iade edilir.
            </li>
          </ol>
        </InfoCard>
      </div>
    </>
  );
}
