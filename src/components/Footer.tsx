import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/config/site";
import { getSettings, st } from "@/lib/site-settings";
import { getSocialLinks } from "@/lib/social";
import { EditableWrapper } from "./EditableWrapper";

const R = ["/"];

const SOCIAL_ICON: Record<string, React.ReactNode> = {
  social_facebook: (
    <path d="M14 9h2V6h-2c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2.1l.4-3H14v-1.5c0-.3.2-.5.5-.5H14z" />
  ),
  social_instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="7" r="1.2" />
    </>
  ),
  social_youtube: (
    <path d="M21.6 8.2a2.4 2.4 0 0 0-1.7-1.7C18.3 6 12 6 12 6s-6.3 0-7.9.5A2.4 2.4 0 0 0 2.4 8.2C2 9.8 2 12 2 12s0 2.2.4 3.8a2.4 2.4 0 0 0 1.7 1.7C5.7 18 12 18 12 18s6.3 0 7.9-.5a2.4 2.4 0 0 0 1.7-1.7C22 14.2 22 12 22 12s0-2.2-.4-3.8ZM10 15V9l5 3-5 3Z" />
  ),
  social_x: (
    <path d="M4 4h3.5l4 5.5L16 4h4l-6.3 8L20 20h-3.5l-4.3-5.8L7 20H3l6.6-8.4L4 4Z" />
  ),
  social_tiktok: (
    <path d="M14 4c.3 2 1.6 3.6 3.8 3.9v2.4c-1.3 0-2.6-.4-3.8-1.1v5.3a4.7 4.7 0 1 1-4.7-4.7c.3 0 .5 0 .8.1v2.5a2.2 2.2 0 1 0 1.5 2.1V4H14Z" />
  ),
};

export async function Footer() {
  const social = await getSocialLinks();
  const bag = await getSettings([
    "logo_name_part1",
    "logo_name_part2",
    "logo_image_url",
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
    "contact_address",
    "contact_phone",
    "contact_email",
  ]);

  const logoPart1 = st(bag, "logo_name_part1", "Galaksi");
  const logoPart2 = st(bag, "logo_name_part2", "Motor");
  const logoImageUrl = st(bag, "logo_image_url", "/logos/galaksi-motor-logo.jpg");
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
    { label: "Hakkımızda", href: "/hakkimizda" },
    { label: "KVKK", href: "/kvkk" },
    { label: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
    { label: "Mesafeli Satış Sözleşmesi", href: "/mesafeli-satis-sozlesmesi" },
    { label: "İptal & İade Koşulları", href: "/iptal-iade-kosullari" },
  ];

  const contactAddress = st(bag, "contact_address", `${SITE.address.line}, ${SITE.address.district} / ${SITE.address.city}`);
  const contactPhone = st(bag, "contact_phone", SITE.phone);
  const contactEmail = st(bag, "contact_email", SITE.email);

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
              <span className={`relative flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden ${
                logoImageUrl
                  ? "ring-1 ring-white/10 shadow-[0_0_18px_-2px_rgba(255,215,0,0.3)]"
                  : "bg-brand-yellow text-brand-black shadow-[0_0_18px_-2px_rgba(255,215,0,0.5)]"
              }`}>
                {logoImageUrl ? (
                  <Image src={logoImageUrl} alt="Galaksi Motor logo" fill className="object-cover" sizes="36px" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path
                      d="M5 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm14 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7-3 4-7h-3l-1 2H7l5 5Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
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
              <div className="flex items-start gap-2">
                <span className="text-brand-yellow mt-0.5">📍</span>
                <EditableWrapper table="siteSetting" id="contact_address" field="value" value={contactAddress} label="Footer Adres" fieldType="textarea" revalidatePaths={R} as="span">
                  {contactAddress}
                </EditableWrapper>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand-yellow">✆</span>
                <EditableWrapper table="siteSetting" id="contact_phone" field="value" value={contactPhone} label="Footer Telefon" revalidatePaths={R} as="span">
                  {contactPhone}
                </EditableWrapper>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand-yellow">✉</span>
                <EditableWrapper table="siteSetting" id="contact_email" field="value" value={contactEmail} label="Footer E-posta" revalidatePaths={R} as="span">
                  {contactEmail}
                </EditableWrapper>
              </div>
            </div>

            {/* Sosyal medya */}
            {social.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {social.map((s) => (
                  <a
                    key={s.key}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-brand-yellow/50 hover:text-brand-yellow"
                  >
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor">
                      {SOCIAL_ICON[s.key] ?? <circle cx="12" cy="12" r="4" />}
                    </svg>
                  </a>
                ))}
              </div>
            )}
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
          className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/10 pt-6 text-xs text-white/55 sm:justify-start"
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
          <span className="text-xs text-white/55">Güvenli Ödeme:</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/iyzico-logo-band.svg"
            alt="iyzico ile güvenli ödeme — Visa ve Mastercard kabul edilir"
            className="h-7 opacity-70"
          />
        </div>

        <div className="mt-4 flex flex-col items-center justify-between gap-3 text-xs text-white/55 sm:flex-row">
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
