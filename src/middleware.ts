/**
 * Next.js Middleware — Korumalı Rota Yönlendirmeleri
 *
 * Oturum gerektiren sayfalar için anlık 302 redirect sağlar.
 * Layout seviyesindeki requireAdmin() hâlâ role kontrolü yapar;
 * bu middleware yalnızca "session var mı?" kontrolü yapar (DB çağrısı yok).
 *
 * Kapsam:
 *   /admin/**   → oturum yok ise /giris?callbackUrl=…
 *   /hesabim/** → oturum yok ise /giris?callbackUrl=…
 */
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/admin/:path*", "/hesabim/:path*"],
};
