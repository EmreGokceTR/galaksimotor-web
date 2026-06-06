/**
 * Galaksi Motor kurumsal e-posta şablonları.
 * Renk paleti: brand-yellow #FFD700, brand-black #000000, ivory #fdfdf6.
 * Tüm şablonlar mobile-first responsive (max-width 600px), inline CSS.
 */

import { SITE } from "@/config/site";

const fmtTRY = (n: number) =>
  Number(n).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  });

// ─── Ortak Layout ────────────────────────────────────────────────────────────

function shell(opts: {
  preheader: string;
  heading: string;
  intro?: string;
  body: string;
  ctaUrl?: string;
  ctaLabel?: string;
}): string {
  return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(opts.heading)}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <span style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${escapeHtml(opts.preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#0f0f0f;border:1px solid rgba(255,215,0,0.18);border-radius:16px;overflow:hidden">
        <!-- HEADER -->
        <tr><td style="background:linear-gradient(135deg,#000 0%,#1a1a1a 100%);border-bottom:2px solid #FFD700;padding:24px 28px">
          <table width="100%"><tr>
            <td style="vertical-align:middle">
              <div style="font-family:'Segoe UI',Arial,sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#fff">
                Galaksi <span style="color:#FFD700">Motor</span>
              </div>
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,215,0,0.7);margin-top:2px">
                Yedek Parça · Aksesuar · Servis
              </div>
            </td>
            <td align="right" style="vertical-align:middle;font-size:11px;color:rgba(255,255,255,0.4)">
              ${new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}
            </td>
          </tr></table>
        </td></tr>

        <!-- BODY -->
        <tr><td style="padding:36px 28px 24px;color:#e5e5e5">
          <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#FFD700;font-weight:700">${escapeHtml(opts.heading)}</h1>
          ${opts.intro ? `<p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:rgba(255,255,255,0.75)">${opts.intro}</p>` : ""}
          ${opts.body}
          ${
            opts.ctaUrl && opts.ctaLabel
              ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px"><tr><td align="left">
                  <a href="${opts.ctaUrl}" style="display:inline-block;background:#FFD700;color:#000;text-decoration:none;padding:13px 28px;border-radius:999px;font-weight:700;font-size:14px;letter-spacing:0.3px">
                    ${escapeHtml(opts.ctaLabel)}
                  </a>
                </td></tr></table>`
              : ""
          }
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="padding:20px 28px 28px;border-top:1px solid rgba(255,255,255,0.08);background:#0a0a0a">
          <table width="100%"><tr>
            <td style="font-size:11px;color:rgba(255,255,255,0.45);line-height:1.7">
              <strong style="color:#FFD700">${escapeHtml(SITE.name)}</strong><br/>
              ${escapeHtml(SITE.address.line)}, ${escapeHtml(SITE.address.district)} / ${escapeHtml(SITE.address.city)}<br/>
              ${escapeHtml(SITE.phone)} · <a href="mailto:${SITE.email}" style="color:#FFD700;text-decoration:none">${SITE.email}</a>
            </td>
          </tr></table>
          <p style="margin:14px 0 0;font-size:10px;color:rgba(255,255,255,0.3);line-height:1.5">
            Bu e-posta size, Galaksi Motor üzerinde gerçekleştirdiğiniz işleme yanıt olarak gönderilmiştir.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function statRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 12px 8px 0;font-size:12px;color:rgba(255,255,255,0.5);white-space:nowrap;border-bottom:1px solid rgba(255,255,255,0.05)">${escapeHtml(label)}</td>
    <td style="padding:8px 0;font-size:13px;color:#fff;font-weight:600;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right">${value}</td>
  </tr>`;
}

// ─── Sipariş Onay (Müşteri) ─────────────────────────────────────────────────

export type OrderEmailItem = { name: string; quantity: number; price: number };

export function orderConfirmationTemplate(input: {
  customerName: string;
  orderNumber: string;
  items: OrderEmailItem[];
  subtotal: number;
  shippingFee: number;
  discount?: number;
  total: number;
  trackOrderUrl: string;
}): { subject: string; html: string } {
  const itemsRows = input.items
    .map(
      (it) => `<tr>
      <td style="padding:10px 8px;font-size:13px;color:#fff;border-bottom:1px solid rgba(255,255,255,0.06)">${escapeHtml(it.name)}</td>
      <td align="center" style="padding:10px 8px;font-size:13px;color:rgba(255,255,255,0.7);border-bottom:1px solid rgba(255,255,255,0.06)">×${it.quantity}</td>
      <td align="right" style="padding:10px 8px;font-size:13px;color:#FFD700;font-weight:600;border-bottom:1px solid rgba(255,255,255,0.06)">${fmtTRY(it.price * it.quantity)}</td>
    </tr>`
    )
    .join("");

  const totals = `<table width="100%" style="margin-top:14px">
    ${statRow("Ara Toplam", fmtTRY(input.subtotal))}
    ${statRow("Kargo", input.shippingFee === 0 ? "Ücretsiz" : fmtTRY(input.shippingFee))}
    ${input.discount && input.discount > 0 ? statRow("İndirim", `-${fmtTRY(input.discount)}`) : ""}
    <tr>
      <td style="padding:14px 12px 0 0;font-size:12px;color:rgba(255,215,0,0.8);text-transform:uppercase;letter-spacing:1px">Toplam</td>
      <td align="right" style="padding:14px 0 0;font-size:20px;color:#FFD700;font-weight:800">${fmtTRY(input.total)}</td>
    </tr>
  </table>`;

  const body = `
    <div style="background:#0a0a0a;border:1px solid rgba(255,215,0,0.2);border-radius:12px;padding:18px 16px;margin-bottom:18px">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,215,0,0.7);margin-bottom:4px">Sipariş Numarası</div>
      <div style="font-size:18px;font-weight:700;color:#fff;font-family:'Courier New',monospace">#${escapeHtml(input.orderNumber)}</div>
    </div>
    <table width="100%" style="border-collapse:collapse">
      <thead><tr>
        <th align="left" style="padding:10px 8px;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.4);border-bottom:1px solid rgba(255,215,0,0.25)">Ürün</th>
        <th align="center" style="padding:10px 8px;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.4);border-bottom:1px solid rgba(255,215,0,0.25)">Adet</th>
        <th align="right" style="padding:10px 8px;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.4);border-bottom:1px solid rgba(255,215,0,0.25)">Tutar</th>
      </tr></thead>
      <tbody>${itemsRows}</tbody>
    </table>
    ${totals}
  `;

  return {
    subject: `Siparişiniz alındı — #${input.orderNumber}`,
    html: shell({
      preheader: `Siparişiniz başarıyla alındı. Toplam: ${fmtTRY(input.total)}`,
      heading: "Siparişiniz alındı 🎉",
      intro: `Merhaba <strong>${escapeHtml(input.customerName)}</strong>, siparişiniz başarıyla oluşturuldu. Hazırlanır hazırlanmaz size haber vereceğiz.`,
      body,
      ctaUrl: input.trackOrderUrl,
      ctaLabel: "Siparişi Takip Et",
    }),
  };
}

// ─── Randevu Bildirimi (Müşteri) ─────────────────────────────────────────────

export function appointmentConfirmationTemplate(input: {
  customerName: string;
  serviceName: string;
  duration: number;
  scheduledAt: Date;
  motoLabel?: string;
  note?: string;
}): { subject: string; html: string } {
  const day = input.scheduledAt.toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = input.scheduledAt.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const body = `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px"><tr>
      <td align="center" style="background:linear-gradient(135deg,#FFD700 0%,#e6c200 100%);border-radius:16px;padding:24px;color:#000">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700;opacity:0.7">Randevu Tarihi</div>
        <div style="font-size:28px;font-weight:800;margin-top:6px;line-height:1.1">${escapeHtml(day)}</div>
        <div style="font-size:36px;font-weight:800;margin-top:4px;letter-spacing:2px">${escapeHtml(time)}</div>
      </td>
    </tr></table>
    <table width="100%" style="border-collapse:collapse;background:#0a0a0a;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden">
      ${statRow("Hizmet", escapeHtml(input.serviceName))}
      ${statRow("Süre", `${input.duration} dk`)}
      ${input.motoLabel ? statRow("Motosiklet", escapeHtml(input.motoLabel)) : ""}
      ${input.note ? statRow("Not", escapeHtml(input.note)) : ""}
    </table>
    <p style="margin:18px 0 0;font-size:13px;line-height:1.7;color:rgba(255,255,255,0.65)">
      Belirtilen saatte <strong style="color:#FFD700">${escapeHtml(SITE.address.district)}</strong> adresimizde sizi bekliyor olacağız.
      Değişiklik için lütfen <a href="tel:${SITE.phone.replace(/\D/g, "")}" style="color:#FFD700">${escapeHtml(SITE.phone)}</a> üzerinden bize ulaşın.
    </p>
  `;

  return {
    subject: `Randevunuz alındı — ${input.serviceName} (${day} ${time})`,
    html: shell({
      preheader: `${input.serviceName} randevunuz ${day} saat ${time} için alındı.`,
      heading: "Randevunuz alındı ✅",
      intro: `Merhaba <strong>${escapeHtml(input.customerName)}</strong>, randevu talebiniz tarafımıza ulaştı. Onaylandığında ayrıca bilgilendireceğiz.`,
      body,
    }),
  };
}

// ─── Randevu Bildirimi (Admin) ───────────────────────────────────────────────

export function appointmentAdminAlertTemplate(input: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceName: string;
  duration: number;
  scheduledAt: Date;
  motoLabel?: string;
  note?: string;
  adminUrl: string;
}): { subject: string; html: string } {
  const dateLabel = input.scheduledAt.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const body = `
    <table width="100%" style="border-collapse:collapse;background:#0a0a0a;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;margin-bottom:8px">
      ${statRow("Müşteri", escapeHtml(input.customerName))}
      ${statRow("E-posta", escapeHtml(input.customerEmail))}
      ${input.customerPhone ? statRow("Telefon", escapeHtml(input.customerPhone)) : ""}
      ${statRow("Hizmet", `${escapeHtml(input.serviceName)} (${input.duration} dk)`)}
      ${statRow("Tarih / Saat", escapeHtml(dateLabel))}
      ${input.motoLabel ? statRow("Motor", escapeHtml(input.motoLabel)) : ""}
      ${input.note ? statRow("Not", escapeHtml(input.note)) : ""}
    </table>
  `;

  return {
    subject: `Yeni Randevu: ${input.serviceName} — ${dateLabel}`,
    html: shell({
      preheader: `${input.customerName} ${dateLabel} için randevu aldı.`,
      heading: "Yeni randevu talebi 🔔",
      intro: "Sistemde yeni bir randevu kaydı oluştu. Detayları aşağıdadır.",
      body,
      ctaUrl: input.adminUrl,
      ctaLabel: "Admin Panelinde Gör",
    }),
  };
}

