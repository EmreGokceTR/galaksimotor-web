import nodemailer from "nodemailer";

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
    console.log(`📧 [MAIL STUB] Admin maili atlandı (ADMIN_EMAIL yok): ${subject}`);
    return;
  }
  return sendMail(adminEmail, subject, html);
}
