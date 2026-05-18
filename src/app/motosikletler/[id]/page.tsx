import { permanentRedirect } from "next/navigation";

// 308 Permanent Redirect → eski motosiklet detay URL'leri /urunler'e yönlendirilir
export default function MotorcycleDetailPage() {
  permanentRedirect("/urunler");
}
