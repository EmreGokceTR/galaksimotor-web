/**
 * Bir kullanıcıyı admin yapar.
 * Kullanım:
 *   npm run make-admin -- email@adres.com
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("❌ Email gerekli. Örnek: npm run make-admin -- ben@example.com");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`❌ Kullanıcı bulunamadı: ${email}`);
    console.error("   Önce /kayit sayfasından hesap oluştur, sonra bu komutu tekrar çalıştır.");
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });

  console.log(`✅ ${email} artık ADMIN. /admin sayfasına erişebilir.`);
}

main()
  .catch((e) => {
    console.error("❌ Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
