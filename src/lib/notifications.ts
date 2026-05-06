import type { Order, Appointment, Service, User } from "@prisma/client";
import { OrderStatus, AppointmentStatus } from "@prisma/client";
import { sendMail, sendAdminMail, getEmailTemplate, renderTemplate } from "@/lib/mail";
import { getSettings, st } from "@/lib/site-settings";
import { SITE } from "@/config/site";

// ─── Sipariş durumu fallback şablonları ──────────────────────────────────────

const ORDER_FALLBACK: Record<
  OrderStatus,
  { subject: string; body: string }
> = {
  PENDING: {
    subject: "Siparişin alındı — #{{orderNumber}}",
    body: defaultOrderBody(
      "Siparişin alındı",
      "Siparişin sistemimize ulaştı. Ödemeniz onaylandığında hazırlığa başlanacaktır."
    ),
  },
  PREPARING: {
    subject: "Siparişin hazırlanıyor — #{{orderNumber}}",
    body: defaultOrderBody(
      "Siparişin hazırlanıyor",
      "Ürünler depodan toplanıyor. Kargoya verildiğinde tekrar bilgilendireceğiz."
    ),
  },
  SHIPPED: {
    subject: "Siparişin kargoya verildi — #{{orderNumber}}",
    body: defaultOrderBody(
      "Kargoda 🚚",
      "Siparişin yola çıktı. Aşağıdaki kargo takip linkinden anlık durumu görebilirsin.<br/><br/><strong>Takip No:</strong> {{trackingNumber}}<br/><a href=\"{{trackingUrl}}\" style=\"display:inline-block;margin-top:10px;background:#FFD700;color:#000;padding:10px 22px;text-decoration:none;border-radius:6px;font-weight:bold\">Kargomu Takip Et →</a>"
    ),
  },
  DELIVERED: {
    subject: "Siparişin teslim edildi — #{{orderNumber}}",
    body: defaultOrderBody(
      "Teslim edildi 🎉",
      "Siparişin elinize ulaştı. Memnuniyetin bizim için çok değerli — istersen ürünleri değerlendirebilirsin."
    ),
  },
  CANCELLED: {
    subject: "Siparişin iptal edildi — #{{orderNumber}}",
    body: defaultOrderBody(
      "İptal edildi",
      "Siparişin iptal edildi. Ödeme yapıldıysa iade süreci başlatılmıştır. Sorularınız için bize ulaşabilirsiniz."
    ),
  },
};

function defaultOrderBody(heading: string, message: string): string {
  return `<div style="font-family:sans-serif;max-width:560px;color:#1a1a1a">
  <h2 style="margin:0 0 12px;color:#0a0a0a">${heading}</h2>
  <p>Merhaba {{customerName}},</p>
  <p>${message}</p>
  <p style="background:#fffbe5;padding:14px 18px;border-radius:8px">
    <strong>Sipariş No:</strong> {{orderNumber}}<br/>
    <strong>Toplam:</strong> {{totalText}}
  </p>
  <p style="color:#888;font-size:12px;margin-top:32px">Galaksi Motor — bu e-posta otomatik olarak gönderildi.</p>
</div>`;
}

// ─── Randevu durumu fallback şablonları ──────────────────────────────────────

const APPT_FALLBACK: Record<
  AppointmentStatus,
  { subject: string; body: string }
> = {
  PENDING: {
    subject: "Randevu talebin alındı — {{serviceName}}",
    body: defaultApptBody(
      "Randevu talebin alındı",
      "Randevu talebin alındı. Onaylandığında tekrar bilgilendireceğiz."
    ),
  },
  CONFIRMED: {
    subject: "Randevun onaylandı — {{serviceName}} · {{dateLabel}}",
    body: defaultApptBody(
      "Randevun onaylandı ✅",
      "Randevun onaylandı. Belirtilen tarih ve saatte ekibimiz seni bekliyor olacak."
    ),
  },
  COMPLETED: {
    subject: "Hizmet tamamlandı — {{serviceName}}",
    body: defaultApptBody(
      "Hizmet tamamlandı 🎉",
      "Randevunuz tamamlandı. Memnuniyetin bizim için çok değerli, geri bildirimini bekliyoruz."
    ),
  },
  CANCELLED: {
    subject: "Randevun iptal edildi — {{serviceName}}",
    body: defaultApptBody(
      "Randevu iptal edildi",
      "Randevun iptal edildi. Yeniden randevu almak istersen sayfamızdan kolayca yapabilirsin."
    ),
  },
};

