/**
 * Tüm site genelinde kullanılan iletişim ve marka bilgisi.
 * Telefon, WhatsApp veya adres değişikliklerini SADECE buradan yap.
 */
export const SITE = {
  name: "Galaksi Motor",
  url: "https://galaksimotor.com",
  tagline: "Motorunun tüm ihtiyacı, tek adreste",
  description:
    "Motosiklet yedek parça, aksesuar ve servis. Küçükçekmece İnönü Mahallesi Alp Sokak'taki merkezimizde uzman ekibimizle hizmetinizdeyiz.",

  // Ticari kimlik (yasal sayfalar ve iyzico POS için)
  owner: "Adem İmece",
  taxNo: "4740398598",
  taxOffice: "Küçükçekmece",

  // İletişim
  phone: "+90 553 573 29 29",
  /** WhatsApp için sadece rakam, ülke kodu dahil. */
  whatsapp: "905535732929",
  /** WhatsApp tıklandığında açılacak hazır mesaj */
  whatsappPrefilled: "Merhaba, Galaksi Motor sitesinden ulaşıyorum.",
  email: "info@galaksimotor.com",

  // Adres
  address: {
    line: "İnönü Mahallesi, Alp Sokak No:3-5B",
    district: "Küçükçekmece",
    city: "İstanbul",
    postalCode: "34303",
    country: "TR",
    /** Google Maps gömme URL'i (iframe src) */
    mapEmbed:
      "https://www.google.com/maps?q=İnönü+Mahallesi+Alp+Sokak+No+3+Küçükçekmece+İstanbul&output=embed",
    /** LocalBusiness şeması için koordinatlar (İnönü Mah. Alp Sk., Küçükçekmece) */
    latitude: 41.0089,
    longitude: 28.7747,
  },

  // Çalışma saatleri (randevu sayfası ve iletişimde kullanılır)
  hours: {
    /** Pazartesi-Cuma görüntülenen metin */
    weekdays: "08:30 - 20:00",
    saturday: "08:30 - 20:00",
    sunday: "Kapalı",
    /** Randevu için kullanılan saat aralığı (integer) */
    appointmentStart: 9,
    appointmentEnd: 20,
    appointmentSlotMinutes: 30,
  },

  // Sosyal — Instagram henüz hazır değil, eklendiğinde buraya konur.
  social: {
    facebook: "https://facebook.com/galaksimotor",
    youtube: "https://youtube.com/@galaksimotor",
  },

  // Ticari
  shipping: {
    /** Sabit kargo ücreti (TRY) */
    fee: 49.9,
    /** Bu tutarın üzeri kargo ücretsiz (TRY) */
    freeOver: 1500,
  },
} as const;

export const whatsappLink = (msg?: string) => {
  const text = encodeURIComponent(msg ?? SITE.whatsappPrefilled);
  return `https://wa.me/${SITE.whatsapp}?text=${text}`;
};

/** Ücretsiz kargo eşiğine ne kadar kaldı? */
export const computeShipping = (subtotal: number) => {
  if (subtotal >= SITE.shipping.freeOver) {
    return { fee: 0, free: true, remaining: 0 };
  }
  return {
    fee: SITE.shipping.fee,
    free: false,
    remaining: SITE.shipping.freeOver - subtotal,
  };
};
