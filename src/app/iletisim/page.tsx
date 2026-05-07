import type { Metadata } from "next";
import { InfoPageHero, InfoCard } from "@/components/InfoPageHero";
import { SITE, whatsappLink } from "@/config/site";
import { buildPageMetadata } from "@/lib/page-meta";
import { ContactForm } from "./ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/iletisim", {
    title: "İletişim - Galaksi Motor",
    description:
      "Galaksi Motor iletişim bilgileri, adres, telefon ve çalışma saatleri.",
  });
}

export default function IletisimPage() {
  return (
    <>
      <InfoPageHero
        eyebrow="İletişim"
        title={
          <>
            Bize <span className="text-gradient-gold">ulaşın</span>
          </>
        }
        description="Sorularınız, özel siparişleriniz veya servis randevularınız için her zaman buradayız."
      />

      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-5">
            <InfoCard title="Adres">
              <p>
                {SITE.address.line}
                <br />
                {SITE.address.district} / {SITE.address.city}
              </p>
            </InfoCard>

            <div className="grid gap-5 sm:grid-cols-2">
              <ContactCard
                icon="✆"
                label="Telefon"
                value={SITE.phone}
                href={`tel:${SITE.phone.replace(/\D/g, "")}`}
              />
              <ContactCard
                icon="✉"
                label="E-posta"
                value={SITE.email}
                href={`mailto:${SITE.email}`}
              />
              <ContactCard
                icon="💬"
                label="WhatsApp"
                value="Hızlı yanıt"
                href={whatsappLink()}
                external
                accent
              />
              <ContactCard
                icon="📷"
                label="Instagram"
                value="@galaksimotor"
                href={SITE.social.instagram}
                external
              />
            </div>

            <InfoCard title="Çalışma Saatleri">
              <ul className="grid gap-2 sm:grid-cols-3">
                <li className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-[11px] uppercase tracking-wider text-white/40">
                    Hafta İçi
                  </div>
                  <div className="text-sm text-white">
                    {SITE.hours.weekdays}
                  </div>
                </li>
                <li className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-[11px] uppercase tracking-wider text-white/40">
                    Cumartesi
                  </div>
                  <div className="text-sm text-white">
                    {SITE.hours.saturday}
                  </div>
                </li>
                <li className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-[11px] uppercase tracking-wider text-white/40">
                    Pazar
                  </div>
                  <div className="text-sm text-white">{SITE.hours.sunday}</div>
                </li>
              </ul>
            </InfoCard>
          </div>

          <div className="space-y-6">
            <ContactForm />
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-md">
              <iframe
                src={SITE.address.mapEmbed}
                className="h-[320px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Konum"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ContactCard({
  icon,
  label,
  value,
  href,
  external,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  href: string;
  external?: boolean;
  accent?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`group flex items-center gap-3 rounded-2xl border p-4 backdrop-blur-md transition ${
        accent
          ? "border-emerald-400/30 bg-emerald-500/10 hover:border-emerald-400/60"
          : "border-white/10 bg-white/[0.025] hover:border-brand-yellow/40"
      }`}
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg ring-1 ${
          accent
            ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30"
            : "bg-brand-yellow/10 text-brand-yellow ring-brand-yellow/20"
        }`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-white/45">
          {label}
        </div>
        <div className="truncate text-sm font-medium text-white group-hover:text-brand-yellow">
          {value}
        </div>
      </div>
    </a>
  );
}
