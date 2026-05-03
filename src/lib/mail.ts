import nodemailer from "nodemailer";

// ─── Sipariş onay e-postası (mevcut stub, değişmedi) ─────────────────────────

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

export async function sendAdminMail(subject: string, html: string) {
  const transport = createTransport();
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!transport || !adminEmail) {
    console.log(`📧 [MAIL STUB] Konu: "${subject}" → ${adminEmail ?? "(ADMIN_EMAIL tanımsız)"}`);
    return;
  }

  await transport.sendMail({
    from: `"Galaksi Motor" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject,
    html,
  });
}