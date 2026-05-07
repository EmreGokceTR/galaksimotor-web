import type { Metadata } from "next";
import { SITE } from "@/config/site";
import { buildPageMetadata } from "@/lib/page-meta";
import {
  LegalPage,
  LegalSection,
  LegalList,
} from "@/components/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/mesafeli-satis-sozlesmesi", {
    title: "Mesafeli Satış Sözleşmesi — Galaksi Motor",
    description:
      "6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği'ne uygun mesafeli satış sözleşmesi.",
  });
}

const FULL_ADDRESS = `${SITE.address.line}, ${SITE.address.district} / ${SITE.address.city}`;

export default function MesafeliSatisPage() {
  return (
    <LegalPage
      eyebrow="Mesafeli Satış Sözleşmesi"
      title={
        <>
          Mesafeli{" "}
          <span className="text-gradient-gold">Satış Sözleşmesi</span>
        </>
      }
      description="Galaksi Motor üzerinden gerçekleştirilen tüm online satışlar bu sözleşme şartlarına tabidir."
      updatedAt="Mayıs 2026"
    >
      <LegalSection number="1" title="Taraflar">
        <p>
          <strong>SATICI</strong>
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
        <p>
          <strong>ALICI</strong>
        </p>
        <p>
          Galaksi Motor web sitesinden sipariş veren ve sipariş onayı sırasında
          adı, adresi, T.C. kimlik numarası ve iletişim bilgileri kayıt
          altına alınan müşteri.
        </p>
      </LegalSection>

      <LegalSection number="2" title="Sözleşmenin Konusu">
        <p>
          İşbu sözleşmenin konusu; Alıcı'nın Satıcı'ya ait{" "}
          <a href={SITE.url}>{SITE.url}</a> internet sitesi üzerinden
          elektronik ortamda siparişini verdiği, sözleşmenin son sayfasında
          (sipariş özetinde) nitelikleri ve satış fiyatı belirtilen ürünün
          satışı ve teslimatı ile ilgili olarak 6502 sayılı Tüketicinin
          Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği
          hükümleri gereğince tarafların hak ve yükümlülüklerinin
          saptanmasıdır.
        </p>
      </LegalSection>

      <LegalSection number="3" title="Sözleşme Konusu Ürün ve Ödeme">
        <p>
          Sözleşmenin konusunu oluşturan ürünlerin türü, miktarı, adedi, satış
          bedeli ve teslimat bilgileri, ödeme adımındaki sipariş özeti
          ekranında ve onay e-postasında yer almaktadır. Tüm fiyatlar Türk
          Lirası (TRY) cinsinden ve KDV dahil olarak gösterilmektedir.
        </p>
        <p>
          Ödeme; <strong>iyzico Ödeme Hizmetleri A.Ş.</strong> altyapısı
          üzerinden, kredi/banka kartı ile 3D Secure protokolü kullanılarak
          yapılır. Kart bilgileri kesinlikle Satıcı'ya iletilmez ve
          saklanmaz.
        </p>
      </LegalSection>

      <LegalSection number="4" title="Teslimat">
        <LegalList
          items={[
            "Ürünler, Alıcı'nın belirttiği teslimat adresine anlaşmalı kargo şirketi aracılığıyla gönderilir.",
            "Teslim süresi, ödeme onayını takiben en fazla 30 (otuz) gündür. Standart ortalama 1-3 iş günüdür.",
            "Kargo ücreti sepet özetinde belirtilir; belirli bir tutarın üzerindeki siparişlerde kargo ücretsizdir.",
            "Mağazadan teslim seçildiğinde adres yerine işyeri ziyareti ile teslimat yapılır.",
            "Teslimat sırasında ürünün ambalajının hasarsız olduğunun kontrolü Alıcı'nın sorumluluğundadır.",
          ]}
        />
      </LegalSection>

      <LegalSection number="5" title="Cayma Hakkı">
        <p>
          Alıcı; sözleşme konusu ürünü teslim aldığı tarihten itibaren{" "}
          <strong>14 (on dört) gün</strong> içinde herhangi bir gerekçe
          göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına
          sahiptir.
        </p>
        <p>
          Cayma hakkının kullanıldığına dair bildirim, 14 günlük süre
          dolmadan açık ve anlaşılır bir şekilde Satıcı'ya yazılı olarak{" "}
          (<a href={`mailto:${SITE.email}`}>{SITE.email}</a>) yöneltilmelidir.
          Bildirimin Satıcı'ya ulaşmasını takiben 10 gün içerisinde ürün
          bedeli, ödeme aracına bağlı olarak Alıcı'ya iade edilir.
        </p>
        <p>
          Detaylı iade prosedürü için{" "}
          <a href="/iptal-iade-kosullari">İptal & İade Koşulları</a>{" "}
          sayfamıza bakınız.
        </p>
      </LegalSection>

      <LegalSection number="6" title="Cayma Hakkının İstisnaları">
        <p>
          Mesafeli Sözleşmeler Yönetmeliği md. 15 uyarınca aşağıdaki
          ürünlerde cayma hakkı kullanılamaz:
        </p>
        <LegalList
          items={[
            "Alıcı'nın özel istekleri veya açıkça onun kişisel ihtiyaçları doğrultusunda hazırlanan, niteliği itibariyle iade edilemeyecek ürünler",
            "Tesliminden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olan; iadesi sağlık ve hijyen açısından uygun olmayan ürünler",
            "Tesliminden sonra başka ürünlerle karışan ve doğası gereği ayrıştırılması mümkün olmayan ürünler",
          ]}
        />
      </LegalSection>

      <LegalSection number="7" title="Genel Hükümler">
        <p>
          İşbu sözleşmeden doğabilecek uyuşmazlıkların çözümünde Tüketici
          Hakem Heyeti ve Tüketici Mahkemeleri yetkilidir. Parasal sınırlar
          her yıl Ticaret Bakanlığı tarafından güncellenir.
        </p>
        <p>
          Alıcı, sipariş verme aşamasında bu sözleşmenin tüm koşullarını ve
          ön bilgilendirme formunu okuyarak elektronik ortamda onayladığını
          kabul eder.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
