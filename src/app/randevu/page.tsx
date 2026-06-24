import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings, st } from "@/lib/site-settings";
import { getWorkingHours, type WorkingHours } from "@/lib/working-hours";
import { AppointmentClient } from "./AppointmentClient";
import { buildPageMetadata } from "@/lib/page-meta";
import { SITE } from "@/config/site";

// Servisler nadiren değişir — sayfa 5 dakikada bir yenilenir
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/randevu", {
    title: "Motosiklet Servisi & Tamir Randevusu — Küçükçekmece | Galaksi Motor",
    description:
      "Küçükçekmece / İstanbul'da motosiklet bakım, onarım ve tamir için online servis randevusu alın. 10+ yıl tecrübeli uzman ekip, sıra beklemeden randevu.",
  });
}

/* ── Misafir kullanıcılar için kamuya açık landing sayfası ─────────────── */
async function RandevuGuestView({
  services,
  workingHours,
}: {
  services: { id: string; name: string; description: string | null; duration: number; price: number | null }[];
  workingHours: WorkingHours;
}) {
  const fmt = (n: number) =>
    n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-black via-black to-brand-yellow/5 py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,215,0,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.07) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <span className="mb-4 inline-block text-xs font-medium uppercase tracking-[0.3em] text-brand-yellow/70">
            Servis Randevusu
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Motorun için{" "}
            <span className="bg-gradient-to-r from-brand-yellow to-amber-400 bg-clip-text text-transparent">
              randevu al
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/60">
            Online randevu sistemiyle sıra beklemeden, dakikalar içinde gününü
            ayarla. Uzman ekibimiz Küçükçekmece'de seni karşılasın.
          </p>
        </div>
      </div>

      {/* Hizmetler */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="mb-2 text-center text-2xl font-bold text-white">
          Sunduğumuz Servisler
        </h2>
        <p className="mb-10 text-center text-sm text-white/50">
          Aşağıdaki hizmetlerden birini seçerek randevunu oluşturabilirsin.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md"
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-white">{svc.name}</h3>
                <span className="shrink-0 text-sm font-bold text-brand-yellow">
                  {svc.price && svc.price > 0 ? fmt(svc.price) : "Ücretsiz"}
                </span>
              </div>
              {svc.description && (
                <p className="mt-1 text-xs leading-relaxed text-white/55">
                  {svc.description}
                </p>
              )}
              <p className="mt-3 text-[11px] text-white/35">⏱ {svc.duration} dakika</p>
            </div>
          ))}
        </div>

        {/* Login CTA */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <p className="text-sm text-white/55">
            Randevu almak için giriş yapman gerekiyor.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/giris?callbackUrl=/randevu"
              className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-7 py-3.5 text-sm font-semibold text-brand-black shadow-[0_18px_40px_-12px_rgba(255,215,0,0.5)] transition hover:shadow-[0_24px_50px_-10px_rgba(255,215,0,0.8)]"
            >
              Giriş Yap & Randevu Al
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
            <Link
              href="/kayit?callbackUrl=/randevu"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-medium text-white transition hover:border-brand-yellow/50 hover:text-brand-yellow"
            >
              Hesap Oluştur
            </Link>
          </div>
        </div>
      </section>

      {/* Neden online randevu */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              icon: "📅",
              title: "Sıra beklemezsin",
              desc: "Dilediğin gün ve saati seç, doğrudan randevu oluştur.",
            },
            {
              icon: "📱",
              title: "SMS ile bildirim",
              desc: "Randevun onaylandığında SMS ile haberdar edilirsin.",
            },
            {
              icon: "🔧",
              title: "Uzman ekip",
              desc: `${workingHours.weekdaysText} arası ${SITE.address.district}'de hizmetinizdeyiz.`,
            },
          ].map((f) => (
            <div
              key={f.title}
              className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-md"
            >
              <span className="text-2xl">{f.icon}</span>
              <div>
                <h4 className="text-sm font-semibold text-white">{f.title}</h4>
                <p className="mt-1 text-xs text-white/50">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ── Ana sayfa bileşeni ──────────────────────────────────────────────────── */
export default async function RandevuPage() {
  const [session, services, bag, workingHours] = await Promise.all([
    getServerSession(authOptions),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { duration: "asc" },
    }),
    getSettings([
      "appt_hero_eyebrow",
      "appt_hero_title1",
      "appt_hero_title2",
      "appt_hero_desc",
      "appt_sec1_title",
      "appt_sec2_title",
      "appt_sec3_title",
      "appt_sec4_title",
      "appt_field_brand",
      "appt_field_model",
      "appt_field_note",
      "appt_summary_title",
      "appt_row_service",
      "appt_row_duration",
      "appt_row_date",
      "appt_row_time",
      "appt_row_fee",
      "appt_free",
      "appt_btn_confirm",
      "appt_btn_submitting",
      "appt_sms_note",
      "appt_emergency_note",
      "appt_emergency_link",
      "appt_emergency_suffix",
    ]),
    getWorkingHours(),
  ]);

  // Oturum açılmamışsa genel landing sayfası göster (Google indexlenebilir)
  if (!session?.user) {
    return (
      <RandevuGuestView
        workingHours={workingHours}
        services={services.map((svc) => ({
          id: svc.id,
          name: svc.name,
          description: svc.description,
          duration: svc.duration,
          price: svc.price ? Number(svc.price) : null,
        }))}
      />
    );
  }

  return (
    <AppointmentClient
      workingHours={workingHours}
      services={services.map((svc) => ({
        id: svc.id,
        slug: svc.slug,
        name: svc.name,
        description: svc.description,
        duration: svc.duration,
        price: svc.price ? Number(svc.price) : null,
      }))}
      settings={{
        heroEyebrow: st(bag, "appt_hero_eyebrow", "Servis Randevusu"),
        heroTitle1: st(bag, "appt_hero_title1", "Motorun için"),
        heroTitle2: st(bag, "appt_hero_title2", "randevu al"),
        heroDesc: st(
          bag,
          "appt_hero_desc",
          "Online randevu sistemiyle sıra beklemeden, dakikalar içinde gününü ayarla."
        ),
        sec1Title: st(bag, "appt_sec1_title", "Servis seç"),
        sec2Title: st(bag, "appt_sec2_title", "Tarih seç"),
        sec3Title: st(bag, "appt_sec3_title", "Saat seç"),
        sec4Title: st(bag, "appt_sec4_title", "Motor bilgisi (opsiyonel)"),
        fieldBrand: st(bag, "appt_field_brand", "Marka"),
        fieldModel: st(bag, "appt_field_model", "Model"),
        fieldNote: st(bag, "appt_field_note", "Not"),
        summaryTitle: st(bag, "appt_summary_title", "Randevu Özeti"),
        rowService: st(bag, "appt_row_service", "Servis"),
        rowDuration: st(bag, "appt_row_duration", "Süre"),
        rowDate: st(bag, "appt_row_date", "Tarih"),
        rowTime: st(bag, "appt_row_time", "Saat"),
        rowFee: st(bag, "appt_row_fee", "Ücret"),
        freeLabel: st(bag, "appt_free", "Ücretsiz"),
        btnConfirm: st(bag, "appt_btn_confirm", "Randevuyu Onayla"),
        btnSubmitting: st(bag, "appt_btn_submitting", "Gönderiliyor..."),
        smsNote: st(
          bag,
          "appt_sms_note",
          "Onaylandığında SMS ile bildireceğiz."
        ),
        emergencyNote: st(
          bag,
          "appt_emergency_note",
          "💡 Acil durumlar için"
        ),
        emergencyLink: st(bag, "appt_emergency_link", "iletişim"),
        emergencySuffix: st(
          bag,
          "appt_emergency_suffix",
          "sayfasından bize ulaşabilirsin."
        ),
      }}
    />
  );
}
