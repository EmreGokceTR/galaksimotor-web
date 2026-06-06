Galaksi Motor - Full-Stack Geliştirme Dokümantasyonu
Teknoloji Yığını:
Frontend: Next.js (React), Tailwind CSS
Backend: Node.js (Express) veya Next.js API Routes
Veritabanı: MySQL
ORM: Prisma
Ödeme Altyapısı: Iyzico Node.js SDK
Kimlik Doğrulama: NextAuth.js (Google ve E-posta/Şifre)

1. Proje Kurulumu ve Veritabanı Mimarisi (MySQL)
İşlem: Next.js projesinin başlatılması, Tailwind CSS'in sarı (#FFD700) ve siyah (#111111) kurumsal renklere göre yapılandırılması.
Veritabanı Tabloları: Prisma kullanılarak MySQL şemaları oluşturulacak.
Users (Müşteriler ve Admin)
Products (Yedek parça, aksesuar)
Categories (Motosiklet Yedek Parçaları, Bakım ve Tamir Ürünleri, Aksesuarlar)
Services (Tamir randevuları)
Orders (Sipariş takibi)
Motorcycles (Marka, model, yıl veritabanı)
2. Kimlik Doğrulama ve Kullanıcı Yönetimi
İşlem: Müşterilerin siteye kayıt olabilmesi ve oturum açabilmesi için NextAuth.js entegrasyonu.
Özellikler: Standart e-posta/şifre kaydına ek olarak tek tıkla Google ile Giriş imkanı. Kullanıcıların hesaplarında sipariş geçmişini ve favorilerini görebileceği bir "Hesabım" paneli oluşturulması.
3. Gelişmiş Ürün Kataloğu ve Kategori Sistemi
İşlem: Ürün listeleme sayfalarının (PLP) ve ürün detay sayfalarının (PDP) kodlanması.
Özellikler: Kalyoncu Motor tarzı sol menü filtreleri. Marka, fiyat aralığı ve stok durumuna göre anlık filtreleme (AJAX/Fetch). Ürün detayında birden fazla görsel, stok kodu (SKU) ve varyant (renk, ebat) seçimi.
4. Motosiklet Uyumluluk Filtresi (Garaj Modülü)
İşlem: GP Kompozit sitesindeki gibi çalışan spesifik parça bulma motoru.
Özellikler: Kullanıcı sisteme motorunu girecek (Örn: Marka: Kymco, Model: DTX 360, Yıl: 2023). Sistem sadece o motorla uyumlu olan CVT kayışlarını, fren balatalarını veya varyatör parçalarını listeleyecek. İkinci bir örnek olarak Bajaj Pulsar F 250 seçildiğinde o modele ait koruma demirleri ve spesifik aksesuarlar filtrelenecek.
5. Randevu ve Servis Yönetim Modülü
İşlem: Fiziksel tamirhane için online randevu sistemi.
Özellikler: Ana sayfadaki "Randevu Al" butonuna tıklandığında açılan takvim arayüzü. Müşteri, motorundaki sorunu (Örn: Periyodik bakım, zincir değişimi, varyatör temizliği) ve uygun tarihi seçecek. Sistem aynı saate çakışan randevu vermeyecek.
6. Sepet Mimarisi ve Sipariş Yönetimi
İşlem: Durum yönetimi (State Management) kullanılarak dinamik sepet oluşturulması.
Özellikler: Sayfa yenilenmeden sepete ürün ekleme/çıkarma (Add to Cart). Sepet çekmecesi (Cart Drawer) tasarımı. Kargo ücreti hesaplama ve belirli bir tutar üzeri ücretsiz kargo baremi tanımlama.
7. Ödeme Entegrasyonu (Iyzico) ve Teslimat Seçenekleri
İşlem: Güvenli ödeme (Checkout) sayfasının kodlanması.
Özellikler: Iyzico API kullanılarak kredi kartı ile 3D Secure ödeme alınması. Teslimat seçeneklerine standart kargoya ek olarak "Küçükçekmece Mağazadan Teslim Al" (Elden teslim) seçeneğinin eklenmesi. Başarılı sipariş sonrası otomatik e-posta faturası ve sipariş numarası oluşturma.
8. Blog, Rehber ve Müşteri Yorumları
İşlem: İçerik pazarlaması (SEO) ve sosyal kanıt için modüller.
Özellikler: Sıkça sorulan sorular, teknik rehberler (Örn: "CVT Şanzıman Bakımı Nasıl Yapılır?") ve blog yazıları için dinamik sayfalar. Ana sayfada görseldeki gibi müşteri yorumlarını (Testimonials) gösteren kaydırılabilir bir alan.
9. Kurumsal Bilgiler ve SEO Optimizasyonu
İşlem: Hakkımızda, İletişim sayfalarının statik olarak oluşturulması ve Arama Motoru Optimizasyonu.
Özellikler: İletişim sayfasına Küçükçekmece İnönü Mah. lokasyonlu Google Maps entegrasyonu. Tüm sayfalara Next.js Metadata API ile Title, Description ve OpenGraph etiketlerinin dinamik olarak basılması. Google'ın işletmeyi hızlı tanıması için "LocalBusiness" şema (Schema.org) işaretlemesi.
10. Admin Paneli (Yönetim Ekranı)
İşlem: Mağaza sahibinin siteyi kod bilmeden yönetebileceği güvenli panelin inşası.
Özellikler: Yeni ürün ekleme, fiyat/stok güncelleme, gelen siparişlerin kargo durumlarını (Hazırlanıyor, Kargoya Verildi, Tamamlandı) değiştirme, blog yazısı girme ve randevuları onaylama/iptal etme arayüzü.

