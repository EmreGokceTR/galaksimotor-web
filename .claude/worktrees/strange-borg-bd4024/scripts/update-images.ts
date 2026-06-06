/**
 * Ürün görsellerini data/product-images.json dosyasından okuyup DB'yi günceller.
 *
 * Kullanım:
 *   1) data/product-images.json dosyasını düzenle (slug → URL listesi)
 *   2) `npm run images` komutunu çalıştır
 *
 * Yerel görseller için:
 *   1) Görseli public/urunler/ klasörüne koy (örn: public/urunler/cvt.jpg)
 *   2) JSON içinde URL olarak "/urunler/cvt.jpg" yaz (başında / olmalı)
 *
 * Dış URL'ler doğrudan kabul edilir (https://...).
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ImageMap = Record<string, string[] | string>;

async function main() {
  const file = path.join(process.cwd(), "data", "product-images.json");
  const raw = readFileSync(file, "utf-8");
  const map: ImageMap = JSON.parse(raw);

  let updated = 0;
  let missing = 0;

  for (const [slug, value] of Object.entries(map)) {
    if (slug.startsWith("_")) continue; // doc/comment alanlarını atla
    const urls = Array.isArray(value) ? value : [value];
    if (urls.length === 0) continue;

    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) {
      console.warn(`  ⚠ Ürün bulunamadı: ${slug}`);
      missing++;
      continue;
    }

    // Eski görselleri temizle, yenilerini ekle
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    for (let i = 0; i < urls.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: urls[i],
          alt: product.name,
          position: i,
        },
      });
    }
    console.log(`  ✓ ${slug} → ${urls.length} görsel`);
    updated++;
  }

  console.log("");
  console.log(`✅ ${updated} ürün güncellendi.`);
  if (missing > 0) {
    console.log(`⚠ ${missing} slug DB'de bulunamadı (atlandı).`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
