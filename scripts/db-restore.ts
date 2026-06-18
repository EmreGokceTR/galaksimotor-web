/**
 * JSON yedek → Supabase (PostgreSQL) geri yükleme.
 * Çalıştırma:  DATABASE_URL="<supabase_url>" tsx scripts/db-restore.ts prisma/backup-XXXX.json
 *
 * FK bağımlılık sırasına göre createMany ile yükler. ID'ler cuid string
 * olduğu için doğrudan taşınır. Decimal/DateTime alanlar JSON string'ten
 * Prisma tarafından otomatik parse edilir.
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

const prisma = new PrismaClient();

// Import sırası (FK bağımlılıkları)
const ORDER = [
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
  const file = process.argv[2];
  if (!file) {
    console.error("Kullanım: tsx scripts/db-restore.ts <backup.json>");
    process.exit(1);
  }
  const data = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown[]>;

  let total = 0;
  for (const model of ORDER) {
    const rows = data[model] ?? [];
    if (!rows.length) {
      console.log(`  ${model}: 0 (atlandı)`);
      continue;
    }
    // createMany — Postgres'te desteklenir. skipDuplicates ile idempotent.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await (prisma as any)[model].createMany({
      data: rows,
      skipDuplicates: true,
    });
    total += res.count;
    console.log(`  ${model}: ${res.count}/${rows.length}`);
  }
  console.log(`\nToplam ${total} satır yüklendi.`);
}

main()
  .catch((e) => {
    console.error("RESTORE HATASI:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
