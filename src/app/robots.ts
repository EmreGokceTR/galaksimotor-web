import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/hesabim", "/odeme"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
