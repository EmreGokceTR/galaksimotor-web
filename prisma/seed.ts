import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed başlıyor...");

  // Kategoriler
  const yedekParca = await prisma.category.upsert({
    where: { slug: "motosiklet-yedek-parcalari" },
    update: {},
    create: {
      slug: "motosiklet-yedek-parcalari",
      name: "Motosiklet Yedek Parçaları",
      description: "CVT kayışları, fren balataları, varyatör parçaları ve daha fazlası.",
    },
  });

  const bakim = await prisma.category.upsert({
    where: { slug: "bakim-ve-tamir-urunleri" },
    update: {},
    create: {
      slug: "bakim-ve-tamir-urunleri",
      name: "Bakım ve Tamir Ürünleri",
      description: "Motor yağı, zincir spreyi, fren hidroliği, gres ve sarf malzemeleri.",
    },
  });

  const aksesuar = await prisma.category.upsert({
    where: { slug: "aksesuarlar" },
    update: {},
    create: {
      slug: "aksesuarlar",
      name: "Aksesuarlar",
      description: "Koruma demirleri, gidon ağırlıkları, telefon tutucular ve dekoratif aksesuarlar.",
    },
  });

  // Motosikletler
  const kymco = await prisma.motorcycle.upsert({
    where: { brand_model_year: { brand: "Kymco", model: "DTX 360", year: 2023 } },
    update: {},
    create: { brand: "Kymco", model: "DTX 360", year: 2023 },
  });

  const bajaj = await prisma.motorcycle.upsert({
    where: { brand_model_year: { brand: "Bajaj", model: "Pulsar F 250", year: 2024 } },
    update: {},
    create: { brand: "Bajaj", model: "Pulsar F 250", year: 2024 },
  });

  const honda = await prisma.motorcycle.upsert({
    where: { brand_model_year: { brand: "Honda", model: "PCX 160", year: 2023 } },
    update: {},
    create: { brand: "Honda", model: "PCX 160", year: 2023 },
  });

  // Ürünler
  const products = [
    {
      slug: "cvt-kayisi-kymco-dtx",
      sku: "CVT-001",
      name: "CVT Kayışı - Kymco DTX 360",
      description: "Orijinal kalitede CVT kayışı. Uzun ömürlü.",
      price: 1250.0,
      stock: 12,
      brand: "Kymco",
      categoryId: yedekParca.id,
      images: ["https://picsum.photos/seed/cvt/600/400"],
      fitments: [kymco.id],
    },
    {
      slug: "fren-balatasi-on-bajaj-pulsar",
      sku: "FRB-101",
      name: "Ön Fren Balatası - Bajaj Pulsar F 250",
      description: "Seramik fren balatası, yüksek performans.",
      price: 480.0,
      stock: 25,
      brand: "Bajaj",
      categoryId: yedekParca.id,
      images: ["https://picsum.photos/seed/balata/600/400"],
      fitments: [bajaj.id],
    },
    {
      slug: "varyator-rulmani-honda-pcx",
      sku: "VAR-201",
      name: "Varyatör Rulmanı Seti - Honda PCX 160",
      description: "Honda PCX 160 için 6'lı rulman seti.",
      price: 320.0,
      stock: 40,
      brand: "Honda",
      categoryId: yedekParca.id,
      images: ["https://picsum.photos/seed/varyator/600/400"],
      fitments: [honda.id],
    },
    {
      slug: "motor-yagi-10w40-1l",
      sku: "YAG-301",
      name: "Motor Yağı 10W-40 (1L)",
      description: "Yarı sentetik motosiklet motor yağı, 1 litre.",
      price: 285.0,
      stock: 100,
      brand: "Motul",
      categoryId: bakim.id,
      images: ["https://picsum.photos/seed/yag/600/400"],
      fitments: [kymco.id, bajaj.id, honda.id],
    },
    {
      slug: "zincir-spreyi-400ml",
      sku: "ZNC-302",
      name: "Zincir Spreyi 400 ml",
      description: "Su geçirmez zincir yağı, tüm motosikletler için uyumlu.",
      price: 150.0,
      stock: 80,
      brand: "Motul",
      categoryId: bakim.id,
      images: ["https://picsum.photos/seed/zincir/600/400"],
      fitments: [bajaj.id, honda.id],
    },
    {
      slug: "fren-hidrolik-dot4",
      sku: "FH-303",
      name: "Fren Hidroliği DOT 4",
      description: "500 ml fren hidroliği, DOT 4 standardı.",
      price: 95.0,
      stock: 0,
      brand: "Castrol",
      categoryId: bakim.id,
      images: ["https://picsum.photos/seed/hidrolik/600/400"],
      fitments: [kymco.id, bajaj.id, honda.id],
    },
    {
      slug: "koruma-demiri-bajaj-pulsar",
      sku: "KOR-401",
      name: "Koruma Demiri - Bajaj Pulsar F 250",
      description: "Çelik koruma demiri, krom kaplama.",
      price: 1850.0,
      stock: 6,
      brand: "Bajaj",
      categoryId: aksesuar.id,
      images: ["https://picsum.photos/seed/koruma/600/400"],
      fitments: [bajaj.id],
      variants: [
        { name: "Renk", value: "Siyah", sku: "KOR-401-BLK" },
        { name: "Renk", value: "Krom", sku: "KOR-401-CHR" },
      ],
    },
    {
      slug: "gidon-agirligi",
      sku: "GDN-402",
      name: "Gidon Ağırlığı (Çift)",
      description: "Universal gidon ağırlığı, titreşim azaltır.",
      price: 220.0,
      stock: 50,
      brand: "Generic",
      categoryId: aksesuar.id,
      images: ["https://picsum.photos/seed/gidon/600/400"],
      variants: [
        { name: "Renk", value: "Siyah" },
        { name: "Renk", value: "Kırmızı" },
        { name: "Renk", value: "Mavi" },
      ],
    },
    {
      slug: "telefon-tutucu-su-gecirmez",
      sku: "TLF-403",
      name: "Telefon Tutucu (Su Geçirmez)",
      description: "Motosiklet için su geçirmez telefon tutucu, 6.7 inç'e kadar.",
      price: 540.0,
      stock: 18,
      brand: "Generic",
      categoryId: aksesuar.id,
      images: ["https://picsum.photos/seed/telefon/600/400"],
    },
    {
      slug: "kask-modular-l",
      sku: "KSK-404",
      name: "Modüler Kask",
      description: "ECE 22.06 sertifikalı modüler kask.",
      price: 3200.0,
      stock: 8,
      brand: "LS2",
      categoryId: aksesuar.id,
      images: ["https://picsum.photos/seed/kask/600/400"],
      variants: [
        { name: "Beden", value: "M", sku: "KSK-404-M" },
        { name: "Beden", value: "L", sku: "KSK-404-L" },
        { name: "Beden", value: "XL", sku: "KSK-404-XL" },
      ],
    },
  ];

  for (const p of products) {
    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        sku: p.sku,
        description: p.description,
        price: p.price,
        stock: p.stock,
        brand: p.brand,
        categoryId: p.categoryId,
      },
      create: {
        slug: p.slug,
        sku: p.sku,
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        brand: p.brand,
        categoryId: p.categoryId,
      },
    });

    // Görseller
    await prisma.productImage.deleteMany({ where: { productId: created.id } });
    for (let i = 0; i < p.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: created.id,
          url: p.images[i],
          alt: p.name,
          position: i,
        },
      });
    }

    // Varyantlar
    if (p.variants) {
      await prisma.productVariant.deleteMany({ where: { productId: created.id } });
      for (const v of p.variants) {
        await prisma.productVariant.create({
          data: {
            productId: created.id,
            name: v.name,
            value: v.value,
            sku: "sku" in v ? v.sku : undefined,
            stock: 5,
          },
        });
      }
    }

    // Fitments
    if (p.fitments) {
      for (const motoId of p.fitments) {
        await prisma.fitment.upsert({
          where: {
            productId_motorcycleId: {
              productId: created.id,
              motorcycleId: motoId,
            },
          },
          update: {},
          create: { productId: created.id, motorcycleId: motoId },
        });
      }
    }
  }

  // Servisler (randevu için)
  const services = [
    {
      slug: "periyodik-bakim",
      name: "Periyodik Bakım",
      description: "Yağ, filtre, fren, balata kontrolü ve değişimi.",
      duration: 90,
      price: 750,
    },
    {
      slug: "yag-degisimi",
      name: "Yağ Değişimi",
      description: "Motor yağı + yağ filtresi değişimi.",
      duration: 30,
      price: 350,
    },
    {
      slug: "lastik-degisimi",
      name: "Lastik Değişimi",
      description: "Ön/arka lastik sökme, takma ve balans.",
      duration: 45,
      price: 250,
    },
    {
      slug: "fren-bakimi",
      name: "Fren Bakımı",
      description: "Balata değişimi, hidrolik kontrolü ve disk yenileme.",
      duration: 60,
      price: 450,
    },
    {
      slug: "genel-kontrol",
      name: "Genel Kontrol",
      description: "Ücretsiz 12 noktalı genel motor kontrolü.",
      duration: 30,
      price: 0,
    },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        description: s.description,
        duration: s.duration,
        price: s.price,
      },
      create: s,
    });
  }

  // Blog yazıları
  const posts = [
    {
      slug: "cvt-sanziman-bakimi-nasil-yapilir",
      title: "CVT Şanzıman Bakımı Nasıl Yapılır?",
      excerpt:
        "CVT scooter sahiplerinin en çok merak ettiği bakım rehberi: kayış değişimi, varyatör temizliği, rulman kontrolü.",
      content: `# CVT Şanzıman Bakımı Nasıl Yapılır?

CVT (Continuously Variable Transmission), günümüz scooter motosikletlerinin yaygın aktarma sistemidir. Doğru bakım, hem güvenliğin hem de performansın anahtarıdır.

## 1. CVT Kayışı

Üretici fabrikası genellikle **15.000 - 20.000 km** arası kayış değişimi öneriyor. Kayışta çatlak, aşınma veya uzama varsa hemen değişmelidir.

## 2. Varyatör Temizliği

Varyatör içinde biriken yağ ve toz, performansı düşürür. **Her 10.000 km'de** bir temizlik yapılmalı, rulmanlar aşınmışsa yeni 6'lı rulman seti takılmalıdır.

## 3. Kasnak Kontrolü

Hem ön (sürücü) hem arka (sürülen) kasnakların yüzeyleri pürüzsüz olmalıdır. Çizik veya derin oyuk varsa yenilenmelidir.

## 4. Tork Değiştirici

Yayın gerginliğini her bakımda kontrol et — yumuşamış yay, hızda çekiş kaybına neden olur.

> 💡 **İpucu:** Bakım sonrası 200 km'lik rodaj sürüşü yap. Düşük devirde, hızla oynama yapmadan motorun sistemleri uyum sağlasın.

CVT bakımını [randevu sistemimizden](/randevu) hemen ayarlayabilirsin.
`,
      coverUrl:
        "https://picsum.photos/seed/cvt-blog/1200/600",
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      slug: "fren-balatasi-ne-zaman-degisir",
      title: "Fren Balatası Ne Zaman Değişir? 5 Belirti",
      excerpt:
        "Fren balatasının ömrü dolduğunda motorunuz size sinyal verir. İşte fark etmeniz gereken 5 önemli belirti.",
      content: `# Fren Balatası Ne Zaman Değişir?

Fren sistemi can güvenliğin doğrudan ilgilendiren parça. İşte balata değişimi gerektiren 5 kritik belirti:

## 1. Cızırtı Sesi

Frene bastığında metal sürtünme sesi geliyorsa, balata aşınmış demektir. Hemen kontrol ettir.

## 2. Fren Mesafesi Uzadı

Aynı hızda durduğunda motor daha geç duruyorsa, balatadaki sürtünme yüzeyi azalmış olabilir.

## 3. Pedal Yumuşadı

Fren koluna bastığında "boşluk" hissediyorsan, sistemde hava kaçağı veya hidrolik problemi olabilir.

## 4. Yan Çekiş

Fren yaparken motor bir tarafa doğru çekiyorsa, balatalardan biri eşit aşınmamış demektir.

## 5. Görsel Kontrol

Balatanın kalan kalınlığı **3 mm'nin altına** düştüyse değişim zamanıdır.

[Bajaj Pulsar F 250 fren balatamız](/urun/fren-balatasi-on-bajaj-pulsar) seramik teknolojisiyle %30 daha uzun ömür sağlıyor.
`,
      coverUrl:
        "https://picsum.photos/seed/balata-blog/1200/600",
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      slug: "kis-bakimi-rehberi",
      title: "Kış Bakımı Rehberi: Motorunu Soğuğa Hazırla",
      excerpt:
        "Soğuk mevsimde motorunun performansını koruması için yapman gereken 6 adım.",
      content: `# Kış Bakımı Rehberi

Kış ayları motorlar için zorludur — düşük sıcaklık, nem, tuz, çamur. Hazırlığı doğru yapmak hem yola güvenle çıkmanı hem de motorun ömrünü uzatır.

## 1. Akü Kontrolü

Soğukta akü kapasitesi %30 düşer. Voltajı 12V altındaysa şarj et veya değiştir.

## 2. Kış Lastiği veya Çapraz Lastik

Yağmur ve karda tutuş çok kritik. Yaz lastikleriyle yola çıkmak risklidir.

## 3. Zincir & Kayış Yağlama

Soğukta yağ donar. Düşük sıcaklığa uygun zincir yağı kullan, **her 500 km'de** kontrol et.

## 4. Antifriz

Su soğutmalı motorlarda antifriz oranını mutlaka kontrol et.

## 5. Lastik Basıncı

Soğukta basınç düşer. Sürüş öncesi mutlaka kontrol et.

## 6. Görünürlük

Far ampullerini kontrol et, gerekirse LED'e yükselt. Kış sürüşü = kısa gün.

Tüm kış bakım malzemelerini [bakım kategorimizden](/kategori/bakim-ve-tamir-urunleri) tek tıkla siparişle.
`,
      coverUrl:
        "https://picsum.photos/seed/kis-blog/1200/600",
      isPublished: true,
      publishedAt: new Date(),
    },
  ];

  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }

  console.log("✅ Seed tamamlandı!");
  console.log(
    `   - 3 kategori, 3 motosiklet, ${products.length} ürün, ${services.length} servis, ${posts.length} blog yazısı eklendi.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
