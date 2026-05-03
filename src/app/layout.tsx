import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SITE } from "@/config/site";
import { getSettings, st } from "@/lib/site-settings";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} - Yedek Parça, Aksesuar ve Servis`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
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
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "MotorcycleRepair",
  name: SITE.name,
  description: SITE.description,
  url: SITE.url,
  telephone: SITE.phone,
  email: SITE.email,
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
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "10:00",
      closes: "17:00",
    },
  ],
  sameAs: [SITE.social.instagram, SITE.social.facebook, SITE.social.youtube],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bag = await getSettings([
    "logo_name_part1",
    "logo_name_part2",
    "logo_image_url",
    "nav_home",
    "nav_urunler",
    "nav_motosikletler",
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
  ]);

  const navSettings = {
    logoPart1: st(bag, "logo_name_part1", "Galaksi"),
    logoPart2: st(bag, "logo_name_part2", "Motor"),
    logoImageUrl: st(bag, "logo_image_url", ""),
    navHome: st(bag, "nav_home", "Anasayfa"),
    navUrunler: st(bag, "nav_urunler", "Ürünler"),
    navMotosikletler: st(bag, "nav_motosikletler", "Motosikletler"),
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
    tooltipSub: st(bag, "wa_tooltip_sub", "WhatsApp'tan dakikalar içinde dönüş."),
  };

  return (
    <html lang="tr" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-brand-black font-sans text-white antialiased">
        <Providers>
          <Navbar settings={navSettings} />
          <main className="relative">{children}</main>
          <Footer />
          <WhatsAppButton settings={waSettings} />
        </Providers>
      </body>
    </html>
  );
}
