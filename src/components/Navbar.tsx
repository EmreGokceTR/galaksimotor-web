"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { CartButton } from "./CartButton";
import { CartDrawer } from "./CartDrawer";
import { CartHydration } from "./CartHydration";
import { GarageSelector } from "./GarageSelector";
import { EditableWrapper } from "./EditableWrapper";

export type NavSettings = {
  logoPart1: string;
  logoPart2: string;
  logoImageUrl: string;
  navHome: string;
  navUrunler: string;
  navMotosikletler: string;
  navYedekParca: string;
  navBakim: string;
  navRandevu: string;
  navAuthAccount: string;
  navAuthLogout: string;
  navAuthLogin: string;
  navAuthRegister: string;
  navAuthAdmin: string;
};

const R = ["/"];

export function Navbar({ settings }: { settings: NavSettings }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const NAV_LINKS = [
    { href: "/", settingKey: "nav_home", label: settings.navHome },
    { href: "/urunler", settingKey: "nav_urunler", label: settings.navUrunler },
    { href: "/motosikletler", settingKey: "nav_motosikletler", label: settings.navMotosikletler },
    { href: "/kategori/motosiklet-yedek-parcalari", settingKey: "nav_yedek_parca", label: settings.navYedekParca },
    { href: "/kategori/bakim-ve-tamir-urunleri", settingKey: "nav_bakim", label: settings.navBakim },
    { href: "/randevu", settingKey: "nav_randevu", label: settings.navRandevu },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5 text-lg font-bold tracking-tight">
          <EditableWrapper
            table="siteSetting"
            id="logo_image_url"
            field="value"
            value={settings.logoImageUrl}
            label="Logo Görseli (URL)"
            fieldType="image"
            revalidatePaths={R}
            as="span"
          >
            <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-brand-yellow text-brand-black shadow-[0_0_18px_-2px_rgba(255,215,0,0.5)] transition-transform group-hover:rotate-[8deg] group-hover:scale-105 overflow-hidden">
              {settings.logoImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.logoImageUrl} alt="logo" className="h-full w-full object-cover" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path d="M5 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm14 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7-3 4-7h-3l-1 2H7l5 5Z" fill="currentColor" />
                </svg>
              )}
            </span>
          </EditableWrapper>

          <span className="text-white">
            <EditableWrapper
              table="siteSetting"
              id="logo_name_part1"
              field="value"
              value={settings.logoPart1}
              label="Logo Metin (1. Kısım)"
              revalidatePaths={R}
              as="span"
            >
              {settings.logoPart1}
            </EditableWrapper>
            {" "}
            <EditableWrapper
              table="siteSetting"
              id="logo_name_part2"
              field="value"
              value={settings.logoPart2}
              label="Logo Metin (2. Kısım)"
              revalidatePaths={R}
              as="span"
              className="text-gradient-gold"
            >
              <span className="text-gradient-gold">{settings.logoPart2}</span>
            </EditableWrapper>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
            return (
              <li key={link.href} className="relative">
                <Link
                  href={link.href}
                  className={`relative inline-flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? "text-brand-yellow" : "text-white/80 hover:text-white"
                  }`}
                >
                  <EditableWrapper
                    table="siteSetting"
                    id={link.settingKey}
                    field="value"
                    value={link.label}
                    label={`Menü: ${link.label}`}
                    revalidatePaths={R}
                    as="span"
                  >
                    {link.label}
                  </EditableWrapper>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-2 -bottom-0.5 h-[2px] rounded-full bg-brand-yellow shadow-[0_0_10px_rgba(255,215,0,0.6)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right side */}
        <div className="hidden items-center gap-3 md:flex">
          <GarageSelector />
          <CartButton />
          {session?.user ? (
            <>
              {(session.user as { role?: string }).role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-3 py-1 text-xs font-medium text-brand-yellow hover:bg-brand-yellow/20"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow shadow-[0_0_8px_rgba(255,215,0,0.7)]" />
                  <EditableWrapper
                    table="siteSetting"
                    id="nav_auth_admin"
                    field="value"
                    value={settings.navAuthAdmin}
                    label="Navbar: Admin Etiketi"
                    revalidatePaths={R}
                    as="span"
                  >
                    {settings.navAuthAdmin}
                  </EditableWrapper>
                </Link>
              )}
              <Link href="/hesabim" className="text-sm text-white/80 transition-colors hover:text-brand-yellow">
                <EditableWrapper
                  table="siteSetting"
                  id="nav_auth_account"
                  field="value"
                  value={settings.navAuthAccount}
                  label="Navbar: Hesabım Linki"
                  revalidatePaths={R}
                  as="span"
                >
                  {settings.navAuthAccount}
                </EditableWrapper>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-white transition hover:border-brand-yellow hover:text-brand-yellow"
              >
                <EditableWrapper
                  table="siteSetting"
                  id="nav_auth_logout"
                  field="value"
                  value={settings.navAuthLogout}
                  label="Navbar: Çıkış Butonu"
                  revalidatePaths={R}
                  as="span"
                >
                  {settings.navAuthLogout}
                </EditableWrapper>
              </button>
            </>
          ) : (
            <>
              <Link href="/giris" className="text-sm text-white/80 transition-colors hover:text-brand-yellow">
                <EditableWrapper
                  table="siteSetting"
                  id="nav_auth_login"
                  field="value"
                  value={settings.navAuthLogin}
                  label="Navbar: Giriş Linki"
                  revalidatePaths={R}
                  as="span"
                >
                  {settings.navAuthLogin}
                </EditableWrapper>
              </Link>
              <Link
                href="/kayit"
                className="group relative inline-flex items-center gap-1.5 rounded-full bg-brand-yellow px-4 py-1.5 text-sm font-semibold text-brand-black shadow-[0_8px_24px_-8px_rgba(255,215,0,0.65)] transition hover:shadow-[0_10px_30px_-6px_rgba(255,215,0,0.8)]"
              >
                <EditableWrapper
                  table="siteSetting"
                  id="nav_auth_register"
                  field="value"
                  value={settings.navAuthRegister}
                  label="Navbar: Kayıt Ol Butonu"
                  revalidatePaths={R}
                  as="span"
                >
                  {settings.navAuthRegister}
                </EditableWrapper>
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>
            </>
          )}
        </div>

        {/* Mobile right */}
        <div className="flex items-center gap-2 md:hidden">
          <CartButton />
          <button
            aria-label="Menü"
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5"
          >
            <span className={`absolute h-[2px] w-5 bg-white transition-transform ${open ? "translate-y-0 rotate-45" : "-translate-y-1.5"}`} />
            <span className={`absolute h-[2px] w-5 bg-white transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`absolute h-[2px] w-5 bg-white transition-transform ${open ? "translate-y-0 -rotate-45" : "translate-y-1.5"}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-white/10 bg-black/80 backdrop-blur-xl md:hidden"
          >
            <ul className="mx-auto flex max-w-7xl flex-col px-6 py-3">
              {NAV_LINKS.map((link) => {
                const isActive =
                  link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        isActive ? "bg-brand-yellow/10 text-brand-yellow" : "text-white/80 hover:bg-white/5"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              <li className="mt-2 flex gap-2 border-t border-white/10 pt-3">
                {session?.user ? (
                  <>
                    <Link href="/hesabim" className="flex-1 rounded-lg border border-white/15 bg-white/5 py-2 text-center text-sm">
                      {settings.navAuthAccount}
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex-1 rounded-lg bg-brand-yellow py-2 text-sm font-semibold text-brand-black"
                    >
                      {settings.navAuthLogout}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/giris" className="flex-1 rounded-lg border border-white/15 bg-white/5 py-2 text-center text-sm">
                      {settings.navAuthLogin}
                    </Link>
                    <Link href="/kayit" className="flex-1 rounded-lg bg-brand-yellow py-2 text-center text-sm font-semibold text-brand-black">
                      {settings.navAuthRegister}
                    </Link>
                  </>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer />
      <CartHydration />
    </motion.header>
  );
}
