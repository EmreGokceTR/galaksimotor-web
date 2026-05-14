/**
 * Bilgi Faturası PDF üreticisi (pdfkit tabanlı).
 *
 * Entegratör API'si yapılandırılmamışsa bu modül devreye girer.
 * Türkçe karakter desteği için DejaVu font aranır; yoksa Helvetica kullanılır.
 *
 * Logo: public/logos/galaksi-motor-logo.jpg
 */
import path from "path";
import fs from "fs";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require("pdfkit") as typeof import("pdfkit");

import type { InvoiceData } from "./types";

// ── Font ──────────────────────────────────────────────────────────────────────
const FONT_CANDIDATES = [
  "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
  "/usr/share/fonts/truetype/ubuntu/Ubuntu-R.ttf",
  "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
  "/usr/share/fonts/liberation/LiberationSans-Regular.ttf",
];
const FONT_BOLD_CANDIDATES = [
  "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
  "/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf",
  "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
  "/usr/share/fonts/liberation/LiberationSans-Bold.ttf",
];

const unicodeFont     = FONT_CANDIDATES.find((p) => fs.existsSync(p));
const unicodeFontBold = FONT_BOLD_CANDIDATES.find((p) => fs.existsSync(p));

// ── Logo ──────────────────────────────────────────────────────────────────────
const LOGO_PATH = path.join(process.cwd(), "public", "logos", "galaksi-motor-logo.jpg");
const hasLogo = fs.existsSync(LOGO_PATH);

// ── Para formatı ─────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " TL";

