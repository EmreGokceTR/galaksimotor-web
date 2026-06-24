import type { Metadata } from "next";
import { DamageClaimForm } from "./DamageClaimForm";
import { SITE } from "@/config/site";
import { getSettings, st } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Değer Kaybı & Hasar İhbar Dosyası",
  description:
    "Trafik kazası sonrası araç değer kaybı ve hasar ihbar dosyası işlemleri. Ücretsiz ön başvuru — uzman ekibimiz tüm süreci sizin adınıza sigorta şirketiyle yürütür.",
  alternates: { canonical: `${SITE.url}/deger-kaybi` },
  openGraph: {
    title: "Değer Kaybı & Hasar İhbar Dosyası · Galaksi Motor",
    description:
      "Trafik kazası sonrası araç değer kaybınızı sigortadan talep edin. Ücretsiz ön başvuru.",
    url: `${SITE.url}/deger-kaybi`,
  },
};

const STEPS = [
  {
    no: "1",
    title: "Ücretsiz Başvuru",
    desc: "Aşağıdaki formu doldurun veya bizi arayın. Ön değerlendirme tamamen ücretsizdir.",
  },
  {
    no: "2",
    title: "Dosya Açılışı",
    desc: "Kaza tutanağı, ekspertiz ve ruhsat gibi belgelerle dosyanızı açar, eksikleri biz tamamlarız.",
  },
  {
    no: "3",
    title: "Sigorta Süreci",
    desc: "Değer kaybı talebinizi sigorta şirketine iletir, gerekirse Sigorta Tahkim Komisyonu'na taşırız.",
  },
  {
    no: "4",
    title: "Ödeme & Sonuç",
    desc: "Hak ettiğiniz tazminat hesabınıza geçer. Tüm süreci şeffaf şekilde takip edersiniz.",
  },
];

const FAQS = [
  {
    q: "Değer kaybı nedir?",
    a: "Trafik kazasında kusursuz veya az kusurlu olsanız bile, onarım sonrası aracınızın ikinci el piyasa değeri düşer. Bu farkı, kusurlu tarafın sigorta şirketinden talep etme hakkınız vardır.",
  },
  {
    q: "Hangi durumlarda başvurabilirim?",
    a: "Kazada tam (%100) kusurlu değilseniz ve aracınız pert olmamışsa başvurabilirsiniz. Değer kaybı talebinde zamanaşımı genellikle kaza tarihinden itibaren 2 yıldır (bazı durumlarda daha uzun olabilir); yine de en doğru değerlendirme için bizimle iletişime geçin.",
  },
  {
    q: "Süreç ne kadar sürer?",
    a: "Sigorta şirketine başvuru sonrası genellikle birkaç hafta içinde sonuçlanır. Tahkim gerekirse süreç uzayabilir; tüm aşamada sizi bilgilendiririz.",
  },
  {
    q: "Ön başvuru ücretli mi?",
    a: "Hayır. Ön değerlendirme ve dosya açılış danışmanlığı ücretsizdir.",
  },
];

export default async function DamageClaimPage() {
  const bag = await getSettings(["contact_phone", "wa_phone"]);
  const phone = st(bag, "contact_phone", SITE.phone);
  const whatsapp = st(bag, "wa_phone", SITE.whatsapp).replace(/\D/g, "");

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      {/* Hero */}
      <header className="mb-12 text-center">
        <span className="text-xs font-medium uppercase tracking-[0.25em] text-brand-yellow/80">
          · Trafik Kazası İşlemleri
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-5xl">
          Araç <span className="text-gradient-gold">Değer Kaybı</span> &amp; Hasar
          İhbar Dosyası
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
          Trafik kazası sonrası aracınızda oluşan değer kaybını sigorta
          şirketinden talep edin. Hasar ihbar dosyanızı açıyor, tüm bürokratik
          süreci sizin adınıza yürütüyoruz. Başvuru ücretsiz.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:border-brand-yellow hover:text-brand-yellow"
          >
            ☎ {phone}
          </a>
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-emerald-500/90 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            WhatsApp&apos;tan Yaz
          </a>
        </div>
      </header>

      {/* Nasıl çalışır */}
      <section className="mb-14">
        <h2 className="mb-6 text-center text-lg font-semibold uppercase tracking-wider text-white">
          Süreç Nasıl İşler?
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div
              key={s.no}
              className="relative rounded-2xl border border-white/10 bg-white/[0.025] p-5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-yellow font-bold text-brand-black">
                {s.no}
              </span>
              <h3 className="mt-3 text-sm font-semibold text-white">{s.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-white/55">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form + SSS */}
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <DamageClaimForm />

        <aside className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
            Sık Sorulanlar
          </h2>
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-xl border border-white/10 bg-white/[0.025] p-4"
            >
              <summary className="cursor-pointer list-none text-sm font-medium text-white/90 marker:hidden">
                <span className="text-brand-yellow">›</span> {f.q}
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-white/55">{f.a}</p>
            </details>
          ))}
        </aside>
      </div>
    </div>
  );
}
