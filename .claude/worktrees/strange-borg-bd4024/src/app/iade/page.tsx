import { permanentRedirect } from "next/navigation";

// Eski /iade rotası → /iptal-iade-kosullari (SEO 308 redirect)
export default function IadeRedirect() {
  permanentRedirect("/iptal-iade-kosullari");
}
