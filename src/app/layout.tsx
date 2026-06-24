import type { Metadata, Viewport } from "next";
import { cache } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CookieConsent } from "@/components/CookieConsent";
import { DevBanner } from "@/components/DevBanner";
import { themeNoFlashScript } from "@/components/ThemeProvider";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE } from "@/config/site";
import { getSettings, st } from "@/lib/site-settings";
import { getSocialLinks } from "@/lib/social";

// Tek font (Inter) — Poppins + Roboto kaldırıldı.
// Önceden 3 font × 4-5 weight = ~13 woff2 dosyası preload ediliyordu, bu da
// ana sayfanın HTML'inden önce font request'lerinin paralel başlamasına ve
// render-blocking yaratıyordu. Inter tek başına 2 weight ile yeterli.
// İhtiyaç olursa weight subset'i artırılabilir.
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  // Sayfayı görüntülemek için kritik olan tek font Inter — diğerlerinin
  // istek bile gönderilmemesi için Tailwind sınıfından da çıkartıldı.
});

// Tek sorguda tüm ayarları çek; cache() ile aynı request içinde dedup yapar
const fetchSettings = cache(() =>
  getSettings([
    "site_title",
    "site_description",
    "theme_font",
    "theme_font_scale",
    "logo_name_part1",
    "logo_name_part2",
    "logo_image_url",
    "nav_home",
    "nav_urunler",
    "nav_yedek_parca",
    "nav_bakim",
    "nav_randevu",
    "nav_auth_account",
    "nav_auth_logout",
    "nav_auth_login",
    "nav_auth_register",
    "nav_auth_admin",
    "wa_phone",
    "wa_prefill",
    "wa_tooltip_title",
    "wa_tooltip_sub",
  ])
);

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0A0A0B",
};

export async function generateMetadata(): Promise<Metadata> {
  const bag = await fetchSettings();
  const title = st(
    bag,
    "site_title",
    `${SITE.name} - Yedek Parça, Aksesuar ve Servis`
  );
  const description = st(bag, "site_description", SITE.description);

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: title,
      template: `%s · ${SITE.name}`,
    },
    description,
    keywords: [
      // Yerel + tamir/servis niyeti
      "Küçükçekmece motosiklet tamircisi",
      "Küçükçekmece motosiklet servisi",
      "Küçükçekmece motosiklet yedek parça",
      "motosiklet tamircisi İstanbul",
      "motosiklet servisi İstanbul",
      "İstanbul motosiklet yedek parça",
      "Halkalı motosiklet tamir",
      "Avcılar motosiklet servis",
      // Hizmet / ürün
      "motosiklet yedek parça",
      "motosiklet aksesuar",
      "motosiklet bakımı",
      "motosiklet onarımı",
      "motor tamiri",
      "motosiklet servis randevusu",
      "CVT kayışı",
      "fren balatası",
      "motosiklet yağ değişimi",
      // Trafik kazası / değer kaybı
      "araç değer kaybı",
      "değer kaybı başvurusu",
      "trafik kazası hasar dosyası",
      "hasar ihbar dosyası",
      "Küçükçekmece değer kaybı",
      // Marka
      "Galaksi Motor",
      "Galaksi Motor Küçükçekmece",
    ],
    authors: [{ name: SITE.name }],
    icons: {
      icon: "/logos/galaksi-motor-logo.jpg",
      apple: "/logos/galaksi-motor-logo.jpg",
    },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: SITE.url,
      siteName: SITE.name,
      title,
      description,
      images: [
        {
          url: `${SITE.url}/logos/galaksi-motor-logo.jpg`,
          width: 1024,
          height: 1024,
          alt: "Galaksi Motor",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE.url}/logos/galaksi-motor-logo.jpg`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    verification: {
      google: "S2Gy91RZISU1b3VBFxpnVr6sBf3JTfn9TUM2B79w0bg",
    },
  };
}

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": ["MotorcycleRepair", "Store", "AutoPartsStore"],
  "@id": SITE.url,
  name: SITE.name,
  legalName: SITE.name,
  description: SITE.description,
  slogan: SITE.tagline,
  url: SITE.url,
  telephone: SITE.phone,
  email: SITE.email,
  priceRange: "₺₺",
  currenciesAccepted: "TRY",
  paymentAccepted: "Nakit, Kredi Kartı, Banka Transferi",
  // Hizmet verilen bölgeler — yerel aramalar için
  areaServed: [
    "Küçükçekmece",
    "Halkalı",
    "Avcılar",
    "Başakşehir",
    "Bağcılar",
    "Bahçelievler",
    "Esenyurt",
    "İstanbul",
  ].map((name) => ({ "@type": "City", name })),
  knowsAbout: [
    "Motosiklet yedek parça",
    "Motosiklet bakımı ve onarımı",
    "Motosiklet aksesuarları",
    "Araç değer kaybı",
    "Trafik kazası hasar dosyası",
  ],
  // Sunulan hizmetler — "tamir / servis / değer kaybı" sorgularıyla eşleşir
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Motosiklet Bakımı" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Motosiklet Onarımı / Tamiri" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Motosiklet Yedek Parça Satışı" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Motosiklet Aksesuar Satışı" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Araç Değer Kaybı & Hasar İhbar Dosyası" } },
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.address.line,
    addressLocality: SITE.address.district,
    addressRegion: SITE.address.city,
    postalCode: SITE.address.postalCode,
    addressCountry: SITE.address.country,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: SITE.address.latitude,
    longitude: SITE.address.longitude,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "08:30",
      closes: "20:00",
    },
  ],
  logo: `${SITE.url}/logos/galaksi-motor-logo.jpg`,
  image: `${SITE.url}/logos/galaksi-motor-logo.jpg`,
  // sameAs yalnızca admin gerçek sosyal link girince eklenir (RootLayout'ta).
};

// WebSite schema — Google sitelinks search box ve site title için.
// SearchAction sayesinde Google sonuçlarında doğrudan arama kutusu çıkabilir.
const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE.url}#website`,
  name: SITE.name,
  alternateName: "Galaksi Motor",
  url: SITE.url,
  inLanguage: "tr-TR",
  publisher: { "@id": SITE.url },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE.url}/urunler?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

