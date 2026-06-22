import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "./AdminNav";
import { AdminSearch } from "./AdminSearch";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Galaksi Motor" };

const NAV = [
  { href: "/admin", label: "Genel Bakış", icon: "📊" },
  { href: "/admin/siparisler", label: "Siparişler", icon: "📦" },
  { href: "/admin/randevular", label: "Randevular", icon: "📅" },
  { href: "/admin/hasar-dosyalari", label: "Hasar Dosyaları", icon: "📂" },
  { href: "/admin/urunler", label: "Ürünler", icon: "🛍" },
  { href: "/admin/kategoriler", label: "Kategoriler", icon: "🗂" },
  { href: "/admin/kuponlar", label: "Kuponlar", icon: "🎟" },
  { href: "/admin/yorumlar", label: "Ürün Yorumları", icon: "💬" },
  { href: "/admin/motosikletler", label: "İkinci El Motorlar", icon: "🏍" },
  { href: "/admin/blog", label: "Blog", icon: "✍️" },
  { href: "/admin/hizmetler", label: "Hizmetler", icon: "🔧" },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: "👥" },
  { href: "/admin/ayarlar/iletisim", label: "İletişim Bilgileri", icon: "📍" },
  { href: "/admin/ayarlar/kargo", label: "Kargo & Teslimat", icon: "🚚" },
  { href: "/admin/ayarlar/calisma-saatleri", label: "Çalışma Saatleri", icon: "🕒" },
  { href: "/admin/ayarlar/sosyal-medya", label: "Sosyal Medya", icon: "🔗" },
  { href: "/admin/ayarlar/testimonials", label: "Öne Çıkan Yorumlar", icon: "⭐" },
  { href: "/admin/ayarlar/hakkimizda", label: "Hakkımızda", icon: "ℹ️" },
  { href: "/admin/ayarlar/sss", label: "SSS İçeriği", icon: "❓" },
  { href: "/admin/ayarlar/email", label: "E-Posta Şablonları", icon: "✉️" },
  { href: "/admin/ayarlar/seo", label: "SEO Meta Bilgileri", icon: "🔍" },
  { href: "/admin/ayarlar/tasarim", label: "Yazı Tipi & Boyut", icon: "🎨" },
  { href: "/admin/islem-gecmisi", label: "İşlem Geçmişi", icon: "🧾" },
  { href: "/admin/yedek", label: "Yedek & Bakım", icon: "💾" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  // Nav rozetleri için bekleyen iş sayıları (tek bakışta yapılacaklar)
  const [pendingOrders, pendingAppointments, newClaims] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.damageClaim.count({ where: { status: "NEW" } }),
  ]);
  const navBadges: Record<string, number> = {
    "/admin/siparisler": pendingOrders,
    "/admin/randevular": pendingAppointments,
    "/admin/hasar-dosyalari": newClaims,
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-brand-yellow">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow shadow-[0_0_8px_rgba(255,215,0,0.7)]" />
            Admin
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Yönetim Paneli
          </h1>
          <p className="mt-1 text-sm text-white/55">
            Hoşgeldin, <span className="text-white">{admin.name ?? admin.email}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AdminSearch />
          <Link
            href="/"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/70 hover:text-brand-yellow"
          >
            ← Siteye Dön
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <AdminNav items={NAV} badges={navBadges} />
        </aside>

        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
