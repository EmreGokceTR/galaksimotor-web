import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import type { Order, OrderItem, User } from "@prisma/client";
import { getSettings, st } from "@/lib/site-settings";
import { SITE } from "@/config/site";

type OrderWithItems = Order & { items: OrderItem[]; user: User };

/** Türkçe karakterleri ASCII'ye çevirir (PDFKit Helvetica destekli olsun diye). */
function asciify(s: string): string {
  return s
    .replace(/Ç/g, "C")
    .replace(/ç/g, "c")
    .replace(/Ğ/g, "G")
    .replace(/ğ/g, "g")
    .replace(/İ/g, "I")
    .replace(/ı/g, "i")
    .replace(/Ö/g, "O")
    .replace(/ö/g, "o")
    .replace(/Ş/g, "S")
    .replace(/ş/g, "s")
    .replace(/Ü/g, "U")
    .replace(/ü/g, "u");
}

const fmt = (n: number): string =>
  asciify(
    Number(n).toLocaleString("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    })
  );

const ftDate = (d: Date): string =>
  asciify(
    d.toLocaleString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  );

// ─── Fatura ayarlarını siteSetting'den çek ───────────────────────────────────

type InvoiceSettings = {
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopEmail: string;
  taxOffice: string;
  taxNumber: string;
  iban: string;
};

async function getInvoiceSettings(): Promise<InvoiceSettings> {
  const bag = await getSettings([
    "invoice_shop_name",
    "invoice_shop_address",
    "invoice_shop_phone",
    "invoice_shop_email",
    "invoice_tax_office",
    "invoice_tax_number",
    "invoice_iban",
  ]);
  return {
    shopName: st(bag, "invoice_shop_name", SITE.name),
    shopAddress: st(
      bag,
      "invoice_shop_address",
      `${SITE.address.line}, ${SITE.address.district} / ${SITE.address.city}`
    ),
    shopPhone: st(bag, "invoice_shop_phone", SITE.phone),
    shopEmail: st(bag, "invoice_shop_email", SITE.email),
    taxOffice: st(bag, "invoice_tax_office", "—"),
    taxNumber: st(bag, "invoice_tax_number", "—"),
    iban: st(bag, "invoice_iban", "—"),
  };
}

// ─── PDF üretici ─────────────────────────────────────────────────────────────

/** Faturayı public/invoices/{orderNumber}.pdf altına yazar; relative URL döner. */
export async function generateAndStoreInvoice(
  order: OrderWithItems
): Promise<string> {
  const cfg = await getInvoiceSettings();
  const dir = path.join(process.cwd(), "public", "invoices");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filename = `${order.orderNumber}.pdf`;
  const filepath = path.join(dir, filename);

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const stream = fs.createWriteStream(filepath);
    stream.on("finish", () => resolve());
    stream.on("error", reject);
    doc.pipe(stream);

    // Üst bant
    doc.rect(0, 0, doc.page.width, 90).fill("#0a0a0a");
    doc
      .fillColor("#FFD700")
      .fontSize(22)
      .text(asciify(cfg.shopName.toUpperCase()), 40, 32, { align: "left" });
    doc
      .fillColor("#FFFFFF")
      .fontSize(9)
      .text(asciify(cfg.shopAddress), 40, 60, { width: 380 });
    doc
      .fillColor("#FFD700")
      .fontSize(18)
      .text("FATURA", 0, 38, { align: "right", width: doc.page.width - 40 });

    doc.fillColor("#000000");

    // Sipariş bilgileri
    let y = 110;
    doc.fontSize(10).fillColor("#333");
    doc.text(`Fatura No: ${asciify(order.orderNumber)}`, 40, y);
    doc.text(`Tarih: ${ftDate(order.createdAt)}`, 40, y + 14);
    doc.text(
      `Odeme: ${order.paymentStatus === "PAID" ? "Odendi" : asciify(order.paymentStatus)}`,
      40,
      y + 28
    );

    // Sağda satıcı bilgileri
    doc.fontSize(9).fillColor("#555");
    doc.text("SATICI", 320, y, { width: 240, align: "left" });
    doc.fontSize(9).fillColor("#000");
    doc.text(asciify(cfg.shopName), 320, y + 12, { width: 240 });
    doc.fontSize(8).fillColor("#444");
    doc.text(asciify(cfg.shopAddress), 320, y + 26, { width: 240 });
    doc.text(`Tel: ${cfg.shopPhone}`, 320, y + 50, { width: 240 });
    doc.text(`E-Posta: ${asciify(cfg.shopEmail)}`, 320, y + 62, {
      width: 240,
    });
    doc.text(
      `Vergi: ${asciify(cfg.taxOffice)} / ${asciify(cfg.taxNumber)}`,
      320,
      y + 74,
      { width: 240 }
    );

    // Alıcı kutusu
    y = 200;
    doc
      .roundedRect(40, y, doc.page.width - 80, 80, 6)
      .strokeColor("#dddddd")
      .stroke();
    doc.fontSize(9).fillColor("#777").text("ALICI", 50, y + 10);
    doc
      .fontSize(11)
      .fillColor("#000")
      .text(asciify(order.invoiceFullName ?? order.shippingName ?? "—"), 50, y + 22);
    if (order.invoiceTcNo) {
      doc.fontSize(9).fillColor("#444").text(
        `TCKN: ${order.invoiceTcNo}`,
        50,
        y + 38
      );
    }
    doc.fontSize(9).fillColor("#444").text(
      asciify(order.invoiceAddress ?? order.shippingAddress ?? "—"),
      50,
      y + 52,
      { width: doc.page.width - 100 }
    );

    // Tablo başlıkları
    y = 300;
    const tableX = 40;
    const colWidths = [40, 220, 80, 80, 100];
    doc.rect(tableX, y, doc.page.width - 80, 24).fill("#0a0a0a");
    doc.fillColor("#FFD700").fontSize(9);
    let x = tableX + 6;
    ["#", "Urun", "Adet", "Birim", "Tutar"].forEach((label, i) => {
      const align: "left" | "right" = i === 0 || i === 1 ? "left" : "right";
      doc.text(label, x, y + 8, { width: colWidths[i] - 12, align });
      x += colWidths[i];
    });

    // Satırlar
    doc.fillColor("#000").fontSize(9);
    y += 28;
    order.items.forEach((it, idx) => {
      x = tableX + 6;
      const lineTotal = Number(it.price) * it.quantity;
      const cells = [
        String(idx + 1),
        asciify(it.name),
        String(it.quantity),
        fmt(Number(it.price)),
        fmt(lineTotal),
      ];
      cells.forEach((val, i) => {
        const align: "left" | "right" = i === 0 || i === 1 ? "left" : "right";
        doc.text(val, x, y, { width: colWidths[i] - 12, align });
        x += colWidths[i];
      });
      y += 22;
      doc
        .moveTo(tableX, y - 2)
        .lineTo(doc.page.width - 40, y - 2)
        .strokeColor("#eeeeee")
        .stroke();
    });

    // Toplamlar
    y += 16;
    const labelX = doc.page.width - 220;
    const valueX = doc.page.width - 80;
    const summaryRow = (label: string, value: string, bold = false) => {
      doc
        .fillColor(bold ? "#000" : "#444")
        .fontSize(bold ? 11 : 9)
        .text(label, labelX, y, { width: 130, align: "right" });
      doc
        .fillColor(bold ? "#0a0a0a" : "#000")
        .fontSize(bold ? 12 : 9)
        .text(value, valueX, y, { width: 100, align: "right" });
      y += bold ? 20 : 16;
    };
    summaryRow("Ara Toplam", fmt(Number(order.subtotal)));
    summaryRow("Kargo", fmt(Number(order.shippingFee)));
    doc
      .moveTo(labelX, y)
      .lineTo(doc.page.width - 40, y)
      .strokeColor("#cccccc")
      .stroke();
    y += 6;
    summaryRow("GENEL TOPLAM", fmt(Number(order.total)), true);

    // Alt bant
    const footY = doc.page.height - 70;
    doc
      .moveTo(40, footY)
      .lineTo(doc.page.width - 40, footY)
      .strokeColor("#dddddd")
      .stroke();
    doc.fontSize(8).fillColor("#666");
    doc.text(
      asciify(
        `IBAN: ${cfg.iban}  |  ${cfg.shopPhone}  |  ${cfg.shopEmail}`
      ),
      40,
      footY + 8,
      { width: doc.page.width - 80, align: "center" }
    );
    doc.fontSize(7).fillColor("#999");
    doc.text(
      asciify(
        `Bu belge ${cfg.shopName} tarafindan elektronik olarak olusturulmustur. Bilgi amacli olup resmi e-fatura yerine gecmez.`
      ),
      40,
      footY + 28,
      { width: doc.page.width - 80, align: "center" }
    );

    doc.end();
  });

  return `/invoices/${filename}`;
}

