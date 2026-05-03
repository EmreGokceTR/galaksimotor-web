import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSettings, st } from "@/lib/site-settings";
import { EditableWrapper } from "@/components/EditableWrapper";
import { ReactNode } from "react";

const R = ["/hesabim"];

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/giris?callbackUrl=/hesabim");
  }

  const bag = await getSettings([
    "account_title",
    "account_nav_overview",
    "account_nav_orders",
    "account_nav_favorites",
    "account_nav_appointments",
    "account_nav_garage",
  ]);

  const title = st(bag, "account_title", "Hesabım");

  const menuLinks = [
    { href: "/hesabim", key: "account_nav_overview", label: st(bag, "account_nav_overview", "Genel Bakış") },
    { href: "/hesabim/siparislerim", key: "account_nav_orders", label: st(bag, "account_nav_orders", "Siparişlerim") },
    { href: "/hesabim/favoriler", key: "account_nav_favorites", label: st(bag, "account_nav_favorites", "Favorilerim") },
    { href: "/hesabim/randevular", key: "account_nav_appointments", label: st(bag, "account_nav_appointments", "Randevularım") },
    { href: "/hesabim/garaj", key: "account_nav_garage", label: st(bag, "account_nav_garage", "🏍 Garajım") },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <EditableWrapper
        table="siteSetting"
        id="account_title"
        field="value"
        value={title}
        label="Hesabım Sayfa Başlığı"
        revalidatePaths={R}
        as="h1"
        className="mb-6 text-3xl font-bold text-brand-yellow"
      >
        <h1 className="mb-6 text-3xl font-bold text-brand-yellow">{title}</h1>
      </EditableWrapper>
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="flex flex-col gap-2 text-sm">
          {menuLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded px-3 py-2 hover:bg-white/5 hover:text-brand-yellow"
            >
              <EditableWrapper
                table="siteSetting"
                id={link.key}
                field="value"
                value={link.label}
                label={`Hesabım Menü: ${link.label}`}
                revalidatePaths={R}
                as="span"
              >
                {link.label}
              </EditableWrapper>
            </Link>
          ))}
        </aside>
        <section className="rounded-lg bg-white/5 p-6">{children}</section>
      </div>
    </div>
  );
}
