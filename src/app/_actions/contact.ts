"use server";

import { headers } from "next/headers";
import { sendEmail, FROM_ADDRESS } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity-log";
import {
  contactConfirmationTemplate,
  contactAdminAlertTemplate,
} from "@/lib/email-templates";

export type ContactInput = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
};

export type ContactResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContactForm(
  input: ContactInput
): Promise<ContactResult> {
  // ── Validation ────────────────────────────────────────────────────────────
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const phone = input.phone?.trim();
  const subject = input.subject?.trim();
  const message = input.message?.trim();

  if (!name || name.length < 2) {
    return { ok: false, error: "Lütfen geçerli bir ad girin." };
  }
  if (!email || !EMAIL_RX.test(email)) {
    return { ok: false, error: "Geçerli bir e-posta adresi girin." };
  }
  if (!message || message.length < 10) {
    return { ok: false, error: "Mesajınız en az 10 karakter olmalı." };
  }
  if (message.length > 5000) {
    return { ok: false, error: "Mesaj çok uzun (max 5000 karakter)." };
  }

  // Honeypot — bot'lar genelde tüm alanları doldurur
  // (ileride form'a hidden field eklenebilir)

  // ── Rate Limit ────────────────────────────────────────────────────────────
  // IP başına 5 dakikada en fazla 3 mesaj
  let ip = "anon";
  try {
    const h = headers();
    ip = h.get("x-forwarded-for")?.split(",")[0].trim() ?? "anon";
  } catch {
    /* server action context */
  }
  const rl = rateLimit(`contact:${ip}`, { limit: 3, windowMs: 5 * 60 * 1000 });
  if (!rl.ok) {
    return {
      ok: false,
      error: `Çok fazla istek gönderdiniz. ${rl.retryAfterSec} saniye sonra tekrar deneyin.`,
    };
  }

  // ── Mail gönder (önce admin, sonra müşteri teyidi) ────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? FROM_ADDRESS;

  const adminTpl = contactAdminAlertTemplate({
    customerName: name,
    customerEmail: email,
    customerPhone: phone,
    subject,
    message,
  });
  const customerTpl = contactConfirmationTemplate({
    customerName: name,
    message,
  });

  const [adminRes, customerRes] = await Promise.all([
    sendEmail({
      to: adminEmail,
      subject: adminTpl.subject,
      html: adminTpl.html,
      replyTo: email,
      category: "contact_admin",
      actor: email,
    }),
    sendEmail({
      to: email,
      subject: customerTpl.subject,
      html: customerTpl.html,
      category: "contact_customer",
      actor: email,
    }),
  ]);

  await logActivity(email, "contact_submit", `contact:${email}`, {
    name,
    phone,
    subject,
    adminMail: adminRes.ok ? "sent" : "failed",
    customerMail: customerRes.ok ? "sent" : "failed",
  });

  if (!adminRes.ok && !customerRes.ok) {
    return {
      ok: false,
      error: "Mesajınız gönderilemedi. Lütfen tekrar deneyin.",
    };
  }

  return {
    ok: true,
    message: "Mesajınız alındı. En kısa sürede size dönüş yapacağız.",
  };
}
