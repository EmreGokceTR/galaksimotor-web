import type { Metadata } from "next";
import { SITE } from "@/config/site";
import { buildPageMetadata } from "@/lib/page-meta";
import {
  LegalPage,
  LegalSection,
  LegalList,
  LegalSubheading,
} from "@/components/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/kvkk", {
    title: "KVKK Aydınlatma Metni — Galaksi Motor",
    description:
      "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında Galaksi Motor müşteri aydınlatma metni.",
  });
}

const FULL_ADDRESS = `${SITE.address.line}, ${SITE.address.district} / ${SITE.address.city}`;

export default function KvkkPage() {
  return (
    <LegalPage
      eyebrow="KVKK Aydınlatma Metni"
      title={
        <>
          Kişisel Verilerin{" "}
          <span className="text-gradient-gold">Korunması</span>
        </>
      }
      description="6698 sayılı KVKK kapsamında veri işleme amacımız, hukuki dayanak ve haklarınız."
      updatedAt="Mayıs 2026"
    >
      <LegalSection number="1" title="Veri Sorumlusu">
        <p>
          <strong>{SITE.name}</strong> (&ldquo;Şirket&rdquo;), 6698 sayılı
          Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;) kapsamında
          veri sorumlusu sıfatıyla hareket etmektedir.
        </p>
        <LegalList
          items={[
            <>
              <strong>Unvan:</strong> {SITE.name}
            </>,
            <>
              <strong>Adres:</strong> {FULL_ADDRESS}
            </>,
            <>
              <strong>Telefon:</strong> {SITE.phone}
            </>,
            <>
              <strong>E-posta:</strong>{" "}
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection number="2" title="İşlenen Kişisel Veriler">
        <p>
          {SITE.name} olarak; ürün ve hizmet sunumumuzun gerektirdiği ölçüde
          aşağıdaki kategorilerde kişisel verilerinizi işliyoruz:
        </p>
        <LegalList
          items={[
            <>
              <strong>Kimlik bilgileri:</strong> Ad, soyad, T.C. kimlik numarası
              (sadece e-fatura/e-arşiv için)
            </>,
            <>
              <strong>İletişim bilgileri:</strong> Telefon, e-posta, teslimat ve
              fatura adresi
            </>,
            <>
              <strong>Müşteri işlem bilgileri:</strong> Sipariş geçmişi,
              tercih ettiğiniz ürünler, randevu kayıtları
            </>,
            <>
              <strong>Finansal bilgiler:</strong> Ödeme tutarı (kart bilgileri
              tarafımıza ulaşmaz, doğrudan iyzico/banka altyapısında işlenir)
            </>,
            <>
              <strong>İşlem güvenliği bilgileri:</strong> IP adresi, oturum
              bilgisi, kullanıcı adı/şifre (hash'li)
            </>,
            <>
              <strong>Pazarlama bilgileri:</strong> Çerez ve analitik verileri
              (yalnızca açık rıza ile)
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection number="3" title="İşleme Amaçları ve Hukuki Sebepler">
        <p>
          Kişisel verileriniz aşağıdaki amaçlar ve KVKK md. 5/2 ile md. 6/3
          kapsamındaki hukuki sebeplerle işlenmektedir:
        </p>
        <LegalList
          items={[
            "Sipariş, satış ve teslimat süreçlerinin yürütülmesi",
            "Servis randevularının planlanması ve uygulanması",
            "Yasal zorunluluk gereği fatura ve belge düzenlenmesi (VUK, e-fatura)",
            "Mesafeli satış sözleşmesinden doğan yükümlülüklerin yerine getirilmesi",
            "Müşteri memnuniyeti, talep ve şikayet yönetimi",
            "Bilgi güvenliği süreçleri ve dolandırıcılık önleme",
            "Açık rıza varsa pazarlama ve kampanya bilgilendirmeleri",
          ]}
        />
      </LegalSection>

      <LegalSection number="4" title="Verilerin Aktarımı">
        <p>
          Kişisel verileriniz, hukuki yükümlülüklerin yerine getirilmesi
          ve hizmetin sunulması amacıyla aşağıdaki üçüncü taraflara
          aktarılabilir:
        </p>
        <LegalList
          items={[
            "Ödeme hizmet sağlayıcısı (iyzico Ödeme Hizmetleri A.Ş.)",
            "Kargo ve lojistik şirketleri (yalnızca teslimat için gerekli bilgiler)",
            "E-fatura/e-arşiv mali müşavirlik ve entegratör hizmetleri",
            "Yetkili kamu kurum ve kuruluşları (yasal talep halinde)",
            "Yurt içi sunucu ve barındırma hizmet sağlayıcıları",
          ]}
        />
        <p>
          Kişisel verileriniz ticari amaçla üçüncü kişilere satılmamakta veya
          devredilmemektedir.
        </p>
      </LegalSection>

      <LegalSection number="5" title="Saklama Süresi">
        <p>
          Kişisel verileriniz; ilgili mevzuatta öngörülen veya işleme
          amacının gerektirdiği süre boyunca saklanır. Bu süre sonunda veriler
          KVKK md. 7 uyarınca silinir, yok edilir veya anonim hale getirilir.
          Vergi Usul Kanunu kapsamındaki belgeler 5 yıl, ticari defterler 10
          yıl saklanır.
        </p>
      </LegalSection>

      <LegalSection number="6" title="Haklarınız (KVKK md. 11)">
        <p>
          Veri sorumlusuna başvurarak aşağıdaki haklarınızı kullanabilirsiniz:
        </p>
        <LegalList
          items={[
            "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
            "İşlenmişse buna ilişkin bilgi talep etme",
            "İşleme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme",
            "Yurt içi/yurt dışı aktarıldığı üçüncü kişileri bilme",
            "Eksik veya yanlış işlenmiş ise düzeltilmesini isteme",
            "KVKK md. 7'de öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme",
            "Otomatik sistemler ile yapılan analiz sonucu aleyhinize bir sonuç doğarsa itiraz etme",
            "Kanuna aykırı işlem nedeniyle zarara uğramanız halinde tazminat talep etme",
          ]}
        />
      </LegalSection>

      <LegalSection number="7" title="Başvuru Yöntemi">
        <p>
          Yukarıdaki haklarınıza ilişkin başvurularınızı; kimliğinizi
          doğrulayıcı belgelerle birlikte:
        </p>
        <LegalList
          items={[
            <>
              <strong>Yazılı olarak:</strong> {FULL_ADDRESS}
            </>,
            <>
              <strong>E-posta ile:</strong>{" "}
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </>,
          ]}
        />
        <p>
          adresine iletebilirsiniz. Başvurunuza en geç 30 gün içinde,
          ücretsiz olarak (Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında
          Tebliğ kapsamındaki istisnalar saklı kalmak üzere) yanıt verilir.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
