/**
 * Iyzico ödeme entegrasyonu wrapper.
 *
 * Aktivasyon için .env'e ekle:
 *   IYZICO_API_KEY=sandbox-...
 *   IYZICO_SECRET_KEY=sandbox-...   (legacy: IYZICO_SECRET)
 *   IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
 *
 * Sandbox: https://sandbox-merchant.iyzipay.com (test paneli)
 * Test kart: 5528790000000008 / 12/30 / 123 (Halkbank)
 *
 * Production'a geçiş: IYZICO_BASE_URL=https://api.iyzipay.com
 */
import Iyzipay from "iyzipay";

const SANDBOX_URL = "https://sandbox-api.iyzipay.com";

function getApiKey(): string | undefined {
  return process.env.IYZICO_API_KEY;
}
function getSecretKey(): string | undefined {
  // Yeni standart: IYZICO_SECRET_KEY; geriye dönük uyum: IYZICO_SECRET
  return process.env.IYZICO_SECRET_KEY ?? process.env.IYZICO_SECRET;
}
function getBaseUrl(): string {
  return process.env.IYZICO_BASE_URL ?? SANDBOX_URL;
}

/** Iyzico key'leri tanımlı mı? */
export const isIyzicoConfigured: boolean = Boolean(
  getApiKey() && getSecretKey()
);

/** Sandbox mode kontrolü (BASE_URL'e göre). */
export function isSandbox(): boolean {
  return getBaseUrl().includes("sandbox");
}

export type IyzicoResult = { ok: true } | { ok: false; error: string };

let _client: Iyzipay | null = null;

export function getIyzico(): Iyzipay {
  const apiKey = getApiKey();
  const secretKey = getSecretKey();
  if (!apiKey || !secretKey) {
    throw new Error(
      "Iyzico .env'de yapılandırılmamış. IYZICO_API_KEY ve IYZICO_SECRET_KEY ekleyin."
    );
  }
  if (!_client) {
    _client = new Iyzipay({
      apiKey,
      secretKey,
      uri: getBaseUrl(),
    });
  }
  return _client;
}

/**
 * Ödeme iptali (cancel) — aynı gün kesilmemiş işlemler için.
 * Başarılı olursa para iade edilir, işlem iptal olarak işaretlenir.
 */
export async function cancelPayment(params: {
  paymentId: string;
  conversationId: string;
  ip?: string;
}): Promise<IyzicoResult> {
  const client = getIyzico();
  return new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).cancel.create(
      {
        locale: "tr",
        conversationId: params.conversationId,
        paymentId: params.paymentId,
        ip: params.ip ?? "127.0.0.1",
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any, res: any) => {
        if (err) return resolve({ ok: false, error: err.message ?? "İptal hatası" });
        if (res?.status !== "success")
          return resolve({ ok: false, error: res?.errorMessage ?? "İptal başarısız." });
        resolve({ ok: true });
      }
    );
  });
}

/**
 * Ödeme iadesi (refund) — T+1 ve sonrası için.
 * İade için paymentTransactionId gereklidir (retrievePaymentItems ile elde edilir).
 */
export async function refundPayment(params: {
  paymentTransactionId: string;
  price: string;
  conversationId: string;
  ip?: string;
}): Promise<IyzicoResult> {
  const client = getIyzico();
  return new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).refund.create(
      {
        locale: "tr",
        conversationId: params.conversationId,
        paymentTransactionId: params.paymentTransactionId,
        price: params.price,
        ip: params.ip ?? "127.0.0.1",
        currency: "TRY",
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any, res: any) => {
        if (err) return resolve({ ok: false, error: err.message ?? "İade hatası" });
        if (res?.status !== "success")
          return resolve({ ok: false, error: res?.errorMessage ?? "İade başarısız." });
        resolve({ ok: true });
      }
    );
  });
}

/**
 * Ödeme detaylarını çeker — refund için paymentTransactionId lazım.
 */
export async function retrievePaymentItems(
  paymentId: string
): Promise<{ paymentTransactionId: string; price: number }[]> {
  const client = getIyzico();
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).payment.retrieve(
      { locale: "tr", paymentId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any, res: any) => {
        if (err) return reject(new Error(err.message));
        if (res?.status !== "success")
          return reject(new Error(res?.errorMessage ?? "Ödeme detayı alınamadı."));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = (res.paymentItems ?? []).map((it: any) => ({
          paymentTransactionId: it.paymentTransactionId as string,
          price: parseFloat(it.paidPrice ?? it.price ?? "0"),
        }));
        resolve(items);
      }
    );
  });
}