export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const FONT     = unicodeFont     ?? "Helvetica";
    const FONT_B   = unicodeFontBold ?? "Helvetica-Bold";
    const W = doc.page.width - 100; // çalışma genişliği (margin=50 her iki tarafta)

    if (unicodeFont)     doc.registerFont("GM",      unicodeFont);
    if (unicodeFontBold) doc.registerFont("GM-Bold", unicodeFontBold);

    const USE_FONT   = unicodeFont     ? "GM"      : FONT;
    const USE_BOLD   = unicodeFontBold ? "GM-Bold" : FONT_B;
    const YELLOW = "#F5C518";
    const DARK   = "#1a1a1a";
    const GREY   = "#555555";
    const LGREY  = "#AAAAAA";

    // ── Başlık alanı ─────────────────────────────────────────────────────────
    // Logo
    if (hasLogo) {
      try {
        doc.image(LOGO_PATH, 50, 45, { width: 100 });
      } catch {
        // Logo okunamazsa devam et
      }
    }

    // Sağ üst: şirket bilgileri
    doc.font(USE_BOLD).fontSize(14).fillColor(DARK)
      .text("Galaksi Motor", 0, 50, { align: "right" });
    doc.font(USE_FONT).fontSize(9).fillColor(GREY)
      .text("İnönü Mahallesi, Alp Sokak No:3-5", { align: "right" })
      .text("Küçükçekmece, İstanbul 34303", { align: "right" })
      .text("Tel: +90 553 573 29 29", { align: "right" })
      .text("info@galaksimotor.com", { align: "right" });

    // Sarı çizgi
    doc.moveDown(0.5);
    const lineY = doc.y + 6;
    doc.rect(50, lineY, W, 3).fill(YELLOW);
    doc.moveDown(1.5);

    // ── Fatura başlığı ───────────────────────────────────────────────────────
    doc.font(USE_BOLD).fontSize(18).fillColor(DARK)
      .text("BİLGİ FATURASI", { align: "center" });
    doc.font(USE_FONT).fontSize(9).fillColor(GREY)
      .text("(Bu belge bilgi amaçlıdır — resmi e-Fatura entegratör aracılığıyla kesilir)", {
        align: "center",
      });
    doc.moveDown(1);

    // ── İki sütunlu detay: Fatura / Müşteri ─────────────────────────────────
    const col1 = 50;
    const col2 = 310;
    const detailY = doc.y;

    // Sol: Fatura bilgileri
    doc.font(USE_BOLD).fontSize(9).fillColor(DARK).text("Fatura Bilgileri", col1, detailY);
    doc.font(USE_FONT).fontSize(9).fillColor(GREY)
      .text(`Fatura No   : ${data.invoiceNumber}`, col1)
      .text(`Sipariş No  : #${data.orderNumber}`, col1)
      .text(`Tarih       : ${data.issuedAt.toLocaleDateString("tr-TR")}`, col1);

    // Sağ: Müşteri bilgileri
    doc.font(USE_BOLD).fontSize(9).fillColor(DARK).text("Müşteri", col2, detailY);
    doc.font(USE_FONT).fontSize(9).fillColor(GREY);
    doc.text(data.customer.name, col2);
    if (data.customer.phone) doc.text(data.customer.phone, col2);
    if (data.customer.email) doc.text(data.customer.email, col2);
    if (data.customer.address) doc.text(data.customer.address, col2);
    if (data.customer.city)    doc.text(data.customer.city, col2);
    if (data.customer.tcNo)    doc.text(`TC: ${data.customer.tcNo}`, col2);

    doc.moveDown(2);

    // ── Kalemler tablosu ────────────────────────────────────────────────────
    const tableTop = doc.y;
    const COL_W = { product: 220, sku: 80, qty: 40, price: 70, vat: 40, total: 70 };
    let cx = 50;

    // Tablo başlığı
    doc.rect(50, tableTop, W, 18).fill(DARK);
    doc.font(USE_BOLD).fontSize(8).fillColor("#FFFFFF");
    const headers = ["Ürün", "SKU", "Adet", "Birim Fiyat", "KDV%", "Toplam"];
    const colWidths = Object.values(COL_W);
    const aligns: ("left"|"right")[] = ["left","left","right","right","right","right"];

    headers.forEach((h, i) => {
      doc.text(h, cx + 4, tableTop + 4, { width: colWidths[i], align: aligns[i] });
      cx += colWidths[i];
    });

    // Satırlar
    let rowY = tableTop + 18;
    data.lines.forEach((line, idx) => {
      const bg = idx % 2 === 0 ? "#F9F9F9" : "#FFFFFF";
      doc.rect(50, rowY, W, 16).fill(bg);
      doc.font(USE_FONT).fontSize(8).fillColor(DARK);
      cx = 50;
      const rowData = [
        line.name,
        line.sku,
        String(line.quantity),
        fmt(line.unitPrice),
        `%${line.vatRate}`,
        fmt(line.unitPrice * line.quantity),
      ];
      rowData.forEach((val, i) => {
        doc.text(val, cx + 4, rowY + 3, { width: colWidths[i], align: aligns[i] });
        cx += colWidths[i];
      });
      rowY += 16;
    });

    // Alt çizgi
    doc.rect(50, rowY, W, 1).fill("#DDDDDD");
    doc.moveDown(0.5);

    // ── Toplam tablosu ──────────────────────────────────────────────────────
    const totY = rowY + 12;
    const totLabelX = 350;
    const totValueX = 430;
    const totW = 120;

    const totals: [string, string][] = [
      ["Ara Toplam", fmt(data.subtotal)],
    ];
    if (data.shippingFee > 0) totals.push(["Kargo", fmt(data.shippingFee)]);
    if (data.discountAmount && data.discountAmount > 0)
      totals.push(["İndirim", "- " + fmt(data.discountAmount)]);

    let ty = totY;
    doc.font(USE_FONT).fontSize(9).fillColor(GREY);
    totals.forEach(([label, value]) => {
      doc.text(label, totLabelX, ty, { width: 80, align: "right" })
         .text(value, totValueX, ty, { width: totW, align: "right" });
      ty += 16;
    });

    // Toplam satırı
    doc.rect(totLabelX, ty - 2, totW + 80, 20).fill(YELLOW);
    doc.font(USE_BOLD).fontSize(10).fillColor(DARK)
      .text("GENEL TOPLAM", totLabelX, ty + 2, { width: 80, align: "right" })
      .text(fmt(data.total), totValueX, ty + 2, { width: totW, align: "right" });

    // ── Footer ──────────────────────────────────────────────────────────────
    const footerY = doc.page.height - 80;
    doc.rect(50, footerY, W, 1).fill("#DDDDDD");
    doc.font(USE_FONT).fontSize(7.5).fillColor(LGREY)
      .text(
        "Bu belge bilgi amaçlıdır. Resmi fatura GİB kayıtlı e-Fatura/e-Arşiv entegratörü aracılığıyla düzenlenmektedir.",
        50, footerY + 6, { width: W, align: "center" }
      )
      .text(
        "Galaksi Motor · İnönü Mah., Alp Sk. No:3-5, Küçükçekmece / İstanbul · www.galaksimotor.com",
        50, footerY + 18, { width: W, align: "center" }
      );

    doc.end();
  });
}
