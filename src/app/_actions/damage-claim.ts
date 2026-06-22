"use server";

import { headers } from "next/headers";
import { ClaimType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity-log";
import { sendEmail, FROM_ADDRESS } from "@/lib/mail";
import {
  damageClaimConfirmationTemplate,
  damageClaimAdminAlertTemplate,
} from "@/lib/email-templates";
import { SITE } from "@/config/site";

export type DamageClaimInput = {
  type: "DEGER_KAYBI" | "HASAR_IHBAR" | "HER_IKISI";
  fullName: string;
  phone: string;
  email?: string;
  tcNo?: string;
  plate?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  accidentDate?: string; // YYYY-MM-DD
  faultStatus?: string;
  description?: string;
};

export type DamageClaimResult =
  | { ok: true; claimNumber: string; message: string }
  | { ok: false; error: string };

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function genClaimNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `HD-${year}-${rand}`;
}

export async function submitDamageClaim(
  input: DamageClaimInput
): Promise<DamageClaimResult> {
  // ── Doğrulama ──
  const fullName = input.fullName?.trim();
  const phone = input.phone?.trim();
  const email = input.email?.trim().toLowerCase() || null;

  if (!fullName || fullName.length < 3) {
    return { ok: false, error: "Lütfen ad soyad girin." };
  }
  if (!phone || phone.replace(/\D/g, "").length < 10) {
    return { ok: false, error: "Geçerli bir telefon numarası girin." };
  }
  if (email && !EMAIL_RX.test(email)) {
    return { ok: false, error: "Geçerli bir e-posta adresi girin." };
  }
  const validTypes: DamageClaimInput["type"][] = [
    "DEGER_KAYBI",
    "HASAR_IHBAR",
    "HER_IKISI",
  ];
  const type = validTypes.includes(input.type) ? input.type : "DEGER_KAYBI";
  if (input.description && input.description.length > 3000) {
    return { ok: false, error: "Açıklama çok uzun (max 3000 karakter)." };
  }

  // ── Rate limit (IP başına 5 dk'da 3 başvuru) ──
  let ip = "anon";
  try {
    ip = headers().get("x-forwarded-for")?.split(",")[0].trim() ?? "anon";
  } catch {
    /* server action context */
  }
  const rl = rateLimit(`claim:${ip}`, { limit: 3, windowMs: 5 * 60 * 1000 });
  if (!rl.ok) {
    return {
      ok: false,
      error: `Çok fazla başvuru gönderdiniz. ${rl.retryAfterSec} saniye sonra tekrar deneyin.`,
    };
  }

  // ── Araç yılı parse ──
  let vehicleYear: number | null = null;
  if (input.vehicleYear?.trim()) {
    const y = parseInt(input.vehicleYear.trim(), 10);
    if (!isNaN(y) && y >= 1950 && y <= new Date().getFullYear() + 1) {
      vehicleYear = y;
    }
  }
  let accidentDate: Date | null = null;
  if (input.accidentDate?.trim()) {
    const d = new Date(input.accidentDate.trim());
    if (!isNaN(d.getTime())) accidentDate = d;
  }

  // ── Benzersiz dosya no üret (çakışmaya karşı 3 deneme) ──
  let claimNumber = genClaimNumber();
  for (let i = 0; i < 3; i++) {
    const exists = await prisma.damageClaim.findUnique({
      where: { claimNumber },
      select: { id: true },
    });
    if (!exists) break;
    claimNumber = genClaimNumber();
  }

  const claim = await prisma.damageClaim.create({
    data: {
      claimNumber,
      type: type as ClaimType,
      fullName,
      phone,
      email,
      tcNo: input.tcNo?.trim() || null,
      plate: input.plate?.trim().toUpperCase() || null,
      vehicleBrand: input.vehicleBrand?.trim() || null,
      vehicleModel: input.vehicleModel?.trim() || null,
      vehicleYear,
      accidentDate,
      faultStatus: input.faultStatus?.trim() || null,
      description: input.description?.trim() || null,
    },
  });

  await logActivity(email ?? phone, "damage_claim_create", `claim:${claim.id}`, {
    claimNumber,
    type,
    fullName,
  });

  // ── Bildirim e-postaları (akışı bloklamaz) ──
  const adminEmail = process.env.ADMIN_EMAIL ?? FROM_ADDRESS;
  const vehicle =
    [input.vehicleBrand, input.vehicleModel, vehicleYear]
      .filter(Boolean)
      .join(" ") || null;

  const adminTpl = damageClaimAdminAlertTemplate({
    claimNumber,
    type,
    fullName,
    phone,
    email,
    plate: claim.plate,
    vehicle,
    accidentDate: accidentDate ? accidentDate.toLocaleDateString("tr-TR") : null,
    faultStatus: claim.faultStatus,
    description: claim.description,
    adminUrl: `${SITE.url}/admin/hasar-dosyalari/${claim.id}`,
  });
  void sendEmail({
    to: adminEmail,
    subject: adminTpl.subject,
    html: adminTpl.html,
    replyTo: email ?? undefined,
    category: "damage_claim_admin",
    actor: email ?? phone,
  });

  if (email) {
    const custTpl = damageClaimConfirmationTemplate({
      customerName: fullName,
      claimNumber,
      type,
    });
    void sendEmail({
      to: email,
      subject: custTpl.subject,
      html: custTpl.html,
      category: "damage_claim_customer",
      actor: email,
    });
  }

  return {
    ok: true,
    claimNumber,
    message: `Başvurunuz alındı. Dosya numaranız: ${claimNumber}. Ekibimiz en kısa sürede sizi arayacak.`,
  };
}
