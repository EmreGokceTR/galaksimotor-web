import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Galaksi Motor" };

const NAV = [
  { href: "/admin", label: "Genel Bakış", icon: "📊" },
  { href: "/admin/motosikletler", label: "Motosikletler", icon: "🏍" },
  { href: "/admin/siparisler", label: "Siparişler", icon: "📦" },
  { href: "/admin/randevular", label: "Randevular", icon: "📅" },
  { href: "/admin/urunler", label: "Ürünler", icon: "🛍" },
  { href: "/admin/blog", label: "Blog", icon: "✍️" },
  { href: "/admin/ayarlar/email", label: "E-Posta Şablonları", icon: "✉️" },
  { href: "/admin/yedek", label: "Yedek & Bakım", icon: "💾" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

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
        <Link
          href="/"
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/70 hover:text-brand-yellow"
        >
          ← Siteye Dön
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav className="rounded-2xl border border-white/10 bg-white/[0.025] p-2 backdrop-blur-md">
            <ul className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-x-visible">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="group flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/75 transition hover:bg-white/5 hover:text-brand-yellow"
                  >
                    <span className="text-base opacity-80">{n.icon}</span>
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
