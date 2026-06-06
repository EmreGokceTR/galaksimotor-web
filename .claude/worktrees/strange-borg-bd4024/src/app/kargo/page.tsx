import type { Metadata } from "next";
import { InfoPageHero, InfoCard } from "@/components/InfoPageHero";
import { buildPageMetadata } from "@/lib/page-meta";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/kargo", {
    title: "Kargo & Teslimat - Galaksi Motor",
    description:
      "Kargo süreleri, ücretsiz kargo şartları ve teslimat detayları.",
  });
}

export default function KargoPage() {
  return (
    <>
      <InfoPageHero
        eyebrow="Kargo & Teslimat"
        title={
          <>
            Hızlı ve <span className="text-gradient-gold">güvenli teslimat</span>
          </>
        }
        description="Siparişin yola çıktığı andan kapına gelene kadar her adımı şeffaf yönetiyoruz."
      />

      <div className="mx-auto max-w-5xl space-y-6 px-6 py-14">
        <div className="grid gap-5 md:grid-cols-3">
          <Stat title="49,90 ₺" desc="Sabit kargo ücreti" />
          <Stat title="1-3 İş Günü" desc="Ortalama teslimat süresi" />
          <Stat title="Aynı Gün" desc="16:00&apos;a kadar verilen siparişler kargoda" />
        </div>

        <InfoCard title="Teslimat Süreleri">
          <p>
            Stokta olan ürünler hafta içi 16:00&apos;a kadar verilen siparişlerde
            aynı gün kargoya teslim edilir. Cumartesi siparişleri Pazartesi
            günü gönderilir.
          </p>
          <ul className="ml-5 list-disc space-y-1 text-white/70">
            <li>İstanbul içi: 1 iş günü</li>
            <li>Marmara Bölgesi: 1-2 iş günü</li>
            <li>Diğer iller: 2-3 iş günü</li>
          </ul>
        </InfoCard>

        <InfoCard title="Kargo Firması & Takip">
          <p>
            Anlaşmalı kargo firmalarımız: <strong>Aras Kargo</strong> ve{" "}
            <strong>Yurtiçi Kargo</strong>. Sipariş kargoya verildiğinde takip
            numaranız e-posta ve SMS yoluyla iletilir. Takibi{" "}
            <a href="/hesabim/siparislerim" className="text-brand-yellow underline">
              hesabım → siparişlerim
            </a>{" "}
            sayfasından da yapabilirsin.
          </p>
        </InfoCard>

        <InfoCard title="Mağazadan Teslim Alma">
          <p>
            Ödeme adımında <strong>Mağazadan Teslim</strong> seçerek kargo
            ücreti ödemeden ürününü dükkanımızdan alabilirsin. Sipariş hazır
            olduğunda telefonla bilgilendiririz.
          </p>
        </InfoCard>

        <InfoCard title="Hasarlı Teslimat">
          <p>
            Kargonu teslim alırken paketin dış görünümünde bir hasar varsa
            mutlaka tutanak tutturup kargoyu kabul etme. 24 saat içinde bizimle
            iletişime geç — hızlıca yenisi yola çıkar.
          </p>
        </InfoCard>
      </div>
    </>
  );
}

function Stat({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-brand-yellow/8 via-white/[0.02] to-transparent p-6 backdrop-blur-md">
      <div className="text-2xl font-bold text-gradient-gold">{title}</div>
      <div
        className="mt-1 text-xs uppercase tracking-wider text-white/55"
        dangerouslySetInnerHTML={{ __html: desc }}
      />
    </div>
  );
}
