import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

/**
 * PWA Web App Manifest — Next.js bunu otomatik /manifest.webmanifest olarak servis eder.
 *
 * Faydaları:
 *  - Mobil tarayıcılarda "Ana ekrana ekle" promptu
 *  - Yüklenince ayrı pencerede çalışır (standalone app gibi)
 *  - iOS/Android home screen'de doğru ikon ve isim
 *  - Splash screen (Android)
 *  - Theme color (status bar rengi)
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: "Galaksi Motor",
    description: SITE.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0A0A0B",
    theme_color: "#FFD700",
    lang: "tr-TR",
    dir: "ltr",
    categories: ["shopping", "automotive", "lifestyle"],
    icons: [
      {
        src: "/logos/galaksi-motor-logo.jpg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/logos/galaksi-motor-logo.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/logos/galaksi-motor-logo.jpg",
        sizes: "1024x1024",
        type: "image/jpeg",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Tüm Ürünler",
        short_name: "Ürünler",
        description: "Motosiklet yedek parça kataloğu",
        url: "/urunler",
      },
      {
        name: "Randevu Al",
        short_name: "Randevu",
        description: "Servis randevusu oluştur",
        url: "/randevu",
      },
      {
        name: "Sepetim",
        short_name: "Sepet",
        url: "/sepet",
      },
    ],
  };
}
