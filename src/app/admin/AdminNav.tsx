"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; icon: string };

export function AdminNav({
  items,
  badges = {},
}: {
  items: NavItem[];
  badges?: Record<string, number>;
}) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="rounded-2xl border border-white/10 bg-white/[0.025] p-2 backdrop-blur-md">
      <ul className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-x-visible">
        {items.map((n) => {
          const active = isActive(n.href);
          const badge = badges[n.href] ?? 0;
          return (
            <li key={n.href}>
              <Link
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-brand-yellow/15 font-semibold text-brand-yellow ring-1 ring-brand-yellow/30"
                    : "text-white/75 hover:bg-white/5 hover:text-brand-yellow"
                }`}
              >
                <span className="text-base opacity-80">{n.icon}</span>
                <span className="flex-1">{n.label}</span>
                {badge > 0 && (
                  <span className="ml-auto inline-flex min-w-[20px] items-center justify-center rounded-full bg-rose-500/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
