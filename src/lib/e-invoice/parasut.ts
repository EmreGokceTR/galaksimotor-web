/**
 * Paraşüt E-Fatura Entegrasyonu
 * ─────────────────────────────────────────────────────────────────
 * Gerekli Vercel Environment Variables:
 *   E_INVOICE_PROVIDER=parasut
 *   PARASUT_CLIENT_ID        Paraşüt uygulama client ID
 *   PARASUT_CLIENT_SECRET    Paraşüt uygulama client secret
 *   PARASUT_USERNAME         Paraşüt hesap e-postası
 *   PARASUT_PASSWORD         Paraşüt hesap şifresi
 *   PARASUT_COMPANY_ID       Paraşüt şirket ID (URL'deki sayı)
 *
 * Paraşüt hesabı açmak için: https://app.parasut.com/signup
 * API dokümantasyonu: https://apidocs.parasut.com/
 * ─────────────────────────────────────────────────────────────────
 */
import type { InvoiceData, InvoiceResult } from "./types";

const BASE = "https://api.parasut.com";

interface ParasutToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface ParasutContactResponse {
  data: { id: string };
}

interface ParasutInvoiceResponse {
  data: { id: string; attributes?: { net_total?: string } };
}

/** OAuth2 Resource Owner Password Credentials token al */
async function getToken(): Promise<string> {
  const res = await fetch(`${BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "password",
      client_id: process.env.PARASUT_CLIENT_ID,
      client_secret: process.env.PARASUT_CLIENT_SECRET,
      username: process.env.PARASUT_USERNAME,
      password: process.env.PARASUT_PASSWORD,
      redirect_uri: "",
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Paraşüt auth hatası: ${res.status} ${txt}`);
  }
  const data = (await res.json()) as ParasutToken;
  return data.access_token;
}

/** Müşteriyi Paraşüt'te bul veya oluştur */
async function upsertContact(
  token: string,
  companyId: string,
  customer: InvoiceData["customer"]
): Promise<string> {
  // İsimle ara
  const search = await fetch(
    `${BASE}/v4/${companyId}/contacts?filter[name]=${encodeURIComponent(customer.name)}&filter[contact_type]=person`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
  );
  const searchData = (await search.json()) as { data: Array<{ id: string }> };
  if (searchData.data?.length > 0) return searchData.data[0].id;

  // Yoksa oluştur
  const create = await fetch(`${BASE}/v4/${companyId}/contacts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      data: {
        type: "contacts",
        attributes: {
          name: customer.name,
          email: customer.email || undefined,
          phone: customer.phone || undefined,
          contact_type: "person",
          tax_number: customer.tcNo || undefined,
        },
      },
    }),
  });
  if (!create.ok) throw new Error(`Paraşüt müşteri oluşturulamadı: ${create.status}`);
  const created = (await create.json()) as ParasutContactResponse;
  return created.data.id;
}

/** Paraşüt üzerinden satış faturası oluştur */
export async function createParasutInvoice(
  data: InvoiceData
): Promise<InvoiceResult> {
  try {
    const companyId = process.env.PARASUT_COMPANY_ID;
    if (!companyId) throw new Error("PARASUT_COMPANY_ID tanımsız.");

    const token = await getToken();
    const contactId = await upsertContact(token, companyId, data.customer);

    const issueDate = data.issuedAt.toISOString().slice(0, 10);

    const invoicePayload = {
      data: {
        type: "sales_invoices",
        attributes: {
          item_type: "invoice",
          description: `Sipariş #${data.orderNumber}`,
          issue_date: issueDate,
          due_date: issueDate,
          currency: "TRL", // Paraşüt TRY'yi "TRL" olarak kabul eder
          invoice_no: data.invoiceNumber,
          billing_address: [data.customer.address, data.customer.city]
            .filter(Boolean)
            .join(", "),
        },
        relationships: {
          contact: { data: { type: "contacts", id: contactId } },
          details: {
            data: data.lines.map((line) => ({
              type: "sales_invoice_details",
              attributes: {
                quantity: line.quantity,
                unit_price: line.unitPrice.toFixed(2),
                vat_rate: line.vatRate,
                description: `${line.name} [${line.sku}]`,
              },
            })),
          },
        },
      },
    };

    const res = await fetch(`${BASE}/v4/${companyId}/sales_invoices`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(invoicePayload),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Paraşüt fatura hatası: ${res.status} ${txt}`);
    }

    const created = (await res.json()) as ParasutInvoiceResponse;
    const invoiceId = created.data.id;

    // Fatura PDF URL'si (Paraşüt'te fatura detay linki)
    const pdfUrl = `https://app.parasut.com/${companyId}/sales-invoices/${invoiceId}`;

    return { ok: true, pdfUrl, externalId: invoiceId, provider: "parasut" };
  } catch (e: unknown) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Paraşüt fatura hatası.",
    };
  }
}

/** Paraşüt yapılandırılmış mı? */
export function isParasutConfigured(): boolean {
  return Boolean(
    process.env.PARASUT_CLIENT_ID &&
    process.env.PARASUT_CLIENT_SECRET &&
    process.env.PARASUT_USERNAME &&
    process.env.PARASUT_PASSWORD &&
    process.env.PARASUT_COMPANY_ID
  );
}
