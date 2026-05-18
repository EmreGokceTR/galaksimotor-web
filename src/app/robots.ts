import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Yönetim paneli
          "/admin",
          "/admin/",
          // API routes
          "/api/",
          // Kullanıcıya özel sayfalar
          "/hesabim",
          "/hesabim/",
          // Ödeme akışı (hassas)
          "/odeme",
          "/odeme/",
          // Sepet (oturum verisi içerir, ince içerik)
          "/sepet",
          // Kimlik doğrulama sayfaları (giriş/kayıt/şifre)
          "/giris",
          "/kayit",
          "/auth/",
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
