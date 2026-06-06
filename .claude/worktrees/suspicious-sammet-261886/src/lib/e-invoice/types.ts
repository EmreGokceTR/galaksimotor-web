export type InvoiceLine = {
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number; // KDV hariç
  vatRate: number;   // Örn: 20 (%)
};

export type InvoiceData = {
  /** Ardışık fatura numarası: "2026/001" */
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  issuedAt: Date;
  /** Müşteri bilgileri */
  customer: {
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    tcNo?: string | null;
  };
  lines: InvoiceLine[];
  subtotal: number;
  shippingFee: number;
  discountAmount?: number;
  total: number;
  currency: "TRY";
};

export type InvoiceResult =
  | { ok: true; pdfUrl: string; externalId?: string; provider: string }
  | { ok: false; error: string };
