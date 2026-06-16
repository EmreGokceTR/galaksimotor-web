/**
 * İyzico canlı anahtar doğrulama scripti.
 * - apiTest: GET /payment/test → "success" beklenir
 * - retrievePayment (dummy id) → kimlik doğrulanırsa "PAYMENT_NOT_FOUND" döner
 */
const fs = require("fs");
const path = require("path");
// .env'i manuel parse et (dotenv bağımlılığı yok)
const envText = fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8");
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)="?([^"\n]*)"?$/);
  if (m) process.env[m[1]] = m[2];
}
const Iyzipay = require("iyzipay");

const iyzi = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY,
  secretKey: process.env.IYZICO_SECRET_KEY,
  uri: process.env.IYZICO_BASE_URL,
});

console.log("Base URL:", process.env.IYZICO_BASE_URL);
console.log("API Key prefix:", process.env.IYZICO_API_KEY?.slice(0, 8) + "…");

iyzi.apiTest.retrieve({}, (err, res) => {
  if (err) {
    console.error("HATA:", err);
    process.exit(1);
  }
  console.log("apiTest sonucu:", JSON.stringify(res, null, 2));
  process.exit(0);
});