// ─── Mail gönderimi (PDF eki ile) ────────────────────────────────────────────

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

export async function mailInvoice(
  order: OrderWithItems,
  pdfRelPath: string
): Promise<void> {
  const to = order.user.email;
  if (!to) return;

  const subject = `Siparişiniz alındı — Fatura #${order.orderNumber}`;
  const total = Number(order.total).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });
  const html = `
    <div style="font-family:sans-serif;max-width:560px;color:#1a1a1a">
      <h2 style="margin:0 0 12px;color:#0a0a0a">Teşekkürler!</h2>
      <p>Siparişiniz başarıyla alındı, ödemeniz onaylandı.</p>
      <p style="background:#fffbe5;padding:14px 18px;border-radius:8px">
        <strong>Sipariş No:</strong> ${order.orderNumber}<br/>
        <strong>Toplam:</strong> ${total}
      </p>
      <p>Faturanızı bu e-postanın ekinde bulabilirsiniz. Sorularınız için bize her zaman ulaşabilirsiniz.</p>
      <p style="color:#888;font-size:12px;margin-top:32px">
        Galaksi Motor — bu e-posta otomatik olarak gönderildi.
      </p>
    </div>
  `;

  const transport = createTransport();
  const absPath = path.join(process.cwd(), "public", pdfRelPath);
  if (!transport) {
    console.log(`📧 [MAIL STUB] Fatura mail edilemedi (SMTP yok): ${to}`);
    return;
  }
  await transport.sendMail({
    from: `"Galaksi Motor" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    attachments: [
      {
        filename: `${order.orderNumber}.pdf`,
        path: absPath,
        contentType: "application/pdf",
      },
    ],
  });
}