// ─── İletişim Formu (Müşteri Teyit) ──────────────────────────────────────────

export function contactConfirmationTemplate(input: {
  customerName: string;
  message: string;
}): { subject: string; html: string } {
  const body = `
    <div style="background:#0a0a0a;border-left:3px solid #FFD700;padding:16px 18px;border-radius:8px;margin-bottom:18px">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,215,0,0.7);margin-bottom:8px">Bize ilettiğiniz mesaj</div>
      <p style="margin:0;font-size:14px;line-height:1.7;color:rgba(255,255,255,0.85);white-space:pre-line">${escapeHtml(input.message)}</p>
    </div>
    <p style="margin:0 0 8px;font-size:13px;line-height:1.7;color:rgba(255,255,255,0.65)">
      Genellikle 1 iş günü içinde dönüş yapıyoruz. Acil durumlar için
      <a href="tel:${SITE.phone.replace(/\D/g, "")}" style="color:#FFD700">${escapeHtml(SITE.phone)}</a> veya
      <a href="https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}" style="color:#FFD700">WhatsApp</a> üzerinden bize ulaşabilirsiniz.
    </p>
  `;

  return {
    subject: "Mesajınız alındı — Galaksi Motor",
    html: shell({
      preheader: "Bize ulaştığınız için teşekkürler. Yakında size dönüş yapacağız.",
      heading: "Mesajınız alındı 📬",
      intro: `Merhaba <strong>${escapeHtml(input.customerName)}</strong>, bize ulaştığınız için teşekkürler. Mesajınızı en kısa sürede inceleyip size geri dönüş yapacağız.`,
      body,
    }),
  };
}

