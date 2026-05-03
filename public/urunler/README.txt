ÜRÜN GÖRSELLERİ KLASÖRÜ
========================

Bu klasöre koyduğun her görsel siteden /urunler/dosya-adi.jpg yolu üzerinden erişilebilir.

NASIL YAPILIR?
1. Görseli buraya kopyala — örn: cvt-kayisi.jpg
2. data/product-images.json dosyasını aç
3. İlgili ürünün slug'ı altına URL olarak ekle: "/urunler/cvt-kayisi.jpg"
   (Birden fazla görsel için ["a.jpg", "b.jpg"] şeklinde liste yap)
4. Terminalde komutu çalıştır:    npm run images
5. DB güncellenir, site yenilendiğinde yeni görseller görünür.

DIŞ URL DE KULLANABİLİRSİN
data/product-images.json içine doğrudan https://... şeklinde tam URL yazabilirsin.

ÖNERİLEN FORMAT
- 800×600 px (4:3 oranı)
- JPG (kalite 80) veya WebP
- 200 KB altı
