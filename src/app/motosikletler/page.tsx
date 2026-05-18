import { permanentRedirect } from "next/navigation";

// 308 Permanent Redirect → SEO canonical'ı /urunler'e geçirir
export default function MotorcyclesPage() {
  permanentRedirect("/urunler");
}
