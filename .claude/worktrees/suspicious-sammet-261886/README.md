# Galaksi Motor

Motosiklet yedek parça, aksesuar ve servis e-ticaret platformu.

## Teknoloji Yığını
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS — Kurumsal renkler: `#FFD700` (sarı), `#111111` (siyah)
- Prisma + MySQL
- NextAuth.js (Google + e-posta/şifre)
- Iyzico ödeme

## Kurulum
```bash
npm install
cp .env.example .env
# .env içindeki DATABASE_URL ve diğer değerleri doldurun
npx prisma migrate dev --name init
npm run dev
```

## Aşama Durumu
- [x] **1. Proje Kurulumu ve Veritabanı Mimarisi** — Next.js + Tailwind + Prisma şeması (User, Product, Category, Service, Order, Motorcycle ve ilişkili tablolar) hazır.
- [x] **2. Kimlik Doğrulama** — NextAuth (Google + Credentials), `/giris`, `/kayit`, `/hesabim` paneli (genel bakış, siparişlerim, favoriler, randevular).
- [ ] 3. Ürün Kataloğu
- [ ] 4. Garaj / Uyumluluk
- [ ] 5. Randevu Modülü
- [ ] 6. Sepet
- [ ] 7. Iyzico Ödeme
- [ ] 8. Blog & Yorumlar
- [ ] 9. SEO & Kurumsal
- [ ] 10. Admin Paneli
