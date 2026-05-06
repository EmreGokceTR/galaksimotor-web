import type { Metadata } from "next";
import { InfoPageHero, InfoCard } from "@/components/InfoPageHero";
import { SITE } from "@/config/site";
import { buildPageMetadata } from "@/lib/page-meta";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/gizlilik", {
    title: "Gizlilik Politikası - Galaksi Motor",
    description:
      "Galaksi Motor gizlilik politikası, KVKK aydınlatma metni ve veri sahibi hakları.",
  });
}

export default function GizlilikPage() {
  return (
    <>
      <InfoPageHero
        eyebrow="Gizlilik"
        title={
          <>
            Verin <span className="text-gradient-gold">güvende</span>
          </>
        }
        description="Kişisel verilerini KVKK çerçevesinde işliyor, üçüncü taraflarla paylaşmıyoruz."
      />

      <div className="mx-auto max-w-5xl space-y-6 px-6 py-14">
        <InfoCard title="Topladığımız Veriler">
          <ul className="ml-5 list-disc space-y-1 text-white/70">
            <li>Ad, soyad, telefon, e-posta (sipariş ve iletişim için)</li>
            <li>Teslimat adresi (sadece kargo amaçlı)</li>
            <li>
              Sipariş geçmişi (hesabım sayfasında görüntüleyebilmen için)
            </li>
            <li>Site içi gezinti (anonim, performans iyileştirme amaçlı)</li>
          </ul>
        </InfoCard>

        <InfoCard title="Verileri Nasıl Kullanırız?">
          <p>
            Toplanan veriler yalnızca aşağıdaki amaçlarla kullanılır:
          </p>
          <ul className="ml-5 list-disc space-y-1 text-white/70">
            <li>Siparişlerin işlenmesi ve teslimatı</li>
            <li>Servis randevu yönetimi</li>
            <li>Müşteri desteği ve iletişim</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi (fatura vb.)</li>
          </ul>
          <p className="mt-2">
            Verilerin pazarlama amacıyla üçüncü taraflarla{" "}
            <strong>paylaşılmaz</strong>.
          </p>
        </InfoCard>

        <InfoCard title="Çerezler (Cookies)">
          <p>
            Site, oturum yönetimi ve sepet hatırlama gibi temel işlevler için
            zorunlu çerezler kullanır. Üçüncü taraf izleme çerezi
            kullanmıyoruz.
          </p>
        </InfoCard>

        <InfoCard title="Haklarınız">
          <p>
            KVKK gereği verilerinin silinmesini, düzeltilmesini veya tamamını
            talep etme hakkına sahipsin. Talebini{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="text-brand-yellow underline"
            >
              {SITE.email}
            </a>{" "}
            adresine iletebilirsin — 30 gün içinde dönüş yapılır.
          </p>
        </InfoCard>
      </div>
    </>
  );
}
