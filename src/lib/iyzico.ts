/**
 * Iyzico ödeme entegrasyonu wrapper.
 *
 * Aktivasyon için .env'e ekle:
 *   IYZICO_API_KEY=...
 *   IYZICO_SECRET=...
 *   IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
 *
 * Sandbox: https://sandbox-merchant.iyzipay.com (test paneli)
 * Test kart: 5528790000000008 / 12/30 / 123 (Halkbank)
 */
import Iyzipay from "iyzipay";

export const isIyzicoConfigured = Boolean(
  process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET
);

let _client: Iyzipay | null = null;

export function getIyzico(): Iyzipay {
  if (!isIyzicoConfigured) {
    throw new Error(
      "Iyzico .env'de yapılandırılmamış. IYZICO_API_KEY ve IYZICO_SECRET ekleyin."
    );
  }
  if (!_client) {
    _client = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY!,
      secretKey: process.env.IYZICO_SECRET!,
      uri: process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com",
    });
  }
  return _client;
}
