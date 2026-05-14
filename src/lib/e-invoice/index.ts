/**
 * E-Fatura / Bilgi Faturası ana giriş noktası.
 *
 * Akış:
 *   1. E_INVOICE_PROVIDER=parasut + PARASUT_* env'leri varsa → Paraşüt API'sine gönder
 *   2. Yoksa veya API hatası verirse → local PDF bilgi faturası üret (/api/invoice/{orderId})
 *
 * Her iki durumda da dönen `pdfUrl` Order.invoicePdfUrl alanına yazılır.
 */
export type { InvoiceData, InvoiceResult } from "./types";
export { generateInvoicePdf } from "./pdf";

import { isParasutConfigured, createParasutInvoice } from "./parasut";
import type { InvoiceData, InvoiceResult } from "./types";

/**
 * Ana fatura oluşturma fonksiyonu.
 * @param data     Fatura verileri
 * @param orderId  Veritabanındaki sipariş ID'si (fallback URL için)
 */
export async function createInvoice(
  data: InvoiceData,
  orderId: string
): Promise<InvoiceResult> {
  const provider = process.env.E_INVOICE_PROVIDER ?? "local";

  // ── Paraşüt ──────────────────────────────────────────────────────────────
  if (provider === "parasut" && isParasutConfigured()) {
    const result = await createParasutInvoice(data);
    if (result.ok) return result;
    // Paraşüt başarısız → local fallback'e düş
    console.warn("[e-invoice] Paraşüt hatası, local PDF'e geçiliyor:", result.error);
  }

  // ── Local Bilgi Faturası PDF ──────────────────────────────────────────────
  // PDF on-demand /api/invoice/[orderId] route'undan üretilir.
  // invoicePdfUrl olarak bu URL saklanır; indirme zamanında generate edilir.
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ??
    "https://galaksimotor.com";

  return {
    ok: true,
    pdfUrl: `${siteUrl}/api/invoice/${orderId}`,
    provider: "local",
  };
}
