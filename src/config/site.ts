/**
 * Tüm site genelinde kullanılan iletişim ve marka bilgisi.
 * Telefon, WhatsApp veya adres değişikliklerini SADECE buradan yap.
 */
export const SITE = {
  name: "Galaksi Motor",
  url: "https://galaksimotor.com",
  tagline: "Motorunun tüm ihtiyacı, tek adreste",
  description:
    "Motosiklet yedek parça, aksesuar ve servis. Küçükçekmece İnönü Mahallesi merkezimizde uzman ekibimizle hizmetinizdeyiz.",

  // İletişim
  phone: "+90 (212) 000 00 00",
  /** WhatsApp için sadece rakam, ülke kodu dahil. ÖRN: 905330000000 */
  whatsapp: "905330000000",
  /** WhatsApp tıklandığında açılacak hazır mesaj */
  whatsappPrefilled: "Merhaba, Galaksi Motor sitesinden ulaşıyorum.",
  email: "info@galaksimotor.com",

  // Adres
  address: {
    line: "İnönü Mahallesi, Atatürk Cd. No:123",
    district: "Küçükçekmece",
    city: "İstanbul",
    postalCode: "34295",
    country: "TR",
    /** Google Maps gömme URL'i (iframe src) */
    mapEmbed:
      "https://www.google.com/maps?q=Küçükçekmece+İnönü+Mahallesi&output=embed",
    /** LocalBusiness şeması için koordinatlar */
    latitude: 41.005,
    longitude: 28.79,
  },

  // Çalışma saatleri (randevu sayfası ve iletişimde kullanılır)
  hours: {
    weekdays: "09:00 - 18:00",
    saturday: "10:00 - 17:00",
    sunday: "Kapalı",
    /** Randevu için kullanılan saat aralığı */
    appointmentStart: 9,
    appointmentEnd: 18,
    appointmentSlotMinutes: 30,
  },

  // Sosyal
  social: {
    instagram: "https://instagram.com/galaksimotor",
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