// Organization schema — Google Knowledge Panel için.
// LocalBusiness'tan farklı: marka kimliği ve sosyal hesapları kapsar.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE.url}#organization`,
  name: SITE.name,
  alternateName: "Galaksi Motor",
  url: SITE.url,
  logo: `${SITE.url}/logos/galaksi-motor-logo.jpg`,
  email: SITE.email,
  telephone: SITE.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.address.line,
    addressLocality: SITE.address.district,
    addressRegion: SITE.address.city,
    postalCode: SITE.address.postalCode,
    addressCountry: SITE.address.country,
  },
  // sameAs yalnızca admin gerçek sosyal link girince eklenir (RootLayout'ta).
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    telephone: SITE.phone,
    email: SITE.email,
    areaServed: "TR",
    availableLanguage: ["tr"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bag = await fetchSettings();

  // Sosyal medya linkleri admin'den (JSON-LD sameAs için)
  const sameAs = (await getSocialLinks()).map((s) => s.url);
  const localBusiness = sameAs.length
    ? { ...localBusinessJsonLd, sameAs }
    : localBusinessJsonLd;
  const organization = sameAs.length
    ? { ...organizationJsonLd, sameAs }
    : organizationJsonLd;

  const navSettings = {
    logoPart1: st(bag, "logo_name_part1", "Galaksi"),
    logoPart2: st(bag, "logo_name_part2", "Motor"),
    logoImageUrl: st(bag, "logo_image_url", "/logos/galaksi-motor-logo.jpg"),
    navHome: st(bag, "nav_home", "Anasayfa"),
    navUrunler: st(bag, "nav_urunler", "Ürünler"),
    navYedekParca: st(bag, "nav_yedek_parca", "Yedek Parça"),
    navBakim: st(bag, "nav_bakim", "Bakım"),
    navRandevu: st(bag, "nav_randevu", "Randevu"),
    navAuthAccount: st(bag, "nav_auth_account", "Hesabım"),
    navAuthLogout: st(bag, "nav_auth_logout", "Çıkış"),
    navAuthLogin: st(bag, "nav_auth_login", "Giriş"),
    navAuthRegister: st(bag, "nav_auth_register", "Kayıt Ol"),
    navAuthAdmin: st(bag, "nav_auth_admin", "Admin"),
  };

  const waSettings = {
    phone: st(bag, "wa_phone", SITE.whatsapp),
    prefillMsg: st(bag, "wa_prefill", SITE.whatsappPrefilled),
    tooltipTitle: st(bag, "wa_tooltip_title", "Yardım lazım mı?"),
    tooltipSub: st(
      bag,
      "wa_tooltip_sub",
      "WhatsApp'tan dakikalar içinde dönüş."
    ),
  };

  const themeFontScale = st(bag, "theme_font_scale", "100");

  // Tek font (Inter) sabitlendi; theme_font seçimi şu an devre dışı.
  // İleride Poppins/Roboto eklemek gerekirse dinamik import + suspense ile
  // sadece o sayfanın isteğine göre çekilebilir.
  const themeStyle = `
    :root { --font-body: var(--font-inter); }
    html  { font-size: ${themeFontScale}%; }
  `;

  return (
    <html lang="tr" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* DNS prefetch & preconnect — bağlantı kurulumunu paralel başlat */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* LCP image — logo eagerly preload */}
        <link rel="preload" as="image" href="/logos/galaksi-motor-logo.jpg" fetchPriority="high" />
        <script dangerouslySetInnerHTML={{ __html: themeNoFlashScript }} />
        <style dangerouslySetInnerHTML={{ __html: themeStyle }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusiness),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organization),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webSiteJsonLd),
          }}
        />
      </head>
      <body className="min-h-screen bg-brand-black font-sans text-white antialiased">
        <Providers>
          <DevBanner />
          <Navbar settings={navSettings} />
          <main className="relative">{children}</main>
          <Footer />
          <WhatsAppButton settings={waSettings} />
          <CookieConsent />
          <GoogleAnalytics />
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
