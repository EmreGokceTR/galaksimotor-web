import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings, st } from "@/lib/site-settings";
import { AppointmentClient } from "./AppointmentClient";

export const metadata = { title: "Servis Randevusu - Galaksi Motor" };

export default async function RandevuPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/giris?callbackUrl=/randevu");
  }

  const [services, bag] = await Promise.all([
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
  ]);

  return (
    <AppointmentClient
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
        heroDesc: st(bag, "appt_hero_desc", "Online randevu sistemiyle sıra beklemeden, dakikalar içinde gününü ayarla."),
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
        smsNote: st(bag, "appt_sms_note", "Onaylandığında SMS ile bildireceğiz."),
        emergencyNote: st(bag, "appt_emergency_note", "💡 Acil durumlar için"),
        emergencyLink: st(bag, "appt_emergency_link", "iletişim"),
        emergencySuffix: st(bag, "appt_emergency_suffix", "sayfasından bize ulaşabilirsin."),
      }}
    />
  );
}
