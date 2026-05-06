import nodemailer from "nodemailer";
import { getSettings, st } from "@/lib/site-settings";

// ─── Sipariş onay e-postası (mevcut stub) ─────────────────────────────────────

type OrderEmailPayload = {
  to: string;
  orderNumber: string;
  customerName: string;
  total: number;
  itemCount: number;
};

export async function sendOrderConfirmation(p: OrderEmailPayload) {
  console.log("📧 [MAIL STUB] Sipariş onay e-postası");
  console.log(`   Alıcı: ${p.to}`);
  console.log(`   Sipariş: #${p.orderNumber}`);
  console.log(`   Müşteri: ${p.customerName}`);
  console.log(`   Tutar: ${p.total} ₺ · ${p.itemCount} ürün`);
  return { sent: false, reason: "stub" };
}

// ─── SMTP transport (Nodemailer) ──────────────────────────────────────────────
// Gerekli .env değişkenleri:
//   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, ADMIN_EMAIL

function createTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Belirli bir alıcıya SMTP üzerinden e-posta gönderir.
 * SMTP yapılandırması eksikse konsola log düşürür.
 */
export async function sendMail(to: string, subject: string, html: string) {
  const transport = createTransport();
  if (!transport) {
    console.log(`📧 [MAIL STUB] "${subject}" → ${to}`);
    return;
  }
  await transport.sendMail({
    from: `"Galaksi Motor" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

/** Admin'e (ADMIN_EMAIL) gönderir. */
export async function sendAdminMail(subject: string, html: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.log(
      `📧 [MAIL STUB] Admin maili atlandı (ADMIN_EMAIL yok): ${subject}`
    );
    return;
  }
  return sendMail(adminEmail, subject, html);
}

// ─── Şablon Sistemi ───────────────────────────────────────────────────────────

/** {{key}} şeklindeki yer tutucuları değişkenlerle değiştirir. */
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

/**
 * siteSetting tablosundan şablonu çeker.
 * Anahtar adlandırması: email_{key}_subject, email_{key}_body
 */
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

/** Şablonu çek + render et + admin'e gönder. */
export async function sendTemplatedAdminMail(
  key: string,
  fallback: EmailTemplate,
  vars: Record<string, string | number>
): Promise<void> {
  const tpl = await getEmailTemplate(key, fallback);
  const subject = renderTemplate(tpl.subject, vars);
  const body = renderTemplate(tpl.body, vars);
  await sendAdminMail(subject, body);
}