function defaultApptBody(heading: string, message: string): string {
  return `<div style="font-family:sans-serif;max-width:560px;color:#1a1a1a">
  <h2 style="margin:0 0 12px;color:#0a0a0a">${heading}</h2>
  <p>Merhaba {{customerName}},</p>
  <p>${message}</p>
  <p style="background:#fffbe5;padding:14px 18px;border-radius:8px">
    <strong>Hizmet:</strong> {{serviceName}}<br/>
    <strong>Tarih:</strong> {{dateLabel}}
  </p>
  <p style="color:#888;font-size:12px;margin-top:32px">Galaksi Motor — bu e-posta otomatik olarak gönderildi.</p>
</div>`;
}

// ─── Kargo takip URL şablonu ─────────────────────────────────────────────────

async function getTrackingUrl(trackingNumber: string | null): Promise<string> {
  if (!trackingNumber) return "";
  const bag = await getSettings(["cargo_tracking_url_template"]);
  const tpl = st(
    bag,
    "cargo_tracking_url_template",
    "https://www.google.com/search?q=kargo+takip+{{trackingNumber}}"
  );
  return renderTemplate(tpl, { trackingNumber });
}

const fmtTRY = (n: number) =>
  Number(n).toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

// ─── Sipariş durum değişikliği e-postası ─────────────────────────────────────

export async function sendOrderStatusMail(
  order: Order & { user: User }
): Promise<void> {
  const to = order.user.email;
  if (!to) return;
  const fallback = ORDER_FALLBACK[order.status];
  const tplKey = `order_status_${order.status.toLowerCase()}`;
  const tpl = await getEmailTemplate(tplKey, fallback);

  const trackingUrl = await getTrackingUrl(order.trackingNumber);
  const vars: Record<string, string | number> = {
    customerName: order.user.name ?? to,
    orderNumber: order.orderNumber,
    totalText: fmtTRY(Number(order.total)),
    trackingNumber: order.trackingNumber ?? "—",
    trackingUrl: trackingUrl || "#",
  };

  await sendMail(
    to,
    renderTemplate(tpl.subject, vars),
    renderTemplate(tpl.body, vars)
  );
}

// ─── Randevu durum değişikliği e-postası ─────────────────────────────────────

export async function sendAppointmentStatusMail(
  appt: Appointment & { service: Service; user: User }
): Promise<void> {
  const to = appt.user.email;
  if (!to) return;
  const fallback = APPT_FALLBACK[appt.status];
  const tplKey = `appointment_status_${appt.status.toLowerCase()}`;
  const tpl = await getEmailTemplate(tplKey, fallback);

  const dateLabel = appt.scheduledAt.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const vars: Record<string, string | number> = {
    customerName: appt.user.name ?? to,
    serviceName: appt.service.name,
    duration: appt.service.duration,
    dateLabel,
  };

  await sendMail(
    to,
    renderTemplate(tpl.subject, vars),
    renderTemplate(tpl.body, vars)
  );
}

// ─── Kritik stok uyarısı (admin'e) ───────────────────────────────────────────

export async function sendLowStockAlert(input: {
  productName: string;
  productSlug: string;
  stock: number;
  threshold: number;
}): Promise<void> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ??
    "http://localhost:3000";

  const subject = `⚠ Stok Azalıyor: ${input.productName}`;
  const html = `
    <div style="font-family:sans-serif;max-width:520px;color:#1a1a1a">
      <h2 style="color:#cc0000;margin:0 0 12px">Kritik Stok Uyarısı</h2>
      <p><strong>${input.productName}</strong> için stok kritik seviyenin altına düştü.</p>
      <p style="background:#fff4e5;padding:14px 18px;border-radius:8px">
        <strong>Kalan Stok:</strong> ${input.stock} adet<br/>
        <strong>Eşik:</strong> ${input.threshold}
      </p>
      <p style="margin-top:18px">
        <a href="${siteUrl}/urun/${input.productSlug}"
           style="display:inline-block;background:#FFD700;color:#000;padding:10px 22px;text-decoration:none;border-radius:6px;font-weight:bold">
          Ürünü Gör →
        </a>
      </p>
      <p style="color:#888;font-size:12px;margin-top:24px">${SITE.name} — otomatik bildirim</p>
    </div>
  `;
  await sendAdminMail(subject, html);
}
