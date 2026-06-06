import type { Metadata } from "next";
import { SITE } from "@/config/site";
import { buildPageMetadata } from "@/lib/page-meta";
import {
  LegalPage,
  LegalSection,
  LegalList,
} from "@/components/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/gizlilik-politikasi", {
    title: "Gizlilik Politikası — Galaksi Motor",
    description:
      "Galaksi Motor gizlilik politikası: kişisel verilerin toplanma, kullanım ve koruma esasları.",
  });
}

const FULL_ADDRESS = `${SITE.address.line}, ${SITE.address.district} / ${SITE.address.city}`;

export default function GizlilikPolitikasiPage() {
  return (
    <LegalPage
      eyebrow="Gizlilik Politikası"
      title={
        <>
          Gizlilik <span className="text-gradient-gold">Politikası</span>
        </>
      }
      description="Hangi bilgileri topluyoruz, nasıl kullanıyoruz ve nasıl koruyoruz?"
      updatedAt="Mayıs 2026"
    >
      <LegalSection number="1" title="Giriş">
        <p>
          {SITE.name} olarak, web sitemizi ziyaret eden ve hizmetlerimizden
          yararlanan kullanıcılarımızın gizliliğine önem veriyoruz. İşbu
          Gizlilik Politikası; <a href={SITE.url}>{SITE.url}</a> üzerinden
          toplanan kişisel verilerin nasıl işlendiğini, hukuki dayanaklarını
          ve haklarınızı açıklamaktadır.
        </p>
        <p>
          Detaylı KVKK aydınlatma metnimiz için{" "}
          <a href="/kvkk">KVKK Aydınlatma Metni</a> sayfamızı inceleyebilirsiniz.
        </p>
      </LegalSection>

      <LegalSection number="2" title="Topladığımız Bilgiler">
        <p>Aşağıdaki kategorilerde veri topluyoruz:</p>
        <LegalList
          items={[
            <>
              <strong>Hesap bilgileri:</strong> Ad, soyad, e-posta, şifre
              (yalnızca hash'li olarak), telefon
            </>,
            <>
              <strong>Sipariş bilgileri:</strong> Teslimat / fatura adresi,
              T.C. kimlik numarası (sadece e-fatura için), sipariş geçmişi
            </>,
            <>
              <strong>Ödeme bilgileri:</strong> Kart bilgileri{" "}
              <strong>tarafımıza ulaşmaz</strong>; doğrudan iyzico ile şifreli
              kanaldan banka altyapısında işlenir
            </>,
            <>
              <strong>Otomatik toplanan veriler:</strong> IP adresi, tarayıcı
              türü, ziyaret zamanı, işletim sistemi, çerez kimliği
            </>,
            <>
              <strong>İletişim formu:</strong> Adınız, e-posta, telefon
              (opsiyonel), mesaj içeriği
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection number="3" title="Verilerin Kullanım Amaçları">
        <LegalList
          items={[
            "Sipariş ve hizmet süreçlerinin yürütülmesi",
            "Hesap güvenliği ve oturum yönetimi",
            "Müşteri destek ve şikayet yönetimi",
            "Yasal yükümlülüklerin yerine getirilmesi (fatura, vergi)",
            "Site performansının analizi ve iyileştirilmesi",
            "Açık rıza halinde pazarlama ve kampanya bilgilendirmesi",
          ]}
        />
      </LegalSection>

      <LegalSection number="4" title="Çerez (Cookie) Politikası">
        <p>
          Sitemizde işlevsellik, analitik ve oturum yönetimi amacıyla
          çerezler kullanılmaktadır. Bu çerezler:
        </p>
        <LegalList
          items={[
            <>
              <strong>Zorunlu çerezler:</strong> Oturum, sepet ve ödeme
              akışı için (rıza gerektirmez)
            </>,
            <>
              <strong>Tercih çerezleri:</strong> Garaj seçimi, dil ve tema
              tercihi
            </>,
            <>
              <strong>Analitik çerezler:</strong> Site trafiği ve etkileşim
              istatistikleri (anonimleştirilmiş)
            </>,
          ]}
        />
        <p>
          Tarayıcınızdan çerez ayarlarınızı dilediğiniz zaman değiştirebilir
          veya çerezleri silebilirsiniz; bu durumda bazı işlevler düzgün
          çalışmayabilir.
        </p>
      </LegalSection>

      <LegalSection number="5" title="Veri Güvenliği">
        <p>
          Kişisel verilerinizin güvenliği için aşağıdaki teknik ve idari
          tedbirleri uyguluyoruz:
        </p>
        <LegalList
          items={[
            "Tüm veri trafiği TLS/SSL şifreleme ile korunur (HTTPS)",
            "Şifreler bcrypt ile hash'lenerek saklanır, asla düz metin tutulmaz",
            "Ödeme bilgileri PCI-DSS uyumlu iyzico altyapısında işlenir",
            "Veritabanı erişimleri rol bazlı yetkilendirme ile sınırlıdır",
            "Periyodik yedekleme ve güvenlik denetimleri yapılmaktadır",
            "Tüm admin işlemleri Audit Log'a kaydedilmektedir",
          ]}
        />
      </LegalSection>

      <LegalSection number="6" title="Üçüncü Taraflar">
        <p>
          Hizmet sunabilmek için aşağıdaki güvenilir hizmet sağlayıcılarla
          çalışıyoruz:
        </p>
        <LegalList
          items={[
            "iyzico Ödeme Hizmetleri A.Ş. (ödeme altyapısı)",
            "Anlaşmalı kargo şirketleri (teslimat)",
            "E-fatura/e-arşiv entegratörleri (mali belgelendirme)",
            "Sunucu ve barındırma hizmet sağlayıcıları (Türkiye merkezli)",
          ]}
        />
        <p>
          Bu üçüncü taraflar, yalnızca hizmet sunumu için gerekli olan
          minimum veriye erişebilir ve verilerinizi başka hiçbir amaçla
          kullanamaz.
        </p>
      </LegalSection>

      <LegalSection number="7" title="Çocukların Gizliliği">
        <p>
          Hizmetlerimiz 18 yaş altı kullanıcılara yönelik değildir. 18 yaş
          altı bir kullanıcının veri girdiğini fark edersek, bu veriler
          sistemden silinir.
        </p>
      </LegalSection>

      <LegalSection number="8" title="Politika Değişiklikleri">
        <p>
          İşbu Gizlilik Politikası ihtiyaca göre güncellenebilir.
          Güncelleme tarihinin yer aldığı sürüm her zaman bu sayfada
          yayımlanır. Önemli değişikliklerde sizi e-posta ile
          bilgilendiririz.
        </p>
      </LegalSection>

      <LegalSection number="9" title="İletişim">
        <p>
          Gizlilik politikamız hakkındaki sorularınız için:
        </p>
        <LegalList
          items={[
            <>
              {SITE.name} — {FULL_ADDRESS}
            </>,
            <>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </>,
            <>
              <strong>{SITE.phone}</strong>
            </>,
          ]}
        />
      </LegalSection>
    </LegalPage>
  );
}
