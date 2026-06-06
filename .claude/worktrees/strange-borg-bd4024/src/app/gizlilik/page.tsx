import { permanentRedirect } from "next/navigation";

// Eski /gizlilik rotası → /gizlilik-politikasi (SEO 308 redirect)
export default function GizlilikRedirect() {
  permanentRedirect("/gizlilik-politikasi");
}
