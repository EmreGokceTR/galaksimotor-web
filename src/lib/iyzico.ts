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
