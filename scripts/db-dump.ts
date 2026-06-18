/**
 * Aiven (MySQL) → JSON tam yedek.
 * Çalıştırma:  DATABASE_URL="<aiven_url>" tsx scripts/db-dump.ts
 * Çıktı: prisma/backup-<timestamp>.json
 */
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

// FK bağımlılık sırası (import bu sırada yapılacak)
const MODELS = [
  "user",
  "category",
  "motorcycle",
  "service",
  "coupon",
  "invoiceCounter",
  "siteSetting",
  "blogPost",
  "motorcycleListing",
  "verificationToken",
  "activityLog",
  "account",
  "session",
  "product",
  "productImage",
  "productVariant",
  "fitment",
  "userMotorcycle",
  "favorite",
  "review",
  "order",
  "orderItem",
  "appointment",
] as const;

async function main() {
  const dump: Record<string, unknown[]> = {};
  let total = 0;
  for (const m of MODELS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (prisma as any)[m].findMany();
    dump[m] = rows;
    total += rows.length;
    console.log(`  ${m}: ${rows.length}`);
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const out = join(process.cwd(), "prisma", `backup-${stamp}.json`);
  // Decimal/Date → JSON serileştirme: Prisma nesneleri toJSON destekler.
  writeFileSync(out, JSON.stringify(dump, null, 2), "utf8");
  console.log(`\nToplam ${total} satır → ${out}`);
}

main()
  .catch((e) => {
    console.error("DUMP HATASI:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