// ─── İletişim Formu (Admin Uyarı) ────────────────────────────────────────────

export function contactAdminAlertTemplate(input: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject?: string;
  message: string;
}): { subject: string; html: string } {
  const body = `
    <table width="100%" style="border-collapse:collapse;background:#0a0a0a;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;margin-bottom:18px">
      ${statRow("Gönderen", escapeHtml(input.customerName))}
      ${statRow("E-posta", `<a href="mailto:${input.customerEmail}" style="color:#FFD700;text-decoration:none">${escapeHtml(input.customerEmail)}</a>`)}
      ${input.customerPhone ? statRow("Telefon", `<a href="tel:${input.customerPhone}" style="color:#FFD700;text-decoration:none">${escapeHtml(input.customerPhone)}</a>`) : ""}
      ${input.subject ? statRow("Konu", escapeHtml(input.subject)) : ""}
    </table>
    <div style="background:#1a1a1a;border-radius:12px;padding:18px;border:1px solid rgba(255,215,0,0.2)">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,215,0,0.7);margin-bottom:10px">Mesaj</div>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#fff;white-space:pre-line">${escapeHtml(input.message)}</p>
    </div>
  `;

  return {
    subject: `Yeni İletişim Mesajı: ${input.subject ?? input.customerName}`,
    html: shell({
      preheader: `${input.customerName} iletişim formu üzerinden yeni bir mesaj gönderdi.`,
      heading: "Yeni iletişim mesajı 📨",
      intro: "Web sitesi iletişim formu üzerinden yeni bir mesaj alındı.",
      body,
      ctaUrl: `mailto:${input.customerEmail}`,
      ctaLabel: "Yanıtla",
    }),
  };
}
