import Link from "next/link";
import { SITE } from "@/config/site";
import { getSettings, st } from "@/lib/site-settings";
import { EditableWrapper } from "./EditableWrapper";

const R = ["/"];

export async function Footer() {
  const bag = await getSettings([
    "logo_name_part1",
    "logo_name_part2",
    "footer_brand_desc",
    "footer_col1_title",
    "footer_col1_l1", "footer_col1_l2", "footer_col1_l3", "footer_col1_l4",
    "footer_col2_title",
    "footer_col2_l1", "footer_col2_l2", "footer_col2_l3", "footer_col2_l4",
    "footer_col3_title",
    "footer_col3_l1", "footer_col3_l2", "footer_col3_l3", "footer_col3_l4",
    "footer_copyright",
    "footer_credit_prefix",
    "footer_credit_author",
  ]);

  const logoPart1 = st(bag, "logo_name_part1", "Galaksi");
  const logoPart2 = st(bag, "logo_name_part2", "Motor");
  const brandDesc = st(bag, "footer_brand_desc", "Küçükçekmece İnönü Mahallesi'nde motosikletinizin ihtiyacı olan orijinal yedek parça, bakım ürünü ve aksesuarlar — uzman servis ekibiyle.");

  const col1Title = st(bag, "footer_col1_title", "Mağaza");
  const col2Title = st(bag, "footer_col2_title", "Hesap");
  const col3Title = st(bag, "footer_col3_title", "Destek");

  const cols = [
    {
      titleKey: "footer_col1_title",
      title: col1Title,
      items: [
        { key: "footer_col1_l1", label: st(bag, "footer_col1_l1", "Tüm Ürünler"), href: "/urunler" },
        { key: "footer_col1_l2", label: st(bag, "footer_col1_l2", "Yedek Parça"), href: "/kategori/motosiklet-yedek-parcalari" },
        { key: "footer_col1_l3", label: st(bag, "footer_col1_l3", "Bakım & Tamir"), href: "/kategori/bakim-ve-tamir-urunleri" },
        { key: "footer_col1_l4", label: st(bag, "footer_col1_l4", "Aksesuarlar"), href: "/kategori/aksesuarlar" },
      ],
    },
    {
      titleKey: "footer_col2_title",
      title: col2Title,
      items: [
        { key: "footer_col2_l1", label: st(bag, "footer_col2_l1", "Giriş Yap"), href: "/giris" },
        { key: "footer_col2_l2", label: st(bag, "footer_col2_l2", "Kayıt Ol"), href: "/kayit" },
        { key: "footer_col2_l3", label: st(bag, "footer_col2_l3", "Hesabım"), href: "/hesabim" },
        { key: "footer_col2_l4", label: st(bag, "footer_col2_l4", "Randevu Al"), href: "/randevu" },
      ],
    },
    {
      titleKey: "footer_col3_title",
      title: col3Title,
      items: [
        { key: "footer_col3_l1", label: st(bag, "footer_col3_l1", "İletişim"), href: "/iletisim" },
        { key: "footer_col3_l2", label: st(bag, "footer_col3_l2", "Kargo & Teslimat"), href: "/kargo" },
        { key: "footer_col3_l3", label: st(bag, "footer_col3_l3", "İade Koşulları"), href: "/iptal-iade-kosullari" },
        { key: "footer_col3_l4", label: st(bag, "footer_col3_l4", "SSS"), href: "/sss" },
      ],
    },
  ];

  const legalLinks = [
    { label: "KVKK", href: "/kvkk" },
    { label: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
    { label: "Mesafeli Satış Sözleşmesi", href: "/mesafeli-satis-sozlesmesi" },
    { label: "İptal & İade Koşulları", href: "/iptal-iade-kosullari" },
  ];

  const copyright = st(bag, "footer_copyright", `© ${new Date().getFullYear()} Galaksi Motor. Tüm hakları saklıdır.`);
  const creditPrefix = st(bag, "footer_credit_prefix", "Yapım");
  const creditAuthor = st(bag, "footer_credit_author", "Galaksi Garage");

  return (
    <footer className="relative mt-20 border-t border-white/10">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand-yellow/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          {/* Brand block */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-yellow text-brand-black shadow-[0_0_18px_-2px_rgba(255,215,0,0.5)]">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path
                    d="M5 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm14 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7-3 4-7h-3l-1 2H7l5 5Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className="text-lg font-bold text-white">
                <EditableWrapper table="siteSetting" id="logo_name_part1" field="value" value={logoPart1} label="Logo Ad 1" revalidatePaths={R} as="span">
                  {logoPart1}
                </EditableWrapper>{" "}
                <EditableWrapper table="siteSetting" id="logo_name_part2" field="value" value={logoPart2} label="Logo Ad 2 (altın)" revalidatePaths={R} as="span" className="text-gradient-gold">
                  <span className="text-gradient-gold">{logoPart2}</span>
                </EditableWrapper>
              </span>
            </div>
            <EditableWrapper table="siteSetting" id="footer_brand_desc" field="value" value={brandDesc} label="Footer Marka Açıklaması" fieldType="textarea" revalidatePaths={R}>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">{brandDesc}</p>
            </EditableWrapper>

            <div className="mt-5 space-y-2 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <span className="text-brand-yellow">📍</span>
                {SITE.address.line}, {SITE.address.district} / {SITE.address.city}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand-yellow">✆</span>
                {SITE.phone}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand-yellow">✉</span>
                {SITE.email}
              </div>
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.titleKey}>
              <EditableWrapper table="siteSetting" id={col.titleKey} field="value" value={col.title} label={`Footer Sütun: ${col.title}`} revalidatePaths={R}>
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">{col.title}</h4>
              </EditableWrapper>
              <ul className="space-y-2.5">
                {col.items.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className="group inline-flex items-center text-sm text-white/60 transition-colors hover:text-brand-yellow"
                    >
                      <span className="mr-0 h-px w-0 bg-brand-yellow transition-all duration-300 group-hover:mr-2 group-hover:w-3" />
                      <EditableWrapper table="siteSetting" id={it.key} field="value" value={it.label} label={`Footer Link: ${it.label}`} revalidatePaths={R} as="span">
                        {it.label}
                      </EditableWrapper>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Yasal linkler — KVKK, mesafeli satış, gizlilik, iptal/iade */}
        <nav
          aria-label="Yasal Bilgiler"
          className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/10 pt-6 text-[11px] text-white/55 sm:justify-start"
        >
          {legalLinks.map((l, i) => (
            <span key={l.href} className="flex items-center gap-x-5">
              <Link
                href={l.href}
                className="transition-colors hover:text-brand-yellow"
              >
                {l.label}
              </Link>
              {i < legalLinks.length - 1 && (
                <span className="hidden h-1 w-1 rounded-full bg-white/20 sm:inline-block" />
              )}
            </span>
          ))}
        </nav>

        {/* Güvenli ödeme logoları */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="text-[11px] text-white/40">Güvenli Ödeme:</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/iyzico-logo-band.svg"
            alt="iyzico ile güvenli ödeme — Visa ve Mastercard kabul edilir"
            className="h-7 opacity-70"
          />
        </div>

        <div className="mt-4 flex flex-col items-center justify-between gap-3 text-xs text-white/40 sm:flex-row">
          <EditableWrapper table="siteSetting" id="footer_copyright" field="value" value={copyright} label="Footer Telif Hakkı" revalidatePaths={R} as="span">
            {copyright}
          </EditableWrapper>
          <span className="flex items-center gap-1.5">
            <EditableWrapper table="siteSetting" id="footer_credit_prefix" field="value" value={creditPrefix} label="Footer Yapım Prefix" revalidatePaths={R} as="span">
              {creditPrefix}
            </EditableWrapper>
            {" "}
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand-yellow" />
            <EditableWrapper table="siteSetting" id="footer_credit_author" field="value" value={creditAuthor} label="Footer Yapım Adı" revalidatePaths={R} as="span" className="text-white/60">
              <span className="text-white/60">{creditAuthor}</span>
            </EditableWrapper>
          </span>
        </div>
      </div>
    </footer>
  );
}
