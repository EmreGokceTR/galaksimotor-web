import type { Metadata } from "next";
import { SITE } from "@/config/site";
import { buildPageMetadata } from "@/lib/page-meta";
import {
  LegalPage,
  LegalSection,
  LegalList,
} from "@/components/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/iptal-iade-kosullari", {
    title: "İptal ve İade Koşulları — Galaksi Motor",
    description:
      "Sipariş iptali, ürün iadesi, değişim ve para iadesi süreçleri.",
  });
}

const FULL_ADDRESS = `${SITE.address.line}, ${SITE.address.district} / ${SITE.address.city}`;

export default function IptalIadeKosullariPage() {
  return (
    <LegalPage
      eyebrow="İptal & İade Koşulları"
      title={
        <>
          İptal ve <span className="text-gradient-gold">İade Koşulları</span>
        </>
      }
      description="6502 sayılı Tüketicinin Korunması Hakkında Kanun çerçevesinde iptal, iade ve değişim süreçleri."
      updatedAt="Mayıs 2026"
    >
      <LegalSection number="1" title="Sipariş İptali">
        <p>
          Henüz <strong>kargoya verilmemiş</strong> siparişler için iptal
          talebinizi dilediğiniz zaman aşağıdaki kanallardan iletebilirsiniz:
        </p>
        <LegalList
          items={[
            <>
              E-posta:{" "}
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </>,
            <>
              Telefon: <strong>{SITE.phone}</strong>
            </>,
            <>
              Hesabım &gt; Siparişlerim ekranından sipariş detayı içinden
            </>,
          ]}
        />
        <p>
          İptal sonrasında ödeme tutarı, ödeme yaptığınız karta 3-10 iş
          günü içinde iade edilir. İade süresi banka politikalarına
          bağlıdır.
        </p>
      </LegalSection>

      <LegalSection number="2" title="Cayma Hakkı (14 Gün İade)">
        <p>
          Mesafeli Sözleşmeler Yönetmeliği uyarınca; ürünü teslim aldığınız
          tarihten itibaren <strong>14 (on dört) gün</strong> içerisinde
          herhangi bir gerekçe göstermeden iade hakkınız bulunmaktadır.
        </p>
        <p>İade kabul şartları:</p>
        <LegalList
          items={[
            "Ürün kullanılmamış, ambalajı açılmamış ve orijinal hâlinde olmalıdır.",
            "Hijyen kuralları gereği iadesi mümkün olmayan ürünler hariçtir (ör: kişisel bakım, iç kıyafet niteliğindeki ürünler).",
            "Fatura veya sipariş bilgileri ürünle birlikte gönderilmelidir.",
            "Aksesuarlar ve hediyeler eksiksiz olmalıdır.",
          ]}
        />
      </LegalSection>

      <LegalSection number="3" title="İade Süreci — Adım Adım">
        <LegalList
          items={[
            "1. E-posta yoluyla iade talebinizi iletin (sipariş numarası ve nedenini belirterek).",
            "2. Tarafımızca onay e-postası gönderilir, anlaşmalı kargo şirketi ile iade kodu paylaşılır.",
            "3. Ürünü orijinal ambalajında ve faturasıyla birlikte yukarıda belirtilen kargo ile gönderin.",
            "4. Ürün depomuza ulaştığında 1-3 iş günü içinde kontrol edilir.",
            "5. İade onaylanırsa ödeme tutarı, ödeme yaptığınız karta iade edilir (banka süresine bağlı 3-10 iş günü).",
          ]}
        />
        <p>
          <strong>İade adresi:</strong> {SITE.name} — {FULL_ADDRESS}
        </p>
      </LegalSection>

      <LegalSection number="4" title="Değişim">
        <p>
          Beden, renk veya model değişikliği talebinde de iade prosedürü
          işletilir; iade onaylandıktan sonra yeni siparişiniz oluşturulabilir.
          Stok durumuna göre fiyat farkı ortaya çıkarsa Alıcı ile iletişime
          geçilir.
        </p>
      </LegalSection>

      <LegalSection number="5" title="Hasarlı veya Eksik Ürün">
        <p>
          Ürün size ulaştığında kargo paketinde gözle görülür bir hasar
          varsa <strong>tutanak tutturarak teslim almayınız</strong> ve
          aynı gün bizimle iletişime geçiniz. Açıldığında hasarlı veya
          eksik çıkan ürünler için, teslim aldığınız tarihten itibaren 48
          saat içinde fotoğraf ile birlikte bildirim yaptığınızda kargo
          ve ürün bedeli tarafımızca karşılanır.
        </p>
      </LegalSection>

      <LegalSection number="6" title="Garantili Ürünler">
        <p>
          Üretici garantisi kapsamındaki ürünler, garanti belgesi
          dahilinde üretici/distribütör tarafından servis edilir.
          Servis süresi içerisinde değişim veya onarım yapılır. Galaksi
          Motor, garanti süreçlerinde aracı kuruluş olarak Alıcı'ya
          destek olur.
        </p>
      </LegalSection>

      <LegalSection number="7" title="İletişim">
        <p>
          İade ve iptal süreçleriyle ilgili her türlü soru için:{" "}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a> /{" "}
          <strong>{SITE.phone}</strong>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
