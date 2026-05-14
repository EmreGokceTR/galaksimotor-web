import nodemailer, { type Transporter } from "nodemailer";
import { getSettings, st } from "@/lib/site-settings";
import { logActivity } from "@/lib/activity-log";

// ─── Sabitler ────────────────────────────────────────────────────────────────

/** Tüm giden mailler bu adresten çıkar (Brevo + Zoho doğrulamalı). */
export const FROM_ADDRESS = "info@galaksimotor.com";
const FROM_NAME = "Galaksi Motor";

const FROM = `"${FROM_NAME}" <${FROM_ADDRESS}>`;

// ─── Transport (singleton) ───────────────────────────────────────────────────

let _transport: Transporter | null = null;
let _transportTried = false;

function getTransport(): Transporter | null {
  if (_transportTried) return _transport;
  _transportTried = true;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  // Brevo: SMTP_PASSWORD; legacy: SMTP_PASS
  const pass = process.env.SMTP_PASSWORD ?? process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn(
      "[mail] SMTP_HOST/SMTP_USER/SMTP_PASSWORD eksik — stub modda çalışıyor."
    );
    return null;
  }

  const port = Number(process.env.SMTP_PORT ?? 587);
  // Port 465 her zaman SSL (implicit TLS); SMTP_SECURE=true ile de override edilebilir
  const secure = port === 465 || process.env.SMTP_SECURE === "true";

  _transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
  });

  return _transport;
}

// ─── Çekirdek sendEmail (audit log + error handling) ─────────────────────────

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  /** Audit log'a etiket için. */
  category?: string;
  /** Cevap adresini özelleştirmek için (örn. iletişim formundan gelen kullanıcı). */
  replyTo?: string;
  /** Ek dosyalar (PDF fatura vb.). */
  attachments?: { filename: string; path?: string; content?: Buffer; contentType?: string }[];
  /** Audit log için aktör bilgisi (yoksa "system"). */
  actor?: string;
};

export type SendEmailResult =
  | { ok: true; messageId: string | null; sent: true }
  | { ok: true; messageId: null; sent: false; reason: "stub" }
  | { ok: false; error: string };

/**
 * Tüm sistem genelinde ortak mail gönderim fonksiyonu.
 * - SMTP yoksa stub modda çalışır (akış bloklanmaz).
 * - Başarı/hata ActivityLog'a `email_sent` / `email_failed` olarak yazılır.
 */
export async function sendEmail(
  input: SendEmailInput
): Promise<SendEmailResult> {
  const recipients = Array.isArray(input.to) ? input.to : [input.to];
  const cleanRecipients = recipients.filter(Boolean).join(", ");
  const actor = input.actor ?? "system";
  const category = input.category ?? "general";

  if (!cleanRecipients) {
    return { ok: false, error: "Alıcı boş." };
  }

  const transport = getTransport();
  if (!transport) {
    console.log(`📧 [MAIL STUB] [${category}] "${input.subject}" → ${cleanRecipients}`);
    await logActivity(actor, "email_stub", `email:${category}`, {
      to: cleanRecipients,
      subject: input.subject,
    });
    return { ok: true, messageId: null, sent: false, reason: "stub" };
  }

  try {
    const info = await transport.sendMail({
      from: FROM,
      to: cleanRecipients,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
      attachments: input.attachments,
    });

    await logActivity(actor, "email_sent", `email:${category}`, {
      to: cleanRecipients,
      subject: input.subject,
      messageId: info.messageId,
    });

    return { ok: true, messageId: info.messageId ?? null, sent: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bilinmeyen mail hatası";
    console.error(`[mail] gönderim hatası (${category}):`, e);
    await logActivity(actor, "email_failed", `email:${category}`, {
      to: cleanRecipients,
      subject: input.subject,
      error: msg,
    });
    return { ok: false, error: msg };
  }
}

// ─── Geriye dönük uyumluluk: eski API ────────────────────────────────────────

export async function sendMail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  await sendEmail({ to, subject, html });
}

export async function sendAdminMail(
  subject: string,
  html: string
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL ?? FROM_ADDRESS;
  await sendEmail({ to: adminEmail, subject, html, category: "admin" });
}

// ─── Şablon sistemi (siteSetting tabanlı, mevcut akışla uyumlu) ──────────────

/** {{key}} placeholder'larını render eder. */
export function renderTemplate(
  template: string,
  vars: Record<string, string | number>
): string {
  return Object.entries(vars).reduce(
    (acc, [k, v]) =>
      acc.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), String(v ?? "")),
    template
  );
}

export type EmailTemplate = { subject: string; body: string };

/** siteSetting'dan email_{key}_subject ve email_{key}_body okur. */
export async function getEmailTemplate(
  key: string,
  fallback: EmailTemplate
): Promise<EmailTemplate> {
  const subjectKey = `email_${key}_subject`;
  const bodyKey = `email_${key}_body`;
  const bag = await getSettings([subjectKey, bodyKey]);
  return {
    subject: st(bag, subjectKey, fallback.subject),
    body: st(bag, bodyKey, fallback.body),
  };
}

