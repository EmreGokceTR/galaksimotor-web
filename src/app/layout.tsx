import type { Metadata, Viewport } from "next";
import { cache } from "react";
import { Inter, Poppins, Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { EditModeToggle } from "@/components/EditModeToggle";
import { CookieConsent } from "@/components/CookieConsent";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SITE } from "@/config/site";
import { getSettings, st } from "@/lib/site-settings";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-poppins",
});

const roboto = Roboto({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  variable: "--font-roboto",
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
      "motosiklet yedek parça",
      "motosiklet aksesuar",
      "motor servisi",
      "Küçükçekmece motor",
      "İstanbul motosiklet",
      "CVT kayışı",
      "fren balatası",
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
  "@type": "MotorcycleRepair",
  "@id": SITE.url,
  name: SITE.name,
  description: SITE.description,
  url: SITE.url,
  telephone: SITE.phone,
  email: SITE.email,
  priceRange: "₺₺",
  currenciesAccepted: "TRY",
  paymentAccepted: "Nakit, Kredi Kartı, Banka Transferi",
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
  sameAs: [SITE.social.facebook, SITE.social.youtube],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bag = await fetchSettings();

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

  const themeFont = st(bag, "theme_font", "inter");
  const themeFontScale = st(bag, "theme_font_scale", "100");

  // Active font variable name based on selection
  const fontVar =
    themeFont === "poppins"
      ? "var(--font-poppins)"
      : themeFont === "roboto"
      ? "var(--font-roboto)"
      : "var(--font-inter)";

  const themeStyle = `
    :root { --font-body: ${fontVar}; }
    html  { font-size: ${themeFontScale}%; }
  `;

  return (
    <html lang="tr" className={`${inter.variable} ${poppins.variable} ${roboto.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeStyle }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
          }}
        />
      </head>
      <body className="min-h-screen bg-brand-black font-sans text-white antialiased">
        <Providers>
          <Navbar settings={navSettings} />
          <main className="relative">{children}</main>
          <Footer />
          <WhatsAppButton settings={waSettings} />
          <EditModeToggle />
          <CookieConsent />
          <GoogleAnalytics />
        </Providers>
      </body>
    </html>
  );
}
